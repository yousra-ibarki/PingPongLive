# tournament_manager.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Dict, List, Any
import asyncio
from channels.layers import get_channel_layer
import time
from channels.db import database_sync_to_async
from myapp.models import Achievement

class TournamentManager:
    def __init__(self):
        # Core tournament state
        self.waiting_players: Dict[int, dict] = {}  # {player_id: {channel, name, img}}
        self.player_join_order: List[int] = []  # [player_id]
        self.active_tournaments: Dict[str, dict] = {}  # {tournament_id: tournament_state}
        self.player_to_tournament: Dict[int, str] = {}  # {player_id: tournament_id}
        
        # Pre-match state
        self.pre_match_rooms: Dict[str, List[dict]] = {}  # {room_id: [player_info]}
        self.countdowns: Dict[str, asyncio.Task] = {}  # {room_id: countdown_task}
        
        # Tournament brackets
        self.tournament_brackets: Dict[str, dict] = {}  # {tournament_id: bracket_info}

        # Match state
        self.match_scores = {}  # {match_id: {player_id: score}}
        self.started_matches = set()  # {match_id} # tracking matches that have passed the countdown phase

        self.state = "lost"

        self.lock = asyncio.Lock()
        game_start_lock = asyncio.Lock()


    async def add_player(self, player_id: int, channel_name: str, player_info: dict) -> dict:
        """Add player to tournament waiting list"""
        print(f"Adding player to tournament: {player_info['name']} (ID: {player_id})")
        print(f"===> Player info: {player_info}")
        # Check if player is already in any state
        if player_id in self.waiting_players:
            players_needed = 4 - len(self.waiting_players)
            print(f"Player {player_id} already in waiting list")
            return {
                'type': 'tournament_update',
                'status': 'waiting',
                'message': 'Tournament queue...',
                'position': len(self.waiting_players),
                'players_needed': players_needed
            }

        # Check pre-match rooms
        for room_id, players in self.pre_match_rooms.items():
            if any(p['id'] == player_id for p in players):
                # Get opponent info
                player_info = next(p for p in players if p['id'] == player_id)
                opponent = next(p for p in players if p['id'] != player_id)
                return {
                    'type': 'tournament_update',
                    'status': 'pre_match',
                    'message': 'Tournament match forming...',
                    'matches': [room_id],
                    'opponent_name': opponent['name'],
                    'opponent_img': opponent['img'],
                    'players_needed': 0
                }

        # Add to waiting list
        self.waiting_players[player_id] = {
            'channel_name': channel_name,
            'id': player_id,
            'name': player_info['name'],
            'img': player_info['img']
        }

        print("waiting players ==> ", self.waiting_players)

        if player_id not in self.player_join_order:
            self.player_join_order.append(player_id)

        # Notify all waiting players of the updated count
        await self.notify_waiting_players()

        # Check if we can form new tournaments
        await self.check_waiting_list()

        players_needed = 4 - len(self.waiting_players)
        ordered_players = [
            self.waiting_players[player_id]
            for player_id in self.player_join_order
            if player_id in self.waiting_players
        ]

        return {
            'type': 'tournament_update',
            'status': 'waiting',
            'message': 'Tournament queue...',
            'position': len(self.waiting_players),
            'players_needed': players_needed,
            'current_players': [
                {
                    'id': p['id'],
                    'name': p['name'],
                    'img': p['img'],
                    'position': idx
                }
                for idx, p in enumerate(ordered_players)
            ]
        }

    async def notify_waiting_players(self):
        """Notify all waiting players of current queue status"""
        players_needed = 4 - len(self.waiting_players)
        channel_layer = get_channel_layer()

        ordered_players = [
            self.waiting_players[player_id]
            for player_id in self.player_join_order
            if player_id in self.waiting_players
        ]


        for player in self.waiting_players.values():
            await channel_layer.send(
                player['channel_name'],
                {
                    'type': 'tournament_update',
                    'status': 'waiting',
                    'players': list(self.waiting_players.values()),
                    'message': 'Tournament queue...',
                    'players_needed': players_needed,
                    'current_players': [
                        {
                            'id': p['id'],
                            'name': p['name'],
                            'img': p['img'],
                            'position': idx
                        }
                        for idx, p in enumerate(ordered_players)
                    ]
                }
            )

    async def setup_tournament(self):
        print("Setting up tournament [[111]]")
        """Create tournament brackets when we have 4 players"""
        if len(self.waiting_players) < 4:
            return False
        print("Setting up tournament [[222]]")
        # Take first 4 players from waiting list
        tournament_players = list(self.waiting_players.items())[:4]
        
        # Generate tournament ID using first player's ID
        tournament_id = f"tournament_{tournament_players[0][0]}_{int(time.time())}"

        # Fetch ranks and sort players by rank
        ranked_players = []
        for player_id, player_info in tournament_players:
            user = await self.get_user_async(player_id)
            rank = user.rank if user else 0
            ranked_players.append((player_id, player_info, rank))
        
        # Sort by rank (highest to lowest)
        ranked_players.sort(key=lambda x: -x[2])  # Sort by rank (third element)
        
        # Create tournament bracket with #1 vs #4, #2 vs #3
        bracket = {
            'round': 1,
            'matches': [
                {
                    'match_id': f"{tournament_id}_m1",
                    'players': [
                        {'id': ranked_players[0][0],'position': 'left', 'info': ranked_players[0][1]},  # #1 seed
                        {'id': ranked_players[3][0],'position': 'right', 'info': ranked_players[3][1]}   # #4 seed
                    ],
                    'winner': None
                },
                {
                    'match_id': f"{tournament_id}_m2",
                    'players': [
                        {'id': ranked_players[1][0],'position': 'left', 'info': ranked_players[1][1]},  # #2 seed
                        {'id': ranked_players[2][0],'position': 'right', 'info': ranked_players[2][1]}   # #3 seed
                    ],
                    'winner': None
                }
            ],
            'final_match': {
                'match_id': f"{tournament_id}_final",
                'players': [],
                'winner': None
            }
        }

        print("Setting up tournament [[333]]")
        
        self.tournament_brackets[tournament_id] = bracket
        
        # Remove players from waiting list
        for player_id, _ in tournament_players:
            if player_id in self.waiting_players:
                del self.waiting_players[player_id]
        
        # Create first round matches
        await self.create_round_matches(tournament_id)
        
        return True

    @staticmethod
    async def get_user_async(user_id):
        """Helper method to fetch user asynchronously"""
        try:
            from django.contrib.auth import get_user_model
            from channels.db import database_sync_to_async
            
            User = get_user_model()
            
            @database_sync_to_async
            def get_user(uid):
                try:
                    return User.objects.get(id=uid)
                except User.DoesNotExist:
                    return None
                
            return await get_user(user_id)
        except Exception as e:
            print(f"[get_user_async] Error fetching user {user_id}: {e}")
            return None

    async def create_round_matches(self, tournament_id: str):
        print("Creating round matches")
        """Create matches for current tournament round"""
        bracket = self.tournament_brackets[tournament_id]
        current_matches = bracket['matches']
        
        for match in current_matches:
            if not match['winner']:  # Only create matches that haven't been played
                player1, player2 = match['players']
                room_id = f"match_{match['match_id']}"

                # Store player info for match
                self.pre_match_rooms[room_id] = [
                    self.waiting_players.get(player1['id']) or player1['info'],
                    self.waiting_players.get(player2['id']) or player2['info']
                ]
                
                # Notify players
                print(f"=====> OOOOOOOO [create_round_matches] Notifying players in room {room_id}")
                await self.notify_pre_match_players(room_id)

    async def notify_pre_match_players(self, room_id: str):
        """Notify all players in a pre-match room about the game formation"""
        if room_id not in self.pre_match_rooms:
            print(f"[notify_pre_match_players] Room {room_id} not found")
            return

        players = self.pre_match_rooms[room_id]
        channel_layer = get_channel_layer()
        
        print(f"[notify_pre_match_players] Notifying players in room {room_id}")

        # Get tournament ID from room ID to find all related matches
        tournament_id = self.get_tournament_id_from_room(room_id)
        tournament_rooms = [
            r_id for r_id in self.pre_match_rooms.keys() 
            if self.get_tournament_id_from_room(r_id) == tournament_id
        ]

        all_tournament_players = []
        for t_room in tournament_rooms:
            all_tournament_players.extend(self.pre_match_rooms[t_room])

        room_players = self.pre_match_rooms[room_id]

        # notify players they're matched
        for player in players:
            opponent = next(p for p in players if p['id'] != player['id'])
            print(f"[notify_pre_match_players] Notifying player {player['id']} about opponent {opponent['id']}")
            await channel_layer.send(
                player['channel_name'],
                {
                    'type': 'tournament_update',
                    'status': 'pre_match',
                    'message': 'Tournament match forming...',
                    'opponent_name': opponent['name'],
                    'opponent_img': opponent['img'],
                    'players_needed': 0,
                    'current_players': [
                        {
                            'id': p['id'],
                            'name': p['name'],
                            'img': p['img'],
                            'position': idx
                        }
                        for idx, p in enumerate(all_tournament_players)
                    ]
                }
            )
        
        # Start countdown for this room
        print(f"[notify_pre_match_players] Starting countdown for room {room_id}")
        countdown_task = asyncio.create_task(
            self.start_pre_match_countdown(room_id)
        )
        self.countdowns[room_id] = countdown_task

    async def start_pre_match_countdown(self, room_id: str, total_time: int = 15):
        """Start countdown for a pre-match room"""
        print(f"[start_pre_match_countdown] Starting countdown for room {room_id}")
        try:
            channel_layer = get_channel_layer()
            
            # Verify room still exists
            if room_id not in self.pre_match_rooms:
                print(f"[start_pre_match_countdown] Room {room_id} no longer exists")
                return
                
            # Get tournament ID from room ID to find all related matches
            tournament_id = self.get_tournament_id_from_room(room_id)
            tournament_rooms = [
                r_id for r_id in self.pre_match_rooms.keys() 
                if self.get_tournament_id_from_room(r_id) == tournament_id
            ]

            all_tournament_players = []
            for t_room in tournament_rooms:
                all_tournament_players.extend(self.pre_match_rooms[t_room])
            
            players = self.pre_match_rooms[room_id]

            for remaining_time in range(total_time, -1, -1):
                # Check if room still exists (not cancelled)
                if room_id not in self.pre_match_rooms:
                    print(f"[start_pre_match_countdown] Room {room_id} no longer exists, stopping countdown")
                    return
                
                print(f"[start_pre_match_countdown] Room {room_id} countdown: {remaining_time}")
                
                # Send countdown update to all players in this room only
                for player in players:
                    room_players = self.pre_match_rooms[room_id]
                    await channel_layer.send(
                        player['channel_name'],
                        {
                            'type': 'tournament_update',
                            'status': 'countdown',
                            'message': "All players are ready",
                            'time_remaining': remaining_time,
                            'is_countdown': True,
                            'room_name': room_id,
                            'current_players': [
                                {
                                    'id': p['id'],
                                    'name': p['name'],
                                    'img': p['img'],
                                    'position': idx
                                }
                                for idx, p in enumerate(all_tournament_players)
                            ]
                        }
                    )
                await asyncio.sleep(1)
            
            if room_id in self.pre_match_rooms:
                self.started_matches.add(room_id)

            print(f"[start_pre_match_countdown] Countdown finished for room {room_id}")

            # await self.send_tournament_match_end(room_id, players[0]['id'])
            # return

            # Get all tournament rooms that need to start games
            # tournament_id = self.get_tournament_id_from_room(room_id)
            # tournament_rooms = [
            #     r_id for r_id in self.pre_match_rooms.keys() 
            #     if self.get_tournament_id_from_room(r_id) == tournament_id
            # ]

            # # Start game for each room
            # for match_room_id in tournament_rooms:
            #     try:
            #         room_players = self.pre_match_rooms[match_room_id]
            #         player1 = room_players[0]
            #         player2 = room_players[1]
                    
            #         print(f"[tournament_start] Starting game for room {match_room_id}")
            #         print(f"[tournament_start] Players: {player1['name']} vs {player2['name']}")

            #         content = {
            #             'player_ready1': player1['id'],
            #             'player_ready1_name': player1['name'],
            #             'player_ready1_img': player1['img'],
            #             'player_ready2': player2['id'],
            #             'player_ready2_name': player2['name'],
            #             'player_ready2_img': player2['img'],
            #             'room_name': match_room_id,
            #             'canvas_width': 800,
            #             'canvas_height': 600,
            #             'mode': 'tournament'
            #         }

            #         # Keep a copy of pre_match_room data
            #         room_data = self.pre_match_rooms[match_room_id].copy()
                    
            #         print(f"[tournament_start] Calling handle_play_msg for room {match_room_id}")
                    
            #         channel_layer = get_channel_layer()
            #         await channel_layer.send(player['channel_name'], {
            #             'type': 'receive_json',
            #             'content': {
            #                 'type': 'tournament_game_start',
            #                 'content': content
            #             }
            #         })
                    
            #         print(f"[tournament_start] Game started for room {match_room_id}")

            #     except Exception as e:
            #         print(f"[tournament_start] Error starting game for room {match_room_id}: {e}")

            print("[tournament_start] All games should be started")
                    
        except Exception as e:
            print(f"[start_pre_match_countdown] Error in countdown for room {room_id}: {str(e)}")
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

    def get_tournament_id_from_room(self, room_id: str) -> str:
        """Extract full tournament ID from room ID"""
        parts = room_id.split('_')
        
        # Handle different room ID formats
        if parts[0] == "tournament":
            # If it's already a tournament ID format (tournament_1_1735953003_final)
            return f"{parts[0]}_{parts[1]}_{parts[2]}"
        elif len(parts) >= 4 and parts[0] == "match" and parts[1] == "tournament":
            # Handle match_tournament_X_Y format
            return f"tournament_{parts[2]}_{parts[3]}"
            
        print(f"[get_tournament_id_from_room] Unrecognized room ID format: {room_id}")
        return None

    async def handle_pre_match_leave(self, room_id: str, player_id: int):
        """Handle player leaving during pre-match phase with improved error handling"""
        try:
            if room_id not in self.pre_match_rooms:
                print(f"[handle_pre_match_leave] Room {room_id} not found")
                return

            tournament_id = self.get_tournament_id_from_room(room_id)
            if not tournament_id:
                print(f"[handle_pre_match_leave] Invalid room ID format: {room_id}")
                return
            
            print(f"[handle_pre_match_leave] Processing leave for tournament {tournament_id}")
            
            # Get rooms from this specific tournament
            current_tournament_rooms = [
                r_id for r_id in self.pre_match_rooms.keys() 
                if self.get_tournament_id_from_room(r_id) == tournament_id
            ]
            
            print(f"[handle_pre_match_leave] Tournament rooms: {current_tournament_rooms}")
            print(f"[handle_pre_match_leave] Waiting players count: {len(self.waiting_players)}")

            # Cancel all countdowns first
            for tournament_room_id in current_tournament_rooms:
                if tournament_room_id in self.countdowns:
                    print(f"[handle_pre_match_leave] Cancelling countdown for room {tournament_room_id}")
                    try:
                        countdown_task = self.countdowns[tournament_room_id]
                        countdown_task.cancel()
                        await countdown_task
                    except asyncio.CancelledError:
                        print(f"[handle_pre_match_leave] Countdown cancelled for {tournament_room_id}")
                    except Exception as e:
                        print(f"[handle_pre_match_leave] Error cancelling countdown: {e}")
                    finally:
                        del self.countdowns[tournament_room_id]
            
            # Try to get replacement from waiting list
            if self.waiting_players and self.player_join_order:
                print("[handle_pre_match_leave] Found waiting players, attempting replacement")
                try:
                    # Safely get first waiting player
                    first_waiting_id = None
                    for pid in self.player_join_order:
                        if pid in self.waiting_players:
                            first_waiting_id = pid
                            break
                    
                    if first_waiting_id is None:
                        raise Exception("No valid waiting players found")
                    
                    replacement_info = self.waiting_players.pop(first_waiting_id)
                    self.player_join_order.remove(first_waiting_id)
                    replacement_id = first_waiting_id

                    # Notify remaining waiting players
                    await self.notify_waiting_players()

                    # Update the room with replacement
                    if room_id in self.pre_match_rooms:
                        current_players = self.pre_match_rooms[room_id]
                        new_players = [p for p in current_players if p['id'] != player_id]
                        new_players.append({
                            'id': replacement_id,
                            **replacement_info
                        })
                        
                        print(f"[handle_pre_match_leave] Replacing player {player_id} with {replacement_id}")
                        self.pre_match_rooms[room_id] = new_players

                        # Restart countdowns
                        for tournament_room_id in current_tournament_rooms:
                            if tournament_room_id in self.pre_match_rooms:
                                print(f"[handle_pre_match_leave] Restarting countdown for room {tournament_room_id}")
                                await self.notify_pre_match_players(tournament_room_id)
                    else:
                        raise Exception("Room no longer exists")
                    
                except Exception as e:
                    print(f"[handle_pre_match_leave] Error during replacement: {e}")
                    await self.cleanup_tournament(tournament_id, current_tournament_rooms, player_id)
            else:
                print("[handle_pre_match_leave] No waiting players available, cleaning up tournament")
                await self.cleanup_tournament(tournament_id, current_tournament_rooms, player_id)

        except Exception as e:
            print(f"[handle_pre_match_leave] Unexpected error: {e}")
            if tournament_id:
                await self.cleanup_tournament(tournament_id, current_tournament_rooms, player_id)

    async def cleanup_tournament(self, tournament_id: str, tournament_rooms: List[str], leaving_player_id: int):
        """Clean up tournament state when a player leaves"""
        try:
            # Collect affected players
            affected_players = []
            for room_id in tournament_rooms:
                if room_id in self.pre_match_rooms:
                    room_players = self.pre_match_rooms[room_id]
                    new_affected = [p for p in room_players if p['id'] != leaving_player_id]
                    affected_players.extend(new_affected)

                    # Clean up room
                    del self.pre_match_rooms[room_id]

            # Clean up tournament bracket
            if tournament_id in self.tournament_brackets:
                del self.tournament_brackets[tournament_id]

            # Reset and update waiting list
            self.player_join_order = []
            for player in affected_players:
                self.waiting_players[player['id']] = player
                self.player_join_order.append(player['id'])

            # Notify affected players
            channel_layer = get_channel_layer()
            for player in affected_players:
                try:
                    await channel_layer.send(
                        player['channel_name'],
                        {
                            'type': 'tournament_update',
                            'status': 'waiting',
                            'message': 'A player left. Returning to queue...',
                            'players_needed': 4 - len(self.waiting_players),
                            'current_players': [
                                {
                                    'id': p['id'],
                                    'name': p['name'],
                                    'img': p['img'],
                                    'position': idx
                                }
                                for idx, p in enumerate(
                                    [self.waiting_players[pid] for pid in self.player_join_order]
                                )
                            ]
                        }
                    )
                except Exception as e:
                    print(f"[cleanup_tournament] Error notifying player {player['id']}: {e}")

            # Check for new tournament formation
            if len(self.waiting_players) >= 4:
                await self.setup_tournament()

        except Exception as e:
            print(f"[cleanup_tournament] Error during cleanup: {e}")

    async def check_waiting_list(self):
        """Check if we can form new tournaments from waiting list"""
        if len(self.waiting_players) >= 4:
            await self.setup_tournament()

    async def remove_player(self, player_id: int) -> dict:
        """Remove player from any tournament state with atomic operations"""
        async with self.lock:
            try:
                # Remove from waiting list if present
                print(f"Removing player {player_id} from waiting list")
                if player_id in self.waiting_players:
                    if player_id in self.player_join_order:
                        self.player_join_order.remove(player_id)
                    self.waiting_players.pop(player_id)
                    await self.notify_waiting_players()
                    await self.check_waiting_list()
                    return {
                        'type': 'tournament_update',
                        'status': 'cancelled',
                        'message': 'Successfully left tournament queue',
                        'current_players': []
                    }

                # Check pre-match rooms
                room_id = self.find_player_pre_match(player_id)
                if room_id:
                    print(f"Player {player_id} found in room {room_id}")
                    if room_id not in self.started_matches:
                        await self.handle_pre_match_leave(room_id, player_id)
                        return {
                            'type': 'tournament_update',
                            'status': 'cancelled',
                            'message': 'Successfully left pre-match',
                            'current_players': []
                        }
                    else:
                        return {
                            'type': 'tournament_update',
                            'status': 'error',
                            'message': 'Cannot leave match in progress'
                        }

                return {
                    'type': 'tournament_update',
                    'status': 'error',
                    'message': 'Player not found in tournament'
                }
                
            except Exception as e:
                print(f"Error removing player {player_id}: {str(e)}")
                return {
                    'type': 'tournament_update',
                    'status': 'error',
                    'message': f'Error processing request: {str(e)}'
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
    
# ************************** Handling In Game Events **************************



    # async def update_score(self, match_id: str, scorer_id: int):
    #     """Handle score updates during match"""
    #     if match_id not in self.match_scores:
    #         return None
            
    #     # Update score
    #     self.match_scores[match_id][scorer_id] += 1
    #     scores = self.match_scores[match_id]
        
    #     # Check for match completion
    #     is_complete = any(score >= 7 for score in scores.values())
    #     response = {
    #         'scores': scores,
    #         'is_complete': is_complete
    #     }
        
    #     if is_complete:
    #         winner_id = max(scores.items(), key=lambda x: x[1])[0]
    #         response['winner_id'] = winner_id
    #         await self.end_match(match_id)
            
    #     return response


    async def send_tournament_match_end(self, room_name: str, winner_id: int):
        """Simulates end of tournament match after countdown"""
        try:
            print(f"[send_tournament_match_end] Starting 5-second wait for room {room_name}")
            await asyncio.sleep(7)  # Wait 7 seconds after countdown

            # Get channel layer
            channel_layer = get_channel_layer()
            
            if room_name in self.pre_match_rooms:
                print(f"[send_tournament_match_end] Processing match end for room {room_name}")
                
                # Send to room group
                await channel_layer.group_send(
                    room_name,  # This is the room group name
                    {
                        'type': 't_match_end',  # This should match a method in consumer
                        'winner_id': winner_id,
                        'match_id': room_name
                    }
                )

                # Process the match end
                await self.end_match(room_name, winner_id)

        except Exception as e:
            print(f"[send_tournament_match_end] Error: {str(e)}")
            if room_name in self.pre_match_rooms:
                await channel_layer.group_send(
                    room_name,
                    {
                        'type': 'tournament_error',
                        'message': f'Error ending tournament match: {str(e)}'
                    }
                )

    async def notify_tournament_ends(self, tournament_id: str):
        """Notify all players of tournament completion"""
        bracket = self.tournament_brackets[tournament_id]
        final_match = bracket['final_match']
        winner_id = final_match['winner']
        
        # Notify all players
        channel_layer = get_channel_layer()
        for player_id in self.player_to_tournament:
            channel_name = self.waiting_players[player_id]['channel_name']
            await channel_layer.send(
                channel_name,
                {
                    'type': 'tournament_update',
                    'status': 'complete',
                    'message': 'Tournament complete!',
                    'winner_id': winner_id
                }
            )

    async def handle_tournament_completion(self, tournament_id: str, winner_id: int):
        """Handle cleanup and notifications when tournament is complete"""
        try:
            # Get winner info
            winner_info = None
            bracket = self.tournament_brackets[tournament_id]
            for match in bracket['matches']:
                for player in match['players']:
                    if player['id'] == winner_id:
                        winner_info = player['info']
                        break
                if winner_info:
                    break
                    
            # Only notify the winner
            if winner_info and winner_info.get('channel_name'):
                channel_layer = get_channel_layer()
                await channel_layer.send(
                    winner_info['channel_name'],
                    {
                        'type': 'tournament_update',
                        'status': 'complete',
                        'message': 'Congratulations! You won the tournament!',
                        'winner_id': winner_id,
                        'winner_name': winner_info['name'],
                        'winner_img': winner_info['img']
                    }
                )
                    
            # Cleanup tournament data
            if tournament_id in self.tournament_brackets:
                del self.tournament_brackets[tournament_id]
                
        except Exception as e:
            print(f"Error in handle_tournament_completion: {str(e)}")

    async def notify_tournament_error(self, match_id: str, error_msg: str):
        """Notify players in a match about an error"""
        try:
            if match_id in self.pre_match_rooms:
                players = self.pre_match_rooms[match_id]
                channel_layer = get_channel_layer()
                
                for player in players:
                    await channel_layer.send(
                        player['channel_name'],
                        {
                            'type': 'tournament_update',
                            'status': 'error',
                            'message': f'Tournament error: {error_msg}'
                        }
                    )
        except Exception as e:
            print(f"Error in notify_tournament_error: {str(e)}")

    def get_all_tournament_players(self, tournament_id: str) -> list:
        """Get all players participating in a tournament"""
        players = []
        if tournament_id in self.tournament_brackets:
            bracket = self.tournament_brackets[tournament_id]
            # Get players from first round matches
            for match in bracket['matches']:
                players.extend(match['players'])
        return players


    # <<<<<<<<<<<<<<<<<<<<<<<<<<< Tournament end >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    async def end_match(self, match_id: str, winner_id: int, leaver: bool):
        """Handle match completion and advance tournament if needed"""
        try:
            print(f"[end_match] Processing match end. Match ID: {match_id}, Winner ID: {winner_id}, Leaver: {leaver}")
            
            tournament_id = self.get_tournament_id_from_room(match_id)
            if not tournament_id or tournament_id not in self.tournament_brackets:
                print(f"[end_match] Invalid tournament/match ID: {match_id}")
                return

            bracket = self.tournament_brackets[tournament_id]
            match_parts = match_id.split('_')
            match_suffix = match_parts[-1]  
            channel_layer = get_channel_layer()

            # If there's a leaver, find the other player and make them the winner
            if leaver:
                print(f"[end_match] Player {winner_id} left the match. Finding opponent...")
                # Find the current match in the bracket
                current_match = None
                if match_suffix == "final":
                    current_match = bracket['final_match']
                else:
                    current_match = next((m for m in bracket['matches'] if m['match_id'].endswith(match_suffix)), None)
                
                if current_match:
                    # Find the opponent (the player who didn't leave)
                    opponent = next((p for p in current_match['players'] if p['id'] != winner_id), None)
                    if opponent:
                        print(f"[end_match] Found opponent {opponent['id']}, making them the winner")
                        winner_id = opponent['id']  # Make the opponent the winner
                    else:
                        print(f"[end_match] No opponent found in match {match_id}")
                        return
                else:
                    print(f"[end_match] Match not found in bracket: {match_id}")
                    return

            # Get winner info for notifications
            winner_info = await self.get_player_info(winner_id)
            if not winner_info:
                print(f"[end_match] Winner info not found for ID: {winner_id}")
                return
                
            winner_info['state'] = "won"

            if match_suffix == "final":
                print(f"[end_match] Processing final match")
                # Update final match winner
                bracket['final_match']['winner'] = winner_id
                
                # Notify winner
                await channel_layer.send(
                    winner_info['channel_name'],
                    {
                        'type': 'tournament_update',
                        'status': 'tournament_winner',
                        'message': 'Congratulations! You won the tournament!' + (' Your opponent left the game.' if leaver else ''),
                        'bracket': bracket
                    }
                )
                
                # Handle tournament completion
                await self.tournament_end(tournament_id)
                
            else:
                # Update semifinal match winner
                match = next((m for m in bracket['matches'] if m['match_id'].endswith(match_suffix)), None)
                if match:
                    print(f"[end_match] Updating semifinal match {match_suffix}")
                    match['winner'] = winner_id
                    
                    # Check if both semifinals are complete
                    if all(m['winner'] is not None for m in bracket['matches']):
                        print(f"[end_match] All semifinals complete, advancing tournament")
                        await self.advance_to_finals(tournament_id)
                    else:
                        # Notify winner they need to wait
                        await channel_layer.send(
                            winner_info['channel_name'],
                            {
                                'type': 'tournament_update',
                                'status': 'waiting_for_semifinal',
                                'message': 'You won!' + (' Your opponent left the game.' if leaver else '') + ' Waiting for other semifinal match to complete...',
                                'bracket': bracket
                            }
                        )

        except Exception as e:
            print(f"[end_match] Error: {str(e)}")
            # Optionally notify players about the error
            if winner_info and winner_info.get('channel_name'):
                await channel_layer.send(
                    winner_info['channel_name'],
                    {
                        'type': 'tournament_error',
                        'message': 'An error occurred while processing the match end.'
                    }
                )

    async def advance_to_finals(self, tournament_id: str):
        """Set up and start final match"""
        try:
            print(f"[advance_to_finals] Setting up finals for tournament {tournament_id}")
            bracket = self.tournament_brackets[tournament_id]
            
            # Get winners from semifinals
            semifinal_winners = []
            for match in bracket['matches']:
                winner_id = match['winner']
                winner_info = await self.get_player_info(winner_id)
                if winner_info:
                    semifinal_winners.append({
                        'id': winner_id,
                        'info': winner_info
                    })

            # Set up final match
            final_match_id = f"{tournament_id}_final"
            bracket['final_match'] = {
                'match_id': final_match_id,
                'players': semifinal_winners,
                'winner': None
            }

            # Create pre-match room for finals
            self.pre_match_rooms[final_match_id] = [w['info'] for w in semifinal_winners]

            # Notify finalists
            channel_layer = get_channel_layer()
            for winner in semifinal_winners:
                opponent = next(w for w in semifinal_winners if w['id'] != winner['id'])
                await channel_layer.send(
                    winner['info']['channel_name'],
                    {
                        'type': 'tournament_update',
                        'status': 'final_match_ready',
                        'message': 'Finals starting soon!',
                        'opponent_name': opponent['info']['name'],
                        'opponent_img': opponent['info']['img'],
                        'bracket': bracket
                    }
                )

            # Start countdown for final match
            await self.notify_pre_match_players(final_match_id)

        except Exception as e:
            print(f"[advance_to_finals] Error: {str(e)}")

    async def get_player_info(self, player_id: int):
        """Helper method to get player info from any tournament state"""
        # Check pre-match rooms
        for room_players in self.pre_match_rooms.values():
            for player in room_players:
                if player['id'] == player_id:
                    return player

        # Check waiting players
        if player_id in self.waiting_players:
            return self.waiting_players[player_id]

        return None

    async def get_player_id(self, player_name: str):
        """Helper method to get player ID from any tournament state"""
        # Check pre-match rooms
        for room_players in self.pre_match_rooms.values():
            for player in room_players:
                if player['name'] == player_name:
                    return player['id']

        # Check waiting players
        for player_id, player_info in self.waiting_players.items():
            if player_info['name'] == player_name:
                return player_id

        return None

    async def advance_tournament(self, tournament_id: str):
        """Advance tournament to next round by setting up the final match"""
        try:
            print(f"[advance_tournament] Starting advancement for tournament {tournament_id}")
            bracket = self.tournament_brackets[tournament_id]
            
            if bracket['final_match'].get('winner'):
                print(f"[advance_tournament] Tournament {tournament_id} already complete")
                await self.tournament_end(tournament_id)
                return

            # Get winners from semifinals
            winners = []
            for match in bracket['matches']:
                if match['winner']:
                    winner_info = next(
                        (player['info'] for player in match['players'] 
                        if player['id'] == match['winner']), 
                        None
                    )
                    if winner_info:
                        winners.append({
                            'id': match['winner'],
                            'info': winner_info,
                            'position': 'left' if len(winners) == 0 else 'right'
                        })

            print(f"[advance_tournament] Found {len(winners)} winners for final match")

            # Set up final match
            final_match_id = f"{tournament_id}_final"
            bracket['final_match'] = {
                'match_id': final_match_id,
                'players': winners,
                'winner': None
            }

            # Create pre-match room for final
            self.pre_match_rooms[f"match_{final_match_id}"] = [
                winner['info'] for winner in winners
            ]

            # Notify all tournament players about advancement to finals
            channel_layer = get_channel_layer()
            all_players = self.get_all_tournament_players(tournament_id)
            
            for player in all_players:
                is_finalist = any(w['id'] == player['id'] for w in winners)
                channel_name = player['info']['channel_name']
                
                await channel_layer.send(
                    channel_name,
                    {
                        'type': 'tournament_update',
                        'status': 'finals_ready',
                        'is_finalist': is_finalist,
                        'message': 'Finals starting soon!' if is_finalist else 'Finals are about to begin!',
                        'bracket': bracket,
                        'opponent_name': next((w['info']['name'] for w in winners if w['id'] != player['id']), None) if is_finalist else None,
                        'opponent_img': next((w['info']['img'] for w in winners if w['id'] != player['id']), None) if is_finalist else None
                    }
                )

            print(f"[advance_tournament] Created final match room: match_{final_match_id}")
            await self.notify_pre_match_players(f"match_{final_match_id}")

        except Exception as e:
            print(f"[advance_tournament] Error advancing tournament: {str(e)}")
            await self.notify_tournament_error(
                f"{tournament_id}_final", 
                f"Error advancing tournament: {str(e)}"
            )

    async def tournament_end(self, tournament_id: str):
        """Handle tournament completion, cleanup, and player notifications"""
        try:
            print(f"[tournament_end] Processing tournament end for {tournament_id}")
            bracket = self.tournament_brackets[tournament_id]
            winner_id = bracket['final_match']['winner']

            if not winner_id:
                print(f"[tournament_end] No winner found for tournament {tournament_id}")
                return

            # Get winner info
            winner_info = None
            for match in bracket['matches']:
                for player in match['players']:
                    if player['id'] == winner_id:
                        winner_info = player['info']
                        break
                if winner_info:
                    break

            if not winner_info:
                # Check final match players if winner wasn't found in semifinals
                for player in bracket['final_match']['players']:
                    if player['id'] == winner_id:
                        winner_info = player['info']
                        break

            print(f"[tournament_end] Winner found: {winner_info['name'] if winner_info else 'Unknown'}")

            # Award achievement to winner
            try:
                await self.award_tournament_achievement(winner_id)
            except Exception as e:
                print(f"[tournament_end] Error awarding achievement: {str(e)}")

            # Inside tournament_end method, replace the notification part with this:
            channel_layer = get_channel_layer()
            all_players = self.get_all_tournament_players(tournament_id)

            print(f"[tournament_end] player image: {winner_info['img']}")
            print(f"[tournament_end] player name: {winner_info['name']}")
            print(f"[tournament_end] player id: {winner_id}")                    
            for player in all_players:
                try:
                    # Extract channel name based on the player object structure
                    channel_name = None
                    if isinstance(player, dict):
                        if 'info' in player and 'channel_name' in player['info']:
                            channel_name = player['info']['channel_name']
                        elif 'channel_name' in player:
                            channel_name = player['channel_name']
                        
                    if not channel_name:
                        print(f"[tournament_end] No channel name found for player: {player}")
                        continue
                    print(f"[tournament_end] Notifying player in channel {channel_name}")
                    # print(f"[tournament_end] player image: {player['info']['img']}")
                    # print(f"[tournament_end] player name: {player['info']['name']}")
                    # print(f"[tournament_end] player id: {player['id']}")         
                    await channel_layer.send(
                        channel_name,
                        {
                            'type': 'tournament_update',
                            'status': 'tournament_complete',
                            'message': f"Tournament complete! {winner_info['name']} is the winner!" if winner_info else "Tournament complete!",
                            'winner_id': winner_id,
                            'winner_name': winner_info['name'] if winner_info else "Unknown",
                            'winner_img': winner_info['img'] if winner_info else None
                        }
                    )
                except Exception as e:
                    print(f"[tournament_end] Error notifying player: {str(e)}, Player data: {player}")

            # Cleanup tournament data
            await self.cleanup_tournament_data(tournament_id)

        except Exception as e:
            print(f"[tournament_end] Error ending tournament: {str(e)}")

    async def award_tournament_achievement(self, user_id: int):
        """Award tournament winner achievement if not already earned"""
        try:
            await self._award_achievement(user_id)
        except Exception as e:
            print(f"Error awarding achievement: {str(e)}")
            raise

    @database_sync_to_async
    def _award_achievement(self, user_id: int):
        """Synchronous database operation to award achievement"""
        from django.contrib.auth import get_user_model
        from django.db.models import Q
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        
        # Check if user already has the tournament winner achievement
        if not user.achievements.filter(achievement='tournament_winner').exists():
            # Get or create the achievement
            achievement, created = Achievement.objects.get_or_create(
                achievement='Tournament Trophy',
                defaults={
                    'description': 'Won a tournament',
                    'icon': '/achievements/trophy.png'  # Adjust path as needed
                }
            )
            # Add the achievement to the user
            user.achievements.add(achievement)
            user.save()
            print(f"Successfully awarded tournament_winner achievement to user {user_id}")

    async def cleanup_tournament_data(self, tournament_id: str):
        """Clean up all tournament-related data"""
        try:
            print(f"[cleanup_tournament_data] Starting cleanup for tournament {tournament_id}")
            
            # Clean up pre-match rooms and find related started matches
            tournament_rooms = [
                room_id for room_id in self.pre_match_rooms.keys()
                if self.get_tournament_id_from_room(room_id) == tournament_id
            ]
            
            for room_id in tournament_rooms:
                # Clean up pre-match rooms
                if room_id in self.pre_match_rooms:
                    del self.pre_match_rooms[room_id]
                
                # Clean up countdowns
                if room_id in self.countdowns:
                    self.countdowns[room_id].cancel()
                    del self.countdowns[room_id]
                
                # Clean up started matches
                if room_id in self.started_matches:
                    self.started_matches.remove(room_id)

            # Remove tournament bracket
            if tournament_id in self.tournament_brackets:
                del self.tournament_brackets[tournament_id]

            # Clean up player to tournament mappings
            players_to_remove = []
            for player_id, t_id in self.player_to_tournament.items():
                if t_id == tournament_id:
                    players_to_remove.append(player_id)
            
            for player_id in players_to_remove:
                del self.player_to_tournament[player_id]

            print(f"[cleanup_tournament_data] Cleanup complete for tournament {tournament_id}")

        except Exception as e:
            print(f"[cleanup_tournament_data] Error during cleanup: {str(e)}")


    async def handle_match_end_player_removal(self, match_id: str, player_id: int):
        """
        Handle player removal after match end without disrupting tournament
        """
        try:
            if match_id not in self.pre_match_rooms:
                print(f"[handle_match_end_player_removal] Match {match_id} not found")
                return

            # Get tournament ID for context
            tournament_id = self.get_tournament_id_from_room(match_id)
            if not tournament_id:
                print(f"[handle_match_end_player_removal] Invalid match ID format: {match_id}")
                return

            # Remove only the specified player from pre-match room
            if match_id in self.pre_match_rooms:
                self.pre_match_rooms[match_id] = [
                    p for p in self.pre_match_rooms[match_id] 
                    if p['id'] != player_id
                ]

            # If it was the last player, clean up the room
            if not self.pre_match_rooms[match_id]:
                del self.pre_match_rooms[match_id]

            # Clean up any countdown for this match
            if match_id in self.countdowns:
                try:
                    countdown_task = self.countdowns[match_id]
                    countdown_task.cancel()
                    await countdown_task
                except asyncio.CancelledError:
                    print(f"[handle_match_end_player_removal] Countdown cancelled for {match_id}")
                finally:
                    del self.countdowns[match_id]

            # Notify the removed player
            channel_layer = get_channel_layer()
            player_channel = self.get_player_channel(player_id)
            if player_channel:
                await channel_layer.send(
                    player_channel,
                    {
                        'type': 'tournament_update',
                        'status': 'match_lost',
                        'message': 'Match ended. Better luck next time!',
                        'current_players': []
                    }
                )

        except Exception as e:
            print(f"[handle_match_end_player_removal] Error: {str(e)}")

    def get_player_channel(self, player_id: int) -> str:
        """Helper method to get player's channel name"""
        # Check pre-match rooms
        for room_players in self.pre_match_rooms.values():
            for player in room_players:
                if player['id'] == player_id:
                    return player.get('channel_name')
        
        # Check waiting players
        if player_id in self.waiting_players:
            return self.waiting_players[player_id].get('channel_name')
        
        return None