# tournament_manager.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Dict, List, Any
import asyncio
from channels.layers import get_channel_layer
import time
from channels.db import database_sync_to_async
from myapp.models import Achievement
from datetime import datetime
from django.contrib.auth import get_user_model
from chat.models import ChatRoom, Message
from myapp.models import User
from django.utils import timezone

class TournamentManager:
    def __init__(self):
        # Core tournament state
        self.waiting_players: Dict[int, dict] = {}  # {player_id: {channel, name, img}}
        self.player_join_order: List[int] = []  # [player_id]
        self.player_to_tournament: Dict[int, str] = {}  # {player_id: tournament_id}
        
        # Pre-match state
        self.pre_match_rooms: Dict[str, List[dict]] = {}  # {room_id: [player_info]}
        self.countdowns: Dict[str, asyncio.Task] = {}  # {room_id: countdown_task}
        
        # Tournament brackets
        self.tournament_brackets: Dict[str, dict] = {}  # {tournament_id: bracket_info}


        self.tournament_started = set()  # Set of tournament IDs that have started
        self.is_reload_redirect = set()  # Set of room IDs for safe redirects  
        self.eliminated_players = set()  # Set of player IDs that lost games

        # map integer
        self.tournament_maps = {}

        self.lock = asyncio.Lock()


    async def add_player(self, player_id: int, channel_name: str, player_info: dict) -> dict:
        """Add player to tournament waiting list"""
        print(f"Adding player to tournament: {player_info['name']} (ID: {player_id})")
        
        # First clean up any existing state for this player
        if player_id in self.waiting_players or self.find_player_pre_match(player_id):
            await self.remove_player(player_id)

        self.tournament_maps[player_id] = player_info['mapNum']

        # Now add player to waiting list as new player
        self.waiting_players[player_id] = {
            'channel_name': channel_name,
            'id': player_id,
            'name': player_info['name'],
            'img': player_info['img']
        }

        if player_id not in self.player_join_order:
            self.player_join_order.append(player_id)


        # printing the waiting players names
        print(f"Players in waiting list: {[p['name'] for p in self.waiting_players.values()]}")

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

    async def send_chat_notification(self, username: str, message: str):
        """Send a server notification via chat system"""
        try:
            channel_layer = get_channel_layer()

            # Create a server message format
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
            print(f"Sending chat notification to {username}: {message}")

            # Save the message to the database
            await self._save_system_message(username, message, timestamp)

            await channel_layer.group_send(
                username,  # This is the receiver's personal room name
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': 'Tournament System',  # Special sender name for system messages
                    'receiver': username,
                    'timestamp': timestamp,
                    'is_system_message': True  # Flag to identify system messages
                }
            )
        except Exception as e:
            print(f"Error sending chat notification: {str(e)}")

    @database_sync_to_async
    def _save_system_message(self, username: str, message: str, timestamp: str):
        """Save system chat message to the database"""
        try:
            user = User.objects.get(username=username)
            room, created = ChatRoom.objects.get_or_create(name=f"System Room for {username}")
            if created:
                room.participants.add(user)
            Message.objects.create(
                room=room,
                sender=user,
                content=message,
                timestamp=timestamp
            )
        except Exception as e:
            print(f"Error saving system message: {str(e)}")

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
            # Send chat message about opponent
            notification_message = (
                f"🎮 Tournament Match Update: You've been matched with {opponent['name']}! "
                f"Prepare for your match starting soon. Good luck! 🏆"
            )
            user = await self.get_user_async(player['id'])
            if user and user.username:
                await self.send_chat_notification(user.username, notification_message)
        
        # Start countdown for this room
        print(f"[notify_pre_match_players] Starting countdown for room {room_id}")
        countdown_task = asyncio.create_task(
            self.start_pre_match_countdown(room_id)
        )
        self.countdowns[room_id] = countdown_task

    async def start_pre_match_countdown(self, room_id: str, total_time: int = 10):
        """Start countdown for a pre-match room"""
        print(f"[start_pre_match_countdown] Starting countdown for room {room_id}")
        try:
            # Add a lock or flag to prevent duplicate countdowns
            countdown_key = f"countdown_{room_id}"
            if countdown_key in self.countdowns:
                print(f"[start_pre_match_countdown] Countdown already running for room {room_id}")
                return

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

            bracket = self.tournament_brackets[tournament_id]

            all_tournament_players = []
            for match in bracket['matches']:
                for player in match['players']:
                    # Add player info with their current status
                    player_info = player['info']
                    all_tournament_players.append({
                        'id': player['id'],
                        'name': player_info['name'],
                        'img': player_info['img'],
                        'position': len(all_tournament_players),
                        'eliminated': player['id'] in self.eliminated_players if hasattr(self, 'eliminated_players') else False
                    })
            
            players = self.pre_match_rooms[room_id]

            # Store countdown task before starting
            countdown_task = asyncio.current_task()
            self.countdowns[countdown_key] = countdown_task


            for remaining_time in range(total_time, -1, -1):
                # Check if room still exists (not cancelled)
                if room_id not in self.pre_match_rooms:
                    print(f"[start_pre_match_countdown] Room {room_id} no longer exists, stopping countdown")
                    if countdown_key in self.countdowns:
                        del self.countdowns[countdown_key]
                    return
                
                print(f"[start_pre_match_countdown] Room {room_id} countdown: {remaining_time}")
                
                # Send update to all players
                for player in players:
                    await channel_layer.send(
                        player['channel_name'],
                        {
                            'type': 'tournament_update',
                            'status': 'countdown',
                            'message': "All players are ready",
                            'time_remaining': remaining_time,
                            'is_countdown': True,
                            'room_name': room_id,
                            'current_players': all_tournament_players,
                            'bracket': bracket,
                            'mapNum': self.tournament_maps[player['id']]
                        }
                    )

                await asyncio.sleep(1)
            
            # After countdown ends, mark matches and tournament as started
            tournament_id = self.get_tournament_id_from_room(room_id)
            if tournament_id:
                print(f"[start_pre_match_countdown] Setting tournament {tournament_id} as started")
                self.tournament_started.add(tournament_id)

            print(f"[start_pre_match_countdown] Countdown finished for room {room_id}")

            if room_id in self.pre_match_rooms:
                print("[tournament_start] All games should be started")

            # Clean up countdown key after completion
            if countdown_key in self.countdowns:
                del self.countdowns[countdown_key]

        except Exception as e:
            print(f"[start_pre_match_countdown] Error in countdown for room {room_id}: {str(e)}")
            if countdown_key in self.countdowns:
                del self.countdowns[countdown_key]
            await self.cleanup_pre_match_room(room_id)

    # <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


    async def clear_redirect_flag(self, room_id: str):
        """Clear redirect flag after timeout and handle failed redirects"""
        try:
            await asyncio.sleep(100)  # 10 second timeout
            
            if room_id in self.is_reload_redirect:
                tournament_id = self.get_tournament_id_from_room(room_id)
                if tournament_id in self.tournament_started:
                    print(f"[clear_redirect_flag] Redirect timeout for room {room_id}")
                    await self.cancel_tournament(tournament_id)
                self.is_reload_redirect.remove(room_id)
                
        except Exception as e:
            print(f"[clear_redirect_flag] Error: {str(e)}")
            if room_id in self.is_reload_redirect:
                self.is_reload_redirect.remove(room_id)
    
    async def handle_redirect_flag(self, room_id: str):
        """Set redirect flag and start timeout handler"""
        try:
            tournament_id = self.get_tournament_id_from_room(room_id)
            if not tournament_id or tournament_id not in self.tournament_started:
                return
            
            self.is_reload_redirect.add(room_id)
            asyncio.create_task(self.clear_redirect_flag(room_id))
            
        except Exception as e:
            print(f"[handle_redirect_flag] Error: {str(e)}")
            
    async def is_safe_redirect(self, room_id: str) -> bool:
        """Check if a room is in redirect process"""
        return room_id in self.is_reload_redirect

    # <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    async def cleanup_pre_match_room(self, room_id: str):
        """Clean up a pre-match room and notify players"""
        try:
            if room_id in self.pre_match_rooms:
                players = self.pre_match_rooms[room_id]
                channel_layer = get_channel_layer()

                # Cancel countdown if running
                countdown_key = f"countdown_{room_id}"
                if countdown_key in self.countdowns:
                    try:
                        countdown_task = self.countdowns[countdown_key]
                        countdown_task.cancel()
                        await countdown_task
                    except asyncio.CancelledError:
                        print(f"[cleanup_pre_match_room] Countdown cancelled for {room_id}")
                    finally:
                        del self.countdowns[countdown_key]
                
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

        except Exception as e:
            print(f"[cleanup_pre_match_room] Error: {str(e)}")

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
        """Handle player leaving during pre-match phase with improved handling"""
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

            # Case 1: Player was eliminated through loss
            if player_id in self.eliminated_players:
                print(f"[handle_pre_match_leave] Player {player_id} eliminated - quiet removal")
                print(f"[handle_pre_match_leave] Before removal: {self.eliminated_players}")
                self.eliminated_players.remove(player_id)
                print(f"[handle_pre_match_leave] After removal: {self.eliminated_players}")
                if player_id in self.tournament_maps:
                    del self.tournament_maps[player_id]
                if player_id in self.player_to_tournament:
                    del self.player_to_tournament[player_id]
                if player_id in self.player_join_order:
                    self.player_join_order.remove(player_id)
                if room_id in self.pre_match_rooms:
                    self.pre_match_rooms[room_id] = [
                        p for p in self.pre_match_rooms[room_id] 
                        if p['id'] != player_id
                    ]
                    if not self.pre_match_rooms[room_id]:
                        del self.pre_match_rooms[room_id]
                return

            # Case 2: Tournament already started
            print(f"[handle_pre_match_leave] Tournament {tournament_id} started tournaments: {self.tournament_started}")
            if tournament_id in self.tournament_started:
                print(f"[handle_pre_match_leave] Tournament {tournament_id} already started - cancelling tournament")
                await self.cancel_tournament(tournament_id)
                return
            
            # Cancel all countdowns
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
                        if tournament_room_id in self.countdowns:
                            del self.countdowns[tournament_room_id]

            # Collect affected players before cleanup
            affected_players = []
            for room_id in current_tournament_rooms:
                if room_id in self.pre_match_rooms:
                    affected_players.extend(
                        [p for p in self.pre_match_rooms[room_id] if p['id'] != player_id]
                    )

            # Clean up tournament state
            if tournament_id in self.tournament_brackets:
                del self.tournament_brackets[tournament_id]
                
            # Clean up rooms
            for room_id in current_tournament_rooms:
                if room_id in self.pre_match_rooms:
                    del self.pre_match_rooms[room_id]
                    
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
                    print(f"[handle_pre_match_leave] Error notifying player {player['id']}: {e}")

            # Check for new tournament formation
            if len(self.waiting_players) >= 4:
                await self.setup_tournament()

        except Exception as e:
            print(f"[handle_pre_match_leave] Unexpected error: {e}")
            if tournament_id:
                await self.cancel_tournament(tournament_id)
            
    async def cancel_tournament(self, tournament_id: str):
        """Cancel entire tournament and notify all players"""
        try:
            print(f"[cancel_tournament] Cancelling tournament {tournament_id}")
            
            # Get all rooms for this tournament
            tournament_rooms = [
                r_id for r_id in self.pre_match_rooms.keys() 
                if self.get_tournament_id_from_room(r_id) == tournament_id
            ]
            
            # Get ALL affected players before cleanup
            affected_players = []
            for room_id in tournament_rooms:
                if room_id in self.pre_match_rooms:
                    affected_players.extend(self.pre_match_rooms[room_id])
            
            # Also get players from bracket to ensure we get everyone
            if tournament_id in self.tournament_brackets:
                bracket = self.tournament_brackets[tournament_id]
                for match in bracket['matches']:
                    for player in match['players']:
                        if player['info'] not in affected_players:
                            affected_players.append(player['info'])
                
                # Check final match players too
                if bracket.get('final_match'):
                    for player in bracket['final_match'].get('players', []):
                        if player['info'] not in affected_players:
                            affected_players.append(player['info'])

            # Cancel all countdowns
            for room_id in tournament_rooms:
                if room_id in self.countdowns:
                    try:
                        countdown_task = self.countdowns[room_id]
                        countdown_task.cancel()
                        await countdown_task
                    except asyncio.CancelledError:
                        print(f"[cancel_tournament] Countdown cancelled for {room_id}")
                    finally:
                        del self.countdowns[room_id]
            # Clean map number
            for player in affected_players:
                if player['id'] in self.tournament_maps:
                    del self.tournament_maps[player['id']]
            # Clean up tournament state
            if tournament_id in self.tournament_brackets:
                del self.tournament_brackets[tournament_id]
            if tournament_id in self.tournament_started:
                self.tournament_started.remove(tournament_id)
                
            # Clean up rooms and eliminated players
            for room_id in tournament_rooms:
                if room_id in self.pre_match_rooms:
                    del self.pre_match_rooms[room_id]
            
            print(f"[cancel_tournament] Clearing eliminated players [[33]]")
            # Clear eliminated players for this tournament
            self.eliminated_players.clear()

            print(f"[cancel_tournament] Notifying players about tournament cancellation")
            # Notify all affected players
            channel_layer = get_channel_layer()
            for player in affected_players:
                try:
                    await channel_layer.send(
                        player['channel_name'],
                        {
                            'type': 'tournament_update',
                            'status': 'tournament_cancelled',
                            'message': 'Tournament cancelled due to player disconnect.',
                            'should_redirect': True
                        }
                    )
                except Exception as e:
                    print(f"[cancel_tournament] Error notifying player {player['id']}: {e}")

        except Exception as e:
            print(f"[cancel_tournament] Error: {str(e)}")

    async def check_waiting_list(self):
        """Check if we can form new tournaments from waiting list"""
        if len(self.waiting_players) >= 4:
            await self.setup_tournament()

    async def remove_player(self, player_id: int) -> dict:
        """Remove player from any tournament state with atomic operations"""
        async with self.lock:
            try:
                # Remove from waiting list if present
                print(f"==> Removing player {player_id}")
                if player_id in self.waiting_players:
                    if player_id in self.player_join_order:
                        self.player_join_order.remove(player_id)
                    print(f"Removing player {player_id} from waiting list")
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
                    await self.handle_pre_match_leave(room_id, player_id)
                
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

    
# ************************** Handling In Game Events **************************

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
        try:
            tournament_id = self.get_tournament_id_from_room(match_id)
            if not tournament_id or tournament_id not in self.tournament_brackets:
                print(f"[end_match] Invalid tournament/match ID: {match_id}")
                return

            bracket = self.tournament_brackets[tournament_id]
            match_parts = match_id.split('_')
            match_suffix = match_parts[-1]
            channel_layer = get_channel_layer()
            
            winner_info = await self.get_player_info(winner_id)
            if not winner_info:
                print(f"[end_match] Winner info not found for ID: {winner_id}")
                return
                
            if match_suffix == "final":
                print("[end_match] Processing final match")
                final_match = bracket['final_match']
                final_loser = next((p for p in final_match['players'] if p['id'] != winner_id), None)
                
                if final_loser:
                    async with self.lock:
                        print(f"[end_match] Adding player {final_loser['id']} to eliminated_players [[11]]")
                        self.eliminated_players.add(final_loser['id'])
                        await self.handle_pre_match_leave(match_id, final_loser['id'])

                bracket['final_match']['winner'] = winner_id

                await channel_layer.send(
                    winner_info['channel_name'],
                    {
                        'type': 'tournament_update',
                        'status': 'tournament_winner',
                        'message': 'Congratulations! You won the tournament!',
                        'bracket': bracket,
                        'should_redirect': True
                    }
                )

                await self.tournament_end(tournament_id)

            else:
                print("[end_match] Processing semifinal match")
                match = next((m for m in bracket['matches'] if m['match_id'].endswith(match_suffix)), None)
                if match:
                    loser = next((p for p in match['players'] if p['id'] != winner_id), None)
                    if loser:
                        async with self.lock:
                            print(f"[end_match] Adding player {loser['id']} to eliminated_players [[22]]")
                            self.eliminated_players.add(loser['id'])
                            await self.handle_pre_match_leave(match_id, loser['id'])

                    match['winner'] = winner_id

                    if all(m['winner'] is not None for m in bracket['matches']):
                        print("[end_match] All semifinals complete")
                        await self.advance_to_finals(tournament_id)
                    else:
                        print("[end_match] Waiting for other semifinal")
                        winner_player = next((player for player in match['players'] if player['id'] == match['winner']), None)
                        if winner_player:
                            player_info = await self.get_player_info(winner_player['id'])
                            if player_info:
                                # await asyncio.sleep(4)
                                await channel_layer.send(
                                    player_info['channel_name'],
                                    {
                                        'type': 'tournament_update',
                                        'status': 'waiting_for_semifinal',
                                        'message': 'Waiting for other semifinal...',
                                        'bracket': bracket,
                                        'winner_id': winner_id,
                                        'winner_name': winner_info['name'],
                                        'winner_img': winner_info['img']
                                    }
                                )
                    # Notify players when the first round finishes
                    if 'round' in bracket and bracket['round'] == 1:
                        if all(m['winner'] is not None for m in bracket['matches']):
                            all_winners = [m['winner'] for m in bracket['matches']]
                            for winner_id in all_winners:
                                winner_info = await self.get_player_info(winner_id)
                                if winner_info:
                                    opponent = next(
                                        (p for p in all_winners if p != winner_id),
                                        None
                                    )
                                    if opponent:
                                        opponent_info = await self.get_player_info(opponent)
                                        if opponent_info:
                                            notification_message = (
                                                f"The first round has finished. Get ready for the next round!\n"
                                                f"Your next opponent is {opponent_info['name']}."
                                            )
                                            user = await self.get_user_async(winner_id)
                                            if user and user.username:
                                                await self.send_chat_notification(user.username, notification_message)

                else:
                    print(f"[end_match] Match not found with suffix {match_suffix}")

        except Exception as e:
            print(f"[end_match] Error: {str(e)}") 
            if winner_info and winner_info.get('channel_name'):
                await channel_layer.send(
                    winner_info['channel_name'],
                    {
                        'type': 'tournament_error',
                        'message': 'Error processing match end.'
                    }
                )

    async def advance_to_finals(self, tournament_id: str):
        try:
            print(f"[advance_to_finals] Starting finals setup for tournament {tournament_id}")
            bracket = self.tournament_brackets[tournament_id]
            
            # Get winners from semifinals
            semifinal_winners = []
            for match in bracket['matches']:
                winner_id = match['winner']
                winner_info = await self.get_player_info(winner_id)
                if winner_info:
                    semifinal_winners.append({
                        'id': winner_id,
                        'info': winner_info,
                        'position': 'left' if len(semifinal_winners) == 0 else 'right'
                    })

            print(f"[advance_to_finals] Found {len(semifinal_winners)} winners")

            # Set up final match
            final_match_id = f"{tournament_id}_final"
            bracket['final_match'] = {
                'match_id': final_match_id,
                'players': semifinal_winners,
                'winner': None
            }

            # Create pre-match room for final
            self.pre_match_rooms[final_match_id] = [
                winner['info'] for winner in semifinal_winners
            ]

            # Notify both finalists
            channel_layer = get_channel_layer()
            all_players = self.get_all_tournament_players(tournament_id)
            
            for winner in semifinal_winners:
                opponent = next(w for w in semifinal_winners if w['id'] != winner['id'])
                try:
                    # delay to allow the other player to see the result
                    print(f"[advance_to_finals] Notifying finalist {winner['id']} about opponent {opponent['id']}")
                    # await asyncio.sleep(2)
                    await channel_layer.send(
                        winner['info']['channel_name'],
                        {
                            'type': 'tournament_update',
                            'status': 'final_match_ready',
                            'message': 'Finals starting soon!',
                            'opponent_name': opponent['info']['name'],
                            'opponent_img': opponent['info']['img'],
                            'room_name': final_match_id,
                        }
                    )
                except Exception as e:
                    print(f"[advance_to_finals] Error notifying finalist {winner['id']}: {e}")

            countdown_task = asyncio.create_task(
                self.start_pre_match_countdown(final_match_id)
            )
            self.countdowns[final_match_id] = countdown_task

        except Exception as e:
            print(f"[advance_to_finals] Error: {str(e)}")
            # Attempt to notify players about error
            if 'semifinal_winners' in locals():
                for winner in semifinal_winners:
                    try:
                        await channel_layer.send(
                            winner['info']['channel_name'],
                            {
                                'type': 'tournament_error',
                                'message': 'Error setting up finals.'
                            }
                        )
                    except:
                        pass  # Suppress notification errors
            raise  # Re-raise the original error for higher-level handling

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
        """Award achievement and notify user"""
        from django.contrib.auth import get_user_model
        from django.db.models import Q
        from game.models import create_notification
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        User = get_user_model()

        user = User.objects.get(id=user_id)
        achievement_name = 'Tournament Trophy'

        # Check if achievement already exists
        if not user.achievements.filter(achievement=achievement_name).exists():
            # Create achievement
            achievement, created = Achievement.objects.get_or_create(
                achievement=achievement_name,
                defaults={
                    'description': 'Won a tournament',
                    'icon': '/trophy/tournament2.png'
                }
            )

            # Add achievement to user
            user.achievements.add(achievement)
            user.save()

            # Create notification
            notification = create_notification(user, achievement_name)

            # Send WebSocket notification
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_{user.username}",
                {
                    "type": "notify_achievement",
                    "achievement": achievement_name,
                    "message": f"Congratulations! You've unlocked the '{achievement_name}' achievement!",
                    "notification_id": notification.id,
                }
            )

            print(f"Successfully awarded tournament achievement to user {user_id}")
            
            return True
        return False

    async def cleanup_tournament_data(self, tournament_id: str):
        """Clean up all tournament-related data"""
        try:
            print(f"[cleanup_tournament_data] Starting cleanup for tournament {tournament_id}")
            
            # Clean up pre-match rooms and find related started matches
            tournament_rooms = [
                room_id for room_id in self.pre_match_rooms.keys()
                if self.get_tournament_id_from_room(room_id) == tournament_id
            ]

            # Remove from tournament_started set
            if tournament_id in self.tournament_started:
                self.tournament_started.remove(tournament_id)
            
            # Clean up all rooms associated with this tournament
            for room_id in tournament_rooms:
                # Clean up pre-match rooms
                if room_id in self.pre_match_rooms:
                    del self.pre_match_rooms[room_id]
                
                # Clean up countdowns
                if room_id in self.countdowns:
                    self.countdowns[room_id].cancel()
                    del self.countdowns[room_id]

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

            tournament_winner = set()
            if 'final_match' in bracket and bracket['final_match'].get('winner'):
                if player in bracket['final_match']['winner']:
                    tournament_winner.add(player)

            self.eliminated_players.clear()

            # Clean up tournament maps for all involved players
            if player in self.tournament_maps:
                del self.tournament_maps[player]

            # Clean up any redirect flags for tournament rooms
            for room_id in tournament_rooms:
                if room_id in self.is_reload_redirect:
                    self.is_reload_redirect.remove(room_id)

            print(f"[cleanup_tournament_data] Cleanup complete for tournament {tournament_id}")

        except Exception as e:
            print(f"[cleanup_tournament_data] Error during cleanup: {str(e)}")


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