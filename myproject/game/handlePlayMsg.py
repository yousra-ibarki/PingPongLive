
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
            player_ready1_id = content.get('player_ready1')
            player_ready1_name = content.get('player_ready1_name')
            player_ready1_img = content.get('player_ready1_img')
            player_ready2_id = content.get('player_ready2')
            player_ready2_name = content.get('player_ready2_name')
            player_ready2_img = content.get('player_ready2_img')
            room_name = content.get('room_name')
            print("room_name887", room_name)
            

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
            #FROOOOM HERE

            # Handle waiting players
            if self.__class__.waiting_players:
                # Get first waiting player safely
                waiting_player_id, waiting_data = next(iter(self.__class__.waiting_players.items()))
                if waiting_data is None or not isinstance(waiting_data, tuple) or len(waiting_data) < 3:
                    if waiting_player_id in self.__class__.waiting_players:
                    # Invalid waiting player data, clean it up
                        del self.__class__.waiting_players[waiting_player_id]
                    await self.send_json({
                        'type': 'error',
                        'message': 'Invalid waiting player data'
                    })
                    return
                waiting_player_channel, waiting_player_name, waiting_player_img = waiting_data
                # Remove the waiting player we're about to pair
                del self.__class__.waiting_players[waiting_player_id]
                # Don't pair with self
                if waiting_player_id == player_id:
                    self.__class__.waiting_players[waiting_player_id] = (waiting_player_channel, waiting_player_name, waiting_player_img)
                    await self.send_json({
                        'type': 'error',
                        'message': 'Cannot pair with self'
                    })
                    return
                room_name = f"room_{min(player_id, waiting_player_id)}_{max(player_id, waiting_player_id)}"
                # Add both players to the room group
                await self.channel_layer.group_add(room_name, self.channel_name)
                await self.channel_layer.group_add(room_name, waiting_player_channel)
                self.__class__.channel_to_room[self.channel_name] = room_name
                self.__class__.channel_to_room[waiting_player_channel] = room_name
                self.room_name = room_name
                print(f"ROOM CREATED SUCCESSFULLY {self.room_name}!!!!!")
                self.__class__.rooms[room_name] = [
                    {"id": player_id, "name": player_name, "img": player_img, "channel_name": self.channel_name},
                    {"id": waiting_player_id, "name": waiting_player_name, "img": waiting_player_img, "channel_name": waiting_player_channel},
                ]
                if self.room_name and self.room_name in self.__class__.rooms:
                    room_players = self.__class__.rooms[self.room_name]
                    # Only attempt to find min ID if we have valid players
                    if room_players and all(player.get("id") is not None for player in room_players):
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
                        'message': "Opponent found",
                    }
                )
                if room_name not in self.games:
                    try:
                        # self.games[room_name] = GameState(canvas_width=canvas_width, canvas_height=canvas_height)
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
                self.__class__.waiting_players[player_id] = (self.channel_name, player_name, player_img)
                self.room_name = None
                print(f"PLAYER {player_name} just added to the waiting list !!!!")
    except Exception as e:
        print(f"Error in waiting player paired {e}")
        await self.send_json({
            'type': 'error',
            'message': f'Error in waiting players {e}'
            })
        