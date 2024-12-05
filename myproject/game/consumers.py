from channels.generic.websocket import AsyncJsonWebsocketConsumer
import asyncio
from typing import Dict, Tuple, Any, List
from functools import wraps
import time

def rate_limit(limit):
    def decorator(func):
        last_called = {}
        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            now = time.time()
            if self.channel_name in last_called:
                elapsed = now - last_called[self.channel_name]
                if elapsed < limit:
                    return
            last_called[self.channel_name] = now
            return await func(self, *args, **kwargs)
        return wrapper
    return decorator


class GameConsumer(AsyncJsonWebsocketConsumer):
    # Existing classic game attributes, read more about typing in python
    waiting_players: Dict[int, Tuple[str, str, str]] = {}
    channel_to_room: Dict[str, str] = {}
    rooms: Dict[str, list] = {}

    # New tournament-specific attributes
    tournament_waiting_players: Dict[int, Tuple[str, str, str]] = {}
    tournament_rooms: Dict[str, List[Dict]] = {}
    tournament_channel_to_room: Dict[str, str] = {}

    #to avoid race condition 
    lock = asyncio.Lock()
    
     
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.player_id = None
        self.game_mode = None
        #this shit to update the name of the room with the first one pressed play
        
    async def connect(self):
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
                await self.close()
                return
            
            self.player_id = user.id
            await self.accept()
            print(f"[111] Player {user.username} connected!")
        except Exception as e:
            print(f"Error in connection: {str(e)}")
            await self.close()
          
    async def receive_json(self, content):
        try:
            message_type = content.get('type')
            print("MESSAGE TYPE ==> ", {message_type})
            mode = content.get('mode')
            print("MODE ==>", {mode})
            if (message_type == None):
                print("MESSAGE TYPE IS NONE")

            if message_type == 'play':
                user = self.scope['user']
                player_id = user.id
                player_name = user.first_name or user.username
                player_img = user.image
                game_mode = content.get('mode')
                print("Game Mode ==>", {game_mode})

                async with GameConsumer.lock:

                    if game_mode == 'classic':
                        await self.handle_classic_play(player_id, player_name, player_img)
                    elif game_mode == 'tournament':
                        await self.handle_tournament_play(player_id, player_name, player_img)

            elif message_type == 'cancel':
                async with GameConsumer.lock:
                    self.room_name = GameConsumer.channel_to_room.get(self.channel_name)
                    print(f"CANCEL PRESSED ROOM NAME {self.room_name}")
                    if self.room_name and self.room_name in GameConsumer.rooms:
                        room_players = GameConsumer.rooms[self.room_name]
                        
                        # Find the other player
                        remaining_player = next(
                            (player for player in room_players if player["id"] != self.player_id),
                            None
                        )
                        
                        # Add remaining player back to waiting list
                        if remaining_player:
                            GameConsumer.waiting_players[remaining_player["id"]] = (
                                remaining_player["channel_name"],
                                remaining_player["name"],
                                remaining_player["img"]
                            )
                            print(f"REMAINING PLAYER is {remaining_player['name']}")
                            
                            #remove the room_name !!
                            if self.channel_name in GameConsumer.channel_to_room:
                                del GameConsumer.channel_to_room[self.channel_name]
                            if remaining_player["channel_name"] in GameConsumer.channel_to_room:
                                del GameConsumer.channel_to_room[remaining_player["channel_name"]]
                            
                            # Notify both players about cancellation
                            await self.channel_layer.group_send(
                                self.room_name,
                                {
                                    'type': 'cancel',
                                    'playertwo_name': self.scope['user'].first_name,
                                    'playertwo_img': self.scope['user'].image,
                                    'message': "Searching for new opponent...",     
                                }
                            )
                            
                            # Clean up the room
                            await self.channel_layer.group_discard(self.room_name, self.channel_name)
                            await self.channel_layer.group_discard(self.room_name, remaining_player["channel_name"])
                            del GameConsumer.rooms[self.room_name]
                    
                    # Remove from waiting list if they were waiting
                    elif self.player_id in GameConsumer.waiting_players:
                        del GameConsumer.waiting_players[self.player_id]
                        await self.send_json({
                            'type': 'cancel',
                            'message': 'Search cancelled'
                        })
            elif message_type == 'tournament_cancel':
                async with GameConsumer.lock:
                    await self.handle_tournament_cancel()
            elif message_type == 'RacketLeft_move':
                async with GameConsumer.lock:
                    positions_left = content.get('positions')
                    sender_channel = self.channel_name
                    
                    x_left = positions_left.get('x')
                    y_left = positions_left.get('y')
                    
                    if self.room_name and self.room_name in GameConsumer.rooms:
                        room_players = GameConsumer.rooms[self.room_name]
                        opponent = next(
                            (player for player in room_players if player["channel_name"] != sender_channel),
                            None
                        )
                        if opponent:
                            await self.channel_layer.send(
                            opponent["channel_name"],
                                {
                                    'type': 'right_positions',
                                    'player_side': "right",
                                    'x_right': x_left,
                                    'y_right': y_left,
                                },
                            )
                        # print(f"x_position {x_left}, y_position {y_left} !!")
            elif message_type == 'Ball_move':
                async with GameConsumer.lock:
                    player_name = content.get('player_name')
                    ball_positions = content.get('positions')
                    ball_velocity = content.get('velocity')
                    # canvas_width = content.get('canvasWidth')
                    # canvas_height = content.get('canvasHeight')
                    sender_channel = self.channel_name
                    
                    x_ball = ball_positions.get('x')
                    y_ball = ball_positions.get('y')  
                    x_velocity = ball_velocity.get('x')
                    y_velocity = ball_velocity.get('y')
            

                    # if self.room_name and self.room_name in GameConsumer.rooms:
                    #     await self.channel_layer.group_send(
                    #         self.room_name,
                    #         {
                    #             'type': 'ball_positions',
                    #             'player_side': opposite_side,
                    #             'x_ball': x_ball,
                    #             'y_ball': y_ball,
                    #             'x_velocity': x_velocity,
                    #             'y_velocity': y_velocity,
                    #         },
                    #     )

                    if self.room_name and self.room_name in GameConsumer.rooms:
                       room_players = GameConsumer.rooms[self.room_name]
                       opponent = next(
                           (player for player in room_players if player["channel_name"] != sender_channel),
                           None
                       )
                    #    print(f"ROOOME NAME: {self.room_name}")
                       if opponent:
                            await self.channel_layer.group_send(
                                # opponent["channel_name"],
                                self.room_name,
                                {
                                    'type': 'ball_positions',
                                    'x_ball': x_ball,
                                    'y_ball': y_ball,
                                    'x_velocity': x_velocity,
                                    'y_velocity': y_velocity,
                                    # 'canvasWidth': canvas_width,
                                    # 'canvasHeight': canvas_height,
                                },
                            )
            # elif message_type == 'canvas_resize':
            #     dimensions = content.get('dimensions')
            #     if self.room_name and self.room_name in GameConsumer.rooms:
            #         room_players = GameConsumer.rooms[self.room_name]
            #         opponent = next(
            #             (player for player in room_players if player["channel_name"] != self.channel_name),
            #             None
            #         )
            #         if opponent:
            #             await self.channel_layer.send(
            #                 opponent["channel_name"],
            #                 {
            #                     'type': 'canvas_resize',
            #                     'width': dimensions['width'],
            #                     'height': dimensions['height']
            #                 }
            #             )
                    # print(f"ball_positions {x_ball}, {y_ball} !!")
        except Exception as e:
            print(f"Error in receive_json: {str(e)}")
            await self.send_json({
                'type': 'error',
                'message': 'An error occurred no mode specified'
            })
    
    async def ball_positions(self, event):
        await self.send_json({
            'type': 'ball_positions',
            # 'player_side': event['player_side'],
            'x_ball': event['x_ball'],
            'y_ball': event['y_ball'],
            'x_velocity': event['x_velocity'],
            'y_velocity': event['y_velocity'],
        })
    
    async def right_positions(self, event):
        await self.send_json({
            'type': 'right_positions',
            'player_side': event['player_side'],
            'x_right': event['x_right'],
            'y_right': event['y_right'],
        })
    
    async def send_countdown(self, total_time=3):
        try:
            #search more for range
            for remaining_time in range(total_time, -1, -1):
                min, secs = divmod(remaining_time, 60)
                timeformat = '{:02d}'.format(secs)
                
                await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': 'countdown',
                        'time_remaining': timeformat,
                        'is_finished': remaining_time == 0,
                    }
                )
                #waiting for 1 second !!!!
                await asyncio.sleep(1)
        except Exception as e:
            print(f"COUNTDOWN ERROR: {e}")
            
    async def countdown(self, event):
        await self.send_json({
            'type': 'countdown',
            'time_remaining': event['time_remaining'],
            'is_finished': event.get('is_finished', False),
        })
    
    async def cancel(self, event):
        await self.send_json({
            'type': 'cancel',
            'message': event['message'],
            'playertwo_name': event['playertwo_name'],
            'playertwo_img': event['playertwo_img'],
        })

    async def player_paired(self, event):
        self.room_name = event.get('room_name')
        await self.send_json({
            'type': 'player_paired',
            'message': event['message'],
            'player1_name': event['player1_name'],
            'player1_img': event['player1_img'],
            'player2_name': event['player2_name'],
            'player2_img': event['player2_img'],
            'mode': event.get('mode'),
            'match_number': event.get('match_number')
        })

    # async def disconnect(self, close_code):
    #     try:
    #         async with GameConsumer.lock:
    #             # Handle classic mode disconnection
    #             if self.channel_name in GameConsumer.channel_to_room:
    #                 await self.handle_classic_disconnect()
                
    #             # Handle tournament mode disconnection
    #             elif self.channel_name in GameConsumer.tournament_channel_to_room:
    #                 await self.handle_tournament_cancel()
    #     except Exception as e:
    #         print(f"Error in disconnect: {str(e)}")

    # async def handle_classic_disconnect(self):
    #     # Clean up waiting_players
    #     if self.player_id in GameConsumer.waiting_players:
    #         del GameConsumer.waiting_players[self.player_id]
        
    #     # Get room_name from the channel mapping
    #     self.room_name = GameConsumer.channel_to_room.get(self.channel_name)
        
    #     # Ensure room_name is valid before proceeding
    #     if not self.room_name:
    #         print("No valid room_name found during classic disconnect.")
    #         return
        
    #     # Clean up rooms and notify other player
    #     if self.room_name in GameConsumer.rooms:
    #         room_players = GameConsumer.rooms[self.room_name]
    #         remaining_player = next(
    #             (player for player in room_players if player["id"] != self.player_id),
    #             None
    #         )
            
    #         if remaining_player:
    #             # Add remaining player back to waiting list
    #             GameConsumer.waiting_players[remaining_player["id"]] = (
    #                 remaining_player["channel_name"],
    #                 remaining_player["name"],
    #                 remaining_player["img"]
    #             )
                
    #             # Clean up channel to room mappings
    #             if self.channel_name in GameConsumer.channel_to_room:
    #                 del GameConsumer.channel_to_room[self.channel_name]
    #             if remaining_player["channel_name"] in GameConsumer.channel_to_room:
    #                 del GameConsumer.channel_to_room[remaining_player["channel_name"]]
                
    #             # Notify remaining player
    #             await self.channel_layer.group_send(
    #                 self.room_name,
    #                 {
    #                     'type': 'cancel',
    #                     'message': 'Searching for new opponent...',
    #                     'playertwo_name': self.scope['user'].first_name,
    #                     'playertwo_img': self.scope['user'].image,
    #                 }
    #             )
            
    #         # Clean up the room
    #         del GameConsumer.rooms[self.room_name]
            
    #     # Remove the player from the room group
    #     await self.channel_layer.group_discard(self.room_name, self.channel_name)


    async def handle_classic_play(self, player_id, player_name, player_img):
        print("Got into the classic game")
        # Check if player is already in a room or waiting
        if any(player_id in room for room in GameConsumer.rooms.values()):
            await self.send_json({
                'type': 'error',
                'message': 'Already in a game'
            })
            return
        
        if player_id in GameConsumer.waiting_players:
            await self.send_json({
                'type': 'error',
                'message': 'Already waiting for a game'
            })
            return

        if GameConsumer.waiting_players:
            waiting_player_id, (waiting_player_channel, waiting_player_name, waiting_player_img) = GameConsumer.waiting_players.popitem()

            # Ensure players aren't paired with themselves
            if waiting_player_id == player_id:
                GameConsumer.waiting_players[waiting_player_id] = (waiting_player_channel, waiting_player_name, waiting_player_img)
                return

            room_name = f"room_{min(player_id, waiting_player_id)}_{max(player_id, waiting_player_id)}"
            print(f"room name ==> {room_name}")

            # Add both players to the room group
            await self.channel_layer.group_add(room_name, self.channel_name)
            await self.channel_layer.group_add(room_name, waiting_player_channel)
            
            GameConsumer.channel_to_room[self.channel_name] = room_name
            GameConsumer.channel_to_room[waiting_player_channel] = room_name
            
            self.room_name = room_name
            
            print(f"ROOM CREATED SUCCESSFULLY {self.room_name}!!!!!")
            
            GameConsumer.rooms[room_name] = [
                {"id": player_id, "name": player_name, "img": player_img, "channel_name": self.channel_name},
                {"id": waiting_player_id, "name": waiting_player_name, "img": waiting_player_img, "channel_name": waiting_player_channel},
            ]
              
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
                    'message': "Opponent found",
                    'mode': 'classic'
                }
            )
        else:
            GameConsumer.waiting_players[player_id] = (self.channel_name, player_name, player_img)
            self.room_name = None
            print(f"PLAYER {player_name} just added to the waiting list !!!!")


    async def handle_tournament_play(self, player_id, player_name, player_img):
        # Enhanced logging
        print(f"Tournament play initiated for player: {player_name} (ID: {player_id})")
        
        # Check if player is already in a tournament or game
        if any(player_id in [player['id'] for player in room] for room in GameConsumer.tournament_rooms.values()):
            await self.send_json({
                'type': 'error',
                'message': 'Already in a tournament game'
            })
            return
        
        if player_id in GameConsumer.tournament_waiting_players:
            await self.send_json({
                'type': 'error',
                'message': 'Already waiting for tournament'
            })
            return

        # Add player to tournament waiting list
        GameConsumer.tournament_waiting_players[player_id] = (self.channel_name, player_name, player_img)
        
        # Print current waiting players for debugging
        print(f"Tournament waiting players: {[(pid, player_name) for pid, (_, player_name, _) in GameConsumer.tournament_waiting_players.items()]}")
        
        # Attempt to create matches
        await self.try_create_tournament_matches()

    # async def handle_tournament_play(self, player_id, player_name, player_img):
    #     # Check if player is already in a tournament or game
    #     if any(player_id in room for room in GameConsumer.tournament_rooms.values()):
    #         await self.send_json({
    #             'type': 'error',
    #             'message': 'Already in a tournament game'
    #         })
    #         return
        
    #     if player_id in GameConsumer.tournament_waiting_players:
    #         await self.send_json({
    #             'type': 'error',
    #             'message': 'Already waiting for tournament'
    #         })
    #         return

    #     # Add player to tournament waiting list
    #     GameConsumer.tournament_waiting_players[player_id] = (self.channel_name, player_name, player_img)
    #     print(f"PLAYER {player_name} just added to the tournament waiting list !!!!")
    #     print(f"TOURNAMENT WAITING PLAYERS: {GameConsumer.tournament_waiting_players}")
    #     # If we have 8 players, start tournament matchmaking
    #     if len(GameConsumer.tournament_waiting_players) >= 2:
    #         await self.create_tournament_matches()
    

    async def try_create_tournament_matches(self):
        """
        Attempt to create tournament matches when enough players are waiting.
        Supports various tournament sizes (2, 4, 8 players).
        """
        # Determine tournament sizes to support
        supported_tournament_sizes = [2, 4, 8]
        
        for tournament_size in supported_tournament_sizes:
            # Check if we have enough players
            if len(GameConsumer.tournament_waiting_players) >= tournament_size:
                # Get players for this tournament
                tournament_players = list(GameConsumer.tournament_waiting_players.items())[:tournament_size]
                
                print(f"Creating tournament match for {tournament_size} players")
                
                # Create matches
                for i in range(0, tournament_size, 2):
                    # Pair adjacent players
                    player1_id, (player1_channel, player1_name, player1_img) = tournament_players[i]
                    player2_id, (player2_channel, player2_name, player2_img) = tournament_players[i+1]
                    
                    # Create unique room name for tournament match
                    room_name = f"tournament_room_{min(player1_id, player2_id)}_{max(player1_id, player2_id)}_{i//2}"
                    
                    # Add players to room group
                    await self.channel_layer.group_add(room_name, player1_channel)
                    await self.channel_layer.group_add(room_name, player2_channel)
                    
                    # Map channels to rooms
                    GameConsumer.tournament_channel_to_room[player1_channel] = room_name
                    GameConsumer.tournament_channel_to_room[player2_channel] = room_name
                    
                    # Store room information
                    GameConsumer.tournament_rooms[room_name] = [
                        {"id": player1_id, "name": player1_name, "img": player1_img, "channel_name": player1_channel},
                        {"id": player2_id, "name": player2_name, "img": player2_img, "channel_name": player2_channel},
                    ]
                    
                    # Send player paired message
                    await self.channel_layer.group_send(
                        room_name,
                        {
                            'type': 'player_paired',
                            'player1_name': player1_name,
                            'player1_img': player1_img,
                            'player2_name': player2_name,
                            'player2_img': player2_img,
                            'room_name': room_name,
                            'message': "Tournament ready",
                            'mode': 'tournament',
                            'match_number': i//2 + 1,
                            'count': 3
                        }
                    )
                    
                    # Start countdown for the match
                    # You might want to use self.send_countdown() but ensure it's bound to the correct room
                    asyncio.create_task(self.send_countdown())
                
                # Remove used players from waiting list
                for player_id, _ in tournament_players:
                    del GameConsumer.tournament_waiting_players[player_id]
                
                # Stop after creating matches for one tournament size
                break

    async def handle_tournament_cancel(self):
        """
        Handle the tournament cancellation when a player leaves.
        Notify remaining players and reset their state to the waiting list.
        """
        # Find the room where the canceling player belongs
        room_name = None
        for room, players in self.tournament_waiting_players.items():
            if self.channel_name in players:
                room_name = room
                break
        
        if room_name is None:
            # Player is not in a tournament room, no action needed
            await self.send_json({
                "type": "error",
                "message": "You are not currently in a tournament room."
            })
            return
        
        # Remove the canceling player from the room
        self.tournament_waiting_players[room_name].remove(self.channel_name)
        
        # Notify remaining players in the room
        remaining_players = self.tournament_waiting_players[room_name]
        for player_channel in remaining_players:
            await self.channel_layer.send(player_channel, {
                "type": "player_left_tournament",
                "message": "A player has left the tournament. You are being moved back to the waiting queue.",
            })
        
        # Reset remaining players to the waiting list
        for player_channel in remaining_players:
            self.tournament_waiting_list.append(player_channel)

        # Clean up the room if empty
        if not self.tournament_waiting_players[room_name]:
            del self.tournament_waiting_players[room_name]

        # Notify the canceling player
        await self.send_json({
            "type": "tournament_cancel_confirmation",
            "message": "You have successfully left the tournament.",
        })


    async def tournament_waiting_list(self):
        await self.send_json({
            "type": "tournament_waiting_list",
            "message": "Tournament waiting list",
        })

    # async def create_tournament_matches(self):
    #     # Pair players randomly
    #     tournament_players = list(GameConsumer.tournament_waiting_players.items())
        
    #     # For testing with 2 players, we'll create just one match
    #     if len(tournament_players) >= 2:  # Changed from 8 to 2
    #         # Get the first two players
    #         player1_id, (player1_channel, player1_name, player1_img) = tournament_players[0]
    #         player2_id, (player2_channel, player2_name, player2_img) = tournament_players[1]
            
    #         # Create unique room name for tournament match
    #         room_name = f"tournament_room_{min(player1_id, player2_id)}_{max(player1_id, player2_id)}"
            
    #         self.room_name = room_name
            
    #         await self.channel_layer.group_add(room_name, player1_channel)
    #         await self.channel_layer.group_add(room_name, player2_channel)
            
    #         # Map channels to rooms
    #         GameConsumer.tournament_channel_to_room[player1_channel] = room_name
    #         GameConsumer.tournament_channel_to_room[player2_channel] = room_name
            
    #         # Store room information
    #         GameConsumer.tournament_rooms[room_name] = [
    #             {"id": player1_id, "name": player1_name, "img": player1_img, "channel_name": player1_channel},
    #             {"id": player2_id, "name": player2_name, "img": player2_img, "channel_name": player2_channel},
    #         ]
            
    #         # Send player paired message
    #         await self.channel_layer.group_send(
    #             room_name,
    #             {
    #                 'type': 'player_paired',
    #                 'player1_name': player1_name,
    #                 'player1_img': player1_img,
    #                 'player2_name': player2_name,
    #                 'player2_img': player2_img,
    #                 'room_name': room_name,
    #                 'message': "Tournament match found",
    #                 'mode': 'tournament',
    #                 'match_number': 1
    #             }
    #         )
            
    #         print("The Match should start now")

    #         # Start countdown for the match
    #         asyncio.create_task(self.send_countdown())
            
    #         print("Countdown has finished")

    #         # Clear the tournament waiting list
    #         GameConsumer.tournament_waiting_players.clear()


    async def send_tournament_countdown(self, room_name, total_time=3):
        """
        Modified countdown method specific to tournament rooms
        """
        try:
            for remaining_time in range(total_time, -1, -1):
                # min, secs = divmod(remaining_time, 60)
                timeformat = '{:02d}'.format(remaining_time)
                
                await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': 'countdown',
                        'time_remaining': timeformat,
                        'is_finished': remaining_time == 0,
                    }
                )
                await asyncio.sleep(1)
        except Exception as e:
            print(f"TOURNAMENT COUNTDOWN ERROR for {room_name}: {e}")

    async def handle_tournament_disconnect(self):
        room_name = GameConsumer.tournament_channel_to_room.get(self.channel_name)
        
        if room_name and room_name in GameConsumer.tournament_rooms:
            room_players = GameConsumer.tournament_rooms[room_name]
            remaining_player = next(
                (player for player in room_players if player["channel_name"] != self.channel_name),
                None
            )
            
            if remaining_player:
                # Notify remaining players about disconnection
                await self.channel_layer.group_send(
                    room_name,
                    {
                        'type': 'cancel',
                        'message': 'Tournament match interrupted',
                        'playertwo_name': self.scope['user'].first_name,
                        'playertwo_img': self.scope['user'].image,
                    }
                )
                
                # Clean up tournament-specific data structures
                del GameConsumer.tournament_rooms[room_name]
                del GameConsumer.tournament_channel_to_room[self.channel_name]
                del GameConsumer.tournament_channel_to_room[remaining_player["channel_name"]]

