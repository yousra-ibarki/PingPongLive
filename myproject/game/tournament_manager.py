# tournament_manager.py

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Dict, List, Any
import asyncio

class TournamentManager:
    """
    Manages tournament state and logic separately from the main game consumer
    """
    def __init__(self):
        # Core tournament state
        self.waiting_players: Dict[int, dict] = {}  # {player_id: {channel, name, img}}
        self.active_tournaments: Dict[str, dict] = {}  # {tournament_id: tournament_state}
        self.player_to_tournament: Dict[int, str] = {}  # {player_id: tournament_id}
        
        # Pre-match state
        self.pre_match_rooms: Dict[str, List[dict]] = {}  # {room_id: [player_info]}
        self.countdowns: Dict[str, asyncio.Task] = {}  # {room_id: countdown_task}

    # In tournament_manager.py
    async def add_player(self, player_id: int, channel_name: str, player_info: dict) -> dict:
        """Add player to tournament waiting list"""
        print(f"Adding player to tournament: {player_info['name']} (ID: {player_id})")
        
        # Check if player is already in any state
        if (player_id in self.waiting_players or 
            player_id in self.player_to_tournament or
            any(player_id in [p['id'] for p in room] for room in self.pre_match_rooms.values())):
            return {
                'type': 'error',
                'message': 'Already in tournament queue'
            }
        
        print(f"the waiting list [BEFORE] {self.waiting_players}")
        # Add to waiting list
        self.waiting_players[player_id] = {
            'channel_name': channel_name,
            'id': player_id,  # Include ID for easier lookup
            'name': player_info['name'],
            'img': player_info['img']
        }
        
        print(f"the waiting list [AFTER] {self.waiting_players}")
        # Get initial status response
        response = {
            'type': 'tournament_update',
            'status': 'waiting',
            'message': 'Waiting for more players...',
            'position': len(self.waiting_players),
            'players_needed': 2 - len(self.waiting_players)  # For testing with 2 players
        }

        # Check if we can create a pre-match now that we've added this player
        if len(self.waiting_players) >= 2:
            await self.check_and_create_pre_match()
    
        return response

    async def check_and_create_pre_match(self) -> bool:
        """
        Check if we have enough players to create a pre-match room
        Returns True if pre-match was created
        """
        if len(self.waiting_players) < 2:  # Adjust number for testing
            return False
            
        # Take first 2 players from waiting list
        selected_players = list(self.waiting_players.items())[:2]
        
        # Create unique room name based on player IDs
        player_ids = [player_id for player_id, _ in selected_players]
        room_id = f"pre_match_{min(player_ids)}_{max(player_ids)}"
        
        # Move players to pre-match room
        room_players = []
        for player_id, player_info in selected_players:
            # Remove from waiting list
            del self.waiting_players[player_id]
            
            # Add to pre-match list with status
            player_info['status'] = 'ready'
            player_info['id'] = player_id
            room_players.append(player_info)

        # Store pre-match room
        self.pre_match_rooms[room_id] = room_players
        print(f"Created pre-match room {room_id} with players: {[p['name'] for p in room_players]}")

        # Notify all players in room
        await self.notify_pre_match_players(room_id)
        
        return True

    async def notify_pre_match_players(self, room_id: str):
        """Notify all players in a pre-match room about the game formation"""
        players = self.pre_match_rooms[room_id]
        
        for player in players:
            # Get opponent info for this player
            opponent = next(p for p in players if p['id'] != player['id'])
            
            # Send status update to this player
            await self.send_to_player(player['channel_name'], {
                'type': 'tournament_update',
                'status': 'pre_match',
                'message': 'Tournament match forming...',
                'opponent_name': opponent['name'],  # Send opponent's name
                'opponent_img': opponent['img'],    # Send opponent's image
                'players_needed': 0                 # No more players needed
            })

    async def send_to_player(self, channel_name: str, message: dict):
        """Helper method to send message to a player through the channel layer"""
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        
        await channel_layer.send(channel_name, {
            'type': 'send_tournament_update',
            'data': message
        })


    # *****************************************************************************


    async def remove_player(self, player_id: int) -> dict:
        """Remove player from any tournament state"""
        # Remove from waiting list if present
        if player_id in self.waiting_players:
            del self.waiting_players[player_id]
            return {'type': 'removed', 'state': 'waiting'}
            
        # Handle pre-match removal
        room_id = self.find_player_pre_match(player_id)
        if room_id:
            await self.handle_pre_match_leave(room_id, player_id)
            return {'type': 'removed', 'state': 'pre_match'}
            
        # Handle active tournament removal
        tournament_id = self.player_to_tournament.get(player_id)
        if tournament_id:
            await self.handle_tournament_leave(tournament_id, player_id)
            return {'type': 'removed', 'state': 'tournament'}
            
        return {'type': 'error', 'message': 'Player not found in any state'}

    def find_player_pre_match(self, player_id: int) -> str:
        """Find which pre-match room a player is in"""
        for room_id, players in self.pre_match_rooms.items():
            if any(p['id'] == player_id for p in players):
                return room_id
        return None

    async def handle_pre_match_leave(self, room_id: str, player_id: int):
        """Handle player leaving pre-match state"""
        pass  # Implementation to follow

    async def handle_tournament_leave(self, tournament_id: str, player_id: int):
        """Handle player leaving active tournament"""
        pass  # Implementation to follow

    async def create_pre_match(self):
        """Create a pre-match room from waiting players"""
        pass  # Implementation to follow

    async def start_tournament(self, room_id: str):
        """Start tournament when pre-match is ready"""
        pass  # Implementation to follow

    async def cleanup_tournament(self, tournament_id: str):
        """Clean up tournament resources"""
        pass  # Implementation to follow