from channels.generic.websocket import AsyncJsonWebsocketConsumer
import asyncio
from typing import Dict, Tuple, Any, List
from functools import wraps
import time
from .tournament_manager import TournamentManager

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

    # Single tournament manager instance
    tournament_manager = TournamentManager()

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
    
    async def disconnect(self, close_code):
        # tournament disconnect
        if self.game_mode == 'tournament':
            await self.tournament_manager.remove_player(self.player_id)
        # Handle classic disconnect
        elif self.game_mode == 'classic':
            await self.handle_classic_disconnect()

    async def send_tournament_update(self, event):
        """Handler for tournament updates"""
        await self.send_json(event['data'])

    async def handle_classic_disconnect(self):
        try:
            # Find the room the player is in
            room_name = self.channel_to_room.get(self.player_id)
            if room_name:
                # Remove the player from the room
                self.rooms[room_name].remove(self.player_id)
                # Notify other players in the room
                await self.channel_layer.group_send(
                    room_name,
                    {
                        'type': 'player_left',
                        'player_id': self.player_id,
                    }
                )
                # Clean up the room if empty
                if not self.rooms[room_name]:
                    del self.rooms[room_name]
                    del self.channel_to_room[self.player_id]
        except Exception as e:
            # Handle any exceptions that occur
            await self.send_json({
                'error': str(e)
            })
        
    async def tournament_update(self, event):
        """
        Handle tournament update messages and forward them to the client
        """
        # Forward the message data directly to the client
        await self.send_json(event)

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
                        user = self.scope['user']
                        response = await self.tournament_manager.add_player(
                            user.id,
                            self.channel_name,
                            {
                                'name': user.first_name or user.username,
                                'img': user.image
                            }
                        )
                        await self.send_json(response)
            
            elif message_type == 'tournament_cancel':
                async with self.lock:
                    response = await self.tournament_manager.remove_player(self.player_id)
                    await self.send_json(response)

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


    