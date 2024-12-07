# tournament_manager.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Dict, List, Any
import asyncio
from channels.layers import get_channel_layer
import time

class TournamentManager:
    def __init__(self):
        # Core tournament state
        self.waiting_players: Dict[int, dict] = {}  # {player_id: {channel, name, img}}
        self.active_tournaments: Dict[str, dict] = {}  # {tournament_id: tournament_state}
        self.player_to_tournament: Dict[int, str] = {}  # {player_id: tournament_id}
        
        # Pre-match state
        self.pre_match_rooms: Dict[str, List[dict]] = {}  # {room_id: [player_info]}
        self.countdowns: Dict[str, asyncio.Task] = {}  # {room_id: countdown_task}
        
        # Tournament brackets
        self.tournament_brackets: Dict[str, dict] = {}  # {tournament_id: bracket_info}

    async def add_player(self, player_id: int, channel_name: str, player_info: dict) -> dict:
        """Add player to tournament waiting list"""
        print(f"Adding player to tournament: {player_info['name']} (ID: {player_id})")
        
        # Check if player is already in any state
        if (player_id in self.waiting_players or 
            player_id in self.player_to_tournament or
            any(player_id in [p['id'] for p in room] for room in self.pre_match_rooms.values())):
            return {
                'type': 'tournament_update',
                'status': 'error',
                'message': 'Already in tournament queue'
            }

        # Add to waiting list
        self.waiting_players[player_id] = {
            'channel_name': channel_name,
            'id': player_id,
            'name': player_info['name'],
            'img': player_info['img']
        }
        
        # Notify all waiting players of the updated count
        await self.notify_waiting_players()
        
        # Check if we can start tournament now
        if len(self.waiting_players) >= 4:
            await self.setup_tournament()

        players_needed = 4 - len(self.waiting_players)
        
        # Get initial status response
        response = {
            'type': 'tournament_update',
            'status': 'waiting',
            'message': 'In tournament queue...',
            'position': len(self.waiting_players),
            'players_needed': players_needed
        }
        
        return response

    async def notify_waiting_players(self):
        """Notify all waiting players of current queue status"""
        players_needed = 4 - len(self.waiting_players)
        channel_layer = get_channel_layer()
        
        for player in self.waiting_players.values():
            await channel_layer.send(
                player['channel_name'],
                {
                    'type': 'tournament_update',
                    'status': 'waiting',
                    'message': 'In tournament queue...',
                    'players_needed': players_needed
                }
            )

    async def setup_tournament(self):
        """Create tournament brackets when we have 4 players"""
        if len(self.waiting_players) < 4:
            return False
            
        # Take first 4 players from waiting list
        tournament_players = list(self.waiting_players.items())[:4]
        
        # Generate tournament ID using first player's ID
        tournament_id = f"tournament_{tournament_players[0][0]}_{int(time.time())}"
        
        # Create tournament bracket
        bracket = {
            'round': 1,
            'matches': [
                {
                    'match_id': f"{tournament_id}_m1",
                    'players': [tournament_players[0], tournament_players[1]],
                    'winner': None
                },
                {
                    'match_id': f"{tournament_id}_m2",
                    'players': [tournament_players[2], tournament_players[3]],
                    'winner': None
                }
            ],
            'final_match': {
                'match_id': f"{tournament_id}_final",
                'players': [],
                'winner': None
            }
        }
        
        self.tournament_brackets[tournament_id] = bracket
        
        # Remove players from waiting list
        for player_id, _ in tournament_players:
            if player_id in self.waiting_players:
                del self.waiting_players[player_id]
        
        # Create first round matches
        await self.create_round_matches(tournament_id)
        
        return True

    async def create_round_matches(self, tournament_id: str):
        """Create matches for current tournament round"""
        bracket = self.tournament_brackets[tournament_id]
        current_matches = bracket['matches']
        
        for match in current_matches:
            if not match['winner']:  # Only create matches that haven't been played
                player1, player2 = match['players']
                room_id = f"match_{match['match_id']}"
                
                # Store player info for match
                self.pre_match_rooms[room_id] = [
                    self.waiting_players.get(player1[0]) or player1[1],
                    self.waiting_players.get(player2[0]) or player2[1]
                ]
                
                # Notify players
                await self.notify_pre_match_players(room_id)

    async def notify_pre_match_players(self, room_id: str):
        """Notify all players in a pre-match room about the game formation"""
        players = self.pre_match_rooms[room_id]
        channel_layer = get_channel_layer()
        
        # notify players they're matched
        for player in players:
            opponent = next(p for p in players if p['id'] != player['id'])
            await channel_layer.send(
                player['channel_name'],
                {
                    'type': 'tournament_update',
                    'status': 'pre_match',
                    'message': 'Tournament match forming...',
                    'opponent_name': opponent['name'],
                    'opponent_img': opponent['img'],
                    'players_needed': 0
                }
            )

        print(f"Players in room {room_id} notified about pre-match")
        
        # Start countdown for this room
        countdown_task = asyncio.create_task(
            self.start_pre_match_countdown(room_id)
        )
        self.countdowns[room_id] = countdown_task

    async def start_pre_match_countdown(self, room_id: str, total_time: int = 5):
        """Start countdown for a pre-match room"""
        print(f"Starting countdown for room {room_id}")
        try:
            channel_layer = get_channel_layer()
            players = self.pre_match_rooms[room_id]
            
            for remaining_time in range(total_time, -1, -1):
                # Check if room still exists (not cancelled)
                if room_id not in self.pre_match_rooms:
                    print(f"Room {room_id} no longer exists, stopping countdown")
                    return
                
                # Send countdown update to all players
                for player in players:
                    await channel_layer.send(
                        player['channel_name'],
                        {
                            'type': 'tournament_update',
                            'status': 'countdown',
                            'message': "All players are ready",
                            'time_remaining': remaining_time,
                            'is_countdown': True
                        }
                    )
                await asyncio.sleep(1)
            
            print(f"Countdown finished for room {room_id}")

            # Countdown finished - start the match
            if room_id in self.pre_match_rooms:
                await self.start_match(room_id)
        
        except Exception as e:
            print(f"Error in countdown for room {room_id}: {str(e)}")
            await self.cleanup_pre_match_room(room_id)

    async def start_match(self, room_id: str):
        """Start actual match after countdown finishes"""
        print(f"Starting match for room {room_id}")
        try:
            if room_id not in self.pre_match_rooms:
                return
            
            players = self.pre_match_rooms[room_id]
            channel_layer = get_channel_layer()
            
            # Send match start message to all players
            for player in players:
                opponent = next(p for p in players if p['id'] != player['id'])
                await channel_layer.send(
                    player['channel_name'],
                    {
                        'type': 'tournament_update',
                        'status': 'match_start',
                        'message': "Match starting now!",
                        'opponent_name': opponent['name'],
                        'opponent_img': opponent['img'],
                        'match_number': room_id.split('_')[-1]  # Extract match number
                    }
                )
            
            # Clean up pre-match room
            del self.pre_match_rooms[room_id]
            if room_id in self.countdowns:
                del self.countdowns[room_id]
            
        except Exception as e:
            print(f"Error starting match for room {room_id}: {str(e)}")
            await self.cleanup_pre_match_room(room_id)

    async def cleanup_pre_match_room(self, room_id: str):
        """Clean up a pre-match room and notify players"""
        if room_id in self.pre_match_rooms:
            players = self.pre_match_rooms[room_id]
            channel_layer = get_channel_layer()
            
            # Notify players
            for player in players:
                await channel_layer.send(
                    player['channel_name'],
                    {
                        'type': 'tournament_update',
                        'status': 'error',
                        'message': 'Match setup failed. Please try again.'
                    }
                )
            
            # Clean up room
            del self.pre_match_rooms[room_id]
            if room_id in self.countdowns:
                self.countdowns[room_id].cancel()
                del self.countdowns[room_id]

    async def process_match_result(self, tournament_id: str, winner_id: int, loser_id: int):
        """Process match result and set up next round if needed"""
        bracket = self.tournament_brackets[tournament_id]
        
        # Find and update the match with the result
        current_match = None
        for match in bracket['matches']:
            if winner_id in [p[0] for p in match['players']]:
                current_match = match
                match['winner'] = winner_id
                break
        
        if not current_match:
            return
        
        # Check if round is complete
        if all(match['winner'] for match in bracket['matches']):
            # Set up final match
            winners = [match['winner'] for match in bracket['matches']]
            bracket['round'] = 2
            bracket['final_match']['players'] = winners
            
            # Create final match
            await self.create_final_match(tournament_id)

    async def create_final_match(self, tournament_id: str):
        """Create the final match of the tournament"""
        bracket = self.tournament_brackets[tournament_id]
        final = bracket['final_match']
        
        room_id = f"match_{final['match_id']}"
        player_info = []
        
        # Get player info for both finalists
        for player_id in final['players']:
            for match in bracket['matches']:
                for p in match['players']:
                    if p[0] == player_id:
                        player_info.append(p[1])
                        break
        
        self.pre_match_rooms[room_id] = player_info
        await self.notify_pre_match_players(room_id)

    async def handle_pre_match_leave(self, room_id: str, player_id: int):
        """Handle player leaving during pre-match phase"""
        if room_id not in self.pre_match_rooms:
            return
            
        # Get all players from all pre-match rooms related to this tournament
        tournament_id = room_id.split('_')[1]  # Extract tournament ID
        all_tournament_rooms = [r_id for r_id in self.pre_match_rooms.keys() 
                              if tournament_id in r_id]
        all_players = []
        for r_id in all_tournament_rooms:
            all_players.extend(self.pre_match_rooms[r_id])

        # Cancel all countdowns
        for r_id in all_tournament_rooms:
            if r_id in self.countdowns:
                self.countdowns[r_id].cancel()
                del self.countdowns[r_id]

        # Return all remaining players to waiting list
        for player in all_players:
            if player['id'] != player_id:  # Don't add the leaving player back
                self.waiting_players[player['id']] = player

        # Notify all remaining players
        channel_layer = get_channel_layer()
        for player in all_players:
            if player['id'] != player_id:
                await channel_layer.send(
                    player['channel_name'],
                    {
                        'type': 'tournament_update',
                        'status': 'waiting',
                        'message': 'A player left. Waiting for new players...',
                        'players_needed': 4 - len(self.waiting_players)
                    }
                )

        # Clean up all tournament rooms
        for r_id in all_tournament_rooms:
            if r_id in self.pre_match_rooms:
                del self.pre_match_rooms[r_id]

        # Clean up tournament bracket if it exists
        if tournament_id in self.tournament_brackets:
            del self.tournament_brackets[tournament_id]

        # Attempt to create new matches if possible
        if len(self.waiting_players) >= 4:
            await self.setup_tournament()

    async def remove_player(self, player_id: int) -> dict:
        """Remove player from any tournament state"""
        # Remove from waiting list if present
        if player_id in self.waiting_players:
            del self.waiting_players[player_id]
            # Notify remaining waiting players of updated count
            await self.notify_waiting_players()
            return {
                'type': 'tournament_update',
                'status': 'cancelled',
                'message': 'Successfully left tournament queue'
            }

        # Check pre-match rooms
        room_id = self.find_player_pre_match(player_id)
        if room_id:
            await self.handle_pre_match_leave(room_id, player_id)
            return {
                'type': 'tournament_update',
                'status': 'cancelled',
                'message': 'Successfully left tournament match'
            }

        return {
            'type': 'tournament_update',
            'status': 'error',
            'message': 'Player not found in tournament'
        }

    def find_player_pre_match(self, player_id: int) -> str:
        """Find which pre-match room a player is in"""
        for room_id, players in self.pre_match_rooms.items():
            if any(p['id'] == player_id for p in players):
                return room_id
        return None

    async def send_to_player(self, channel_name: str, message: dict):
        """Helper method to send message to a player through the channel layer"""
        channel_layer = get_channel_layer()
        await channel_layer.send(channel_name, {
            'type': 'send_json',
            'data': message
        })