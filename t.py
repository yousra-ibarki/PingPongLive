import asyncio
from .GameState import GameState

async def handle_play_msg(self, content):
    try:
        user = self.scope['user']
        if not user:
            await self.send_json({
                'type': 'error',
                'message': 'User not authenticated'
            })
            return

        player_id = user.id 
        player_name = user.first_name if user.first_name else "Unknown"
        player_img = user.image if hasattr(user, 'image') else "https://sm.ign.com/t/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.600.jpg"
        
        async with self.__class__.lock:
            canvas_width = content.get('canvas_width')
            canvas_height = content.get('canvas_height')
            room_name = content.get('room_name')  # For game requests

            # If room_name is provided, this is a direct game request
            if room_name:
                # Skip waiting list logic and create room directly
                await self.channel_layer.group_add(room_name, self.channel_name)
                self.__class__.channel_to_room[self.channel_name] = room_name
                self.room_name = room_name

                # Only update room info if it doesn't exist
                if room_name not in self.__class__.rooms:
                    self.__class__.rooms[room_name] = [
                        {"id": player_id, "name": player_name, "img": player_img, "channel_name": self.channel_name}
                    ]
                else:
                    # Add second player to existing room
                    self.__class__.rooms[room_name].append(
                        {"id": player_id, "name": player_name, "img": player_img, "channel_name": self.channel_name}
                    )

                    # Determine left and right players based on ID
                    room_players = self.__class__.rooms[room_name]
                    player_with_min_id = min(room_players, key=lambda player: player["id"])
                    player_with_max_id = max(room_players, key=lambda player: player["id"])
                    left_player = player_with_min_id["name"]
                    right_player = player_with_max_id["name"]

                    # Start countdown and game
                    asyncio.create_task(self.send_countdown())
                    await self.channel_layer.group_send(
                        room_name,
                        {
                            'type': 'player_paired',
                            'player1_name': room_players[0]["name"],
                            'player1_img': room_players[0].get("img", ""),
                            'player2_name': room_players[1]["name"],
                            'player2_img': room_players[1].get("img", ""),
                            'room_name': room_name,
                            'left_player': left_player,
                            'right_player': right_player,
                            'message': "Opponent found",
                        }
                    )

                    # Initialize game state if not exists
                    if room_name not in self.games:
                        try:
                            self.games[room_name] = GameState(canvas_width=canvas_width, canvas_height=canvas_height)
                            game_task = asyncio.create_task(self.game_loop(room_name))
                            self.games_tasks[room_name] = game_task
                        except Exception as e:
                            print(f"Error creating game: {e}")
                            if room_name in self.games:
                                del self.games[room_name]
                            await self.send_json({
                                'type': 'error',
                                'message': f"Error starting game: {e}"
                            })
                return

            # Regular matchmaking logic for non-game-request matches
            # Check if player is already in a room or waiting
            if any(player_id in room for room in self.__class__.rooms.values() if room):
                await self.send_json({
                    'type': 'error',
                    'message': 'Already in a game'
                })
                return

            if player_id in self.__class__.waiting_players:
                await self.send_json({
                    'type': 'error',
                    'message': 'Already waiting for a game'
                })
                return

            # Handle waiting players for regular matchmaking
            if self.__class__.waiting_players:
                # Get first waiting player
                waiting_player_id, waiting_data = next(iter(self.__class__.waiting_players.items()))
                if not isinstance(waiting_data, tuple) or len(waiting_data) < 3:
                    if waiting_player_id in self.__class__.waiting_players:
                        del self.__class__.waiting_players[waiting_player_id]
                    await self.send_json({
                        'type': 'error',
                        'message': 'Invalid waiting player data'
                    })
                    return

                waiting_player_channel, waiting_player_name, waiting_player_img = waiting_data
                del self.__class__.waiting_players[waiting_player_id]

                if waiting_player_id == player_id:
                    self.__class__.waiting_players[waiting_player_id] = (waiting_player_channel, waiting_player_name, waiting_player_img)
                    await self.send_json({
                        'type': 'error',
                        'message': 'Cannot pair with self'
                    })
                    return

                # Create room for matched players
                room_name = f"room_{min(player_id, waiting_player_id)}_{max(player_id, waiting_player_id)}"
                await self.channel_layer.group_add(room_name, self.channel_name)
                await self.channel_layer.group_add(room_name, waiting_player_channel)
                self.__class__.channel_to_room[self.channel_name] = room_name
                self.__class__.channel_to_room[waiting_player_channel] = room_name
                self.room_name = room_name

                self.__class__.rooms[room_name] = [
                    {"id": player_id, "name": player_name, "img": player_img, "channel_name": self.channel_name},
                    {"id": waiting_player_id, "name": waiting_player_name, "img": waiting_player_img, "channel_name": waiting_player_channel}
                ]

                # Start game setup
                room_players = self.__class__.rooms[room_name]
                player_with_min_id = min(room_players, key=lambda player: player["id"])
                player_with_max_id = max(room_players, key=lambda player: player["id"])
                left_player = player_with_min_id["name"]
                right_player = player_with_max_id["name"]

                asyncio.create_task(self.send_countdown())
                await self.channel_layer.group_send(
                    room_name,
                    {
                        'type': 'player_paired',
                        'player1_name': player_name,
                        'player1_img': player_img,
                        'player2_name': waiting_player_name,
                        'player2_img': waiting_player_img,
                        'room_name': room_name,
                        'left_player': left_player,
                        'right_player': right_player,
                        'message': "Opponent found"
                    }
                )

                # Initialize game
                if room_name not in self.games:
                    try:
                        self.games[room_name] = GameState(canvas_width=canvas_width, canvas_height=canvas_height)
                        game_task = asyncio.create_task(self.game_loop(room_name))
                        self.games_tasks[room_name] = game_task
                    except Exception as e:
                        print(f"Error creating game: {e}")
                        if room_name in self.games:
                            del self.games[room_name]
                        await self.send_json({
                            'type': 'error',
                            'message': f"Error starting game: {e}"
                        })
            else:
                # Add player to waiting list
                self.__class__.waiting_players[player_id] = (self.channel_name, player_name, player_img)
                self.room_name = None
                print(f"Player {player_name} added to waiting list")

    except Exception as e:
        print(f"Error in handle_play_msg: {e}")
        await self.send_json({
            'type': 'error',
            'message': f'Error in game setup: {e}'
        })


# myproject/myapp/CustomJWTAuthentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        cookie_token = request.COOKIES.get('access_token')
        
        if not cookie_token:
            return None
            
        try:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {cookie_token}'
            result = super().authenticate(request)
            
            # If authentication was successful, update last_active
            if result:
                user, token = result
                user.last_active = timezone.now()
                user.save(update_fields=['last_active'])
            return result
            
        except Exception:
            return None