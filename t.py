from channels.generic.websocket import AsyncJsonWebsocketConsumer
import asyncio
from typing import Dict, Tuple, Any
from functools import wraps
import time
from django.core.cache import cache
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model


# def rate_limit(limit):
#     def decorator(func):
#         last_called = {}
#         @wraps(func)
#         async def wrapper(self, *args, **kwargs):
#             now = time.time()
#             if self.channel_name in last_called:
#                 elapsed = now - last_called[self.channel_name]
#                 if elapsed < limit:
#                     return
#             last_called[self.channel_name] = now
#             return await func(self, *args, **kwargs)
#         return wrapper
#     return decorator


class GameConsumer(AsyncJsonWebsocketConsumer):
    # read more about typing in python
    waiting_players: Dict[int, Tuple[str, str, str]] = {}
    channel_to_room: Dict[str, str] = {}
    rooms: Dict[str, list] = {}
    #to avoid race condition 
    lock = asyncio.Lock()
    waiting_games = {}  # To store players waiting with their game IDs
    
     
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.player_id = None
        self.waiting_player_id = None
        self.waiting_player_name = None
        self.waiting_player_img = None
        self.waiting_player_channel = None
        #this shit to update the name of the room with the first one pressed play
        
    async def connect(self):
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
                await self.close()
                return
            
            self.player_id = user.id
            await self.accept()
            print(f"Player {user.username} connected!")
        except Exception as e:
            print(f"Error in connection: {str(e)}")
            await self.close()
          
    async def receive_json(self, content):
        try:
            message_type = content.get('type')
            if message_type == 'play':
                user = self.scope['user']
                game_id = content.get('game_id')  # Get game_id from the play message

                player_id = user.id
                player_name = user.first_name
                player_img = user.image
                
                async with GameConsumer.lock:
                    # If game_id is provided, try to join that specific game
                    if game_id and game_id in GameConsumer.waiting_games:
                        waiting_player = GameConsumer.waiting_games[game_id]
                        del GameConsumer.waiting_games[game_id]  # Remove from waiting list
                        
                        room_name = f"room_{min(player_id, waiting_player['id'])}_{max(player_id, waiting_player['id'])}"
                        
                        # Add both players to the room group
                        await self.channel_layer.group_add(room_name, self.channel_name)
                        await self.channel_layer.group_add(room_name, waiting_player['channel_name'])
                        
                        GameConsumer.channel_to_room[self.channel_name] = room_name
                        GameConsumer.channel_to_room[waiting_player['channel_name']] = room_name
                        
                        self.room_name = room_name
                        
                        GameConsumer.rooms[room_name] = [
                            {"id": player_id, "name": player_name, "img": player_img, "channel_name": self.channel_name},
                            {"id": waiting_player['id'], "name": waiting_player['name'], "img": waiting_player['img'], "channel_name": waiting_player['channel_name']},
                        ]
                        
                        if self.room_name and self.room_name in GameConsumer.rooms:
                            room_players = GameConsumer.rooms[self.room_name]
                            if room_players and all(player.get("id") is not None for player in room_players):
                                player_with_min_id = min(room_players, key=lambda player: player["id"])
                                ball_owner = player_with_min_id["name"]
                        
                        asyncio.create_task(self.send_countdown())
                        
                        await self.channel_layer.group_send(
                            room_name,
                            {
                                'type': 'player_paired',
                                'player1_name': player_name,
                                'ball_owner': ball_owner,
                                'player1_img': player_img,
                                'player2_name': waiting_player['name'],
                                'player2_img': waiting_player['img'],
                                'room_name': room_name,
                                'message': "Opponent found",
                            }
                        )
                        return
                    
                    # Your existing matchmaking logic for non-game-request matches...
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

                    # Store player in waiting_games with their game ID
                    GameConsumer.waiting_games[game_id] = {
                        'id': player_id,
                        'name': player_name,
                        'img': player_img,
                        'channel_name': self.channel_name
                    }

                    if GameConsumer.waiting_players:
                        waiting_player_id, (waiting_player_channel, waiting_player_name, waiting_player_img) = GameConsumer.waiting_players.popitem()
                        self.waiting_player_id = waiting_player_id
                        self.waiting_player_name = waiting_player_name
                        self.waiting_player_img = waiting_player_img
                        self.waiting_player_channel = waiting_player_channel
                        # Ensure players aren't paired with themselves
                        if waiting_player_id == player_id:
                            GameConsumer.waiting_players[waiting_player_id] = (waiting_player_channel, waiting_player_name, waiting_player_img)
                            return

                        room_name = f"room_{min(player_id, waiting_player_id)}_{max(player_id, waiting_player_id)}"

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
                        if self.room_name and self.room_name in GameConsumer.rooms:
                            room_players = GameConsumer.rooms[self.room_name]
                        
                        # Only attempt to find min ID if we have valid players
                        if room_players and all(player.get("id") is not None for player in room_players):
                            player_with_min_id = min(room_players, key=lambda player: player["id"])
                            ball_owner = player_with_min_id["name"]
                        
                        #create_task it wrap the coroutine to send it later !!
                        asyncio.create_task(self.send_countdown())
                        
                        await self.channel_layer.group_send(
                            room_name,
                            {
                                'type': 'player_paired',
                                'player1_name': player_name,
                                'ball_owner': ball_owner,
                                'player1_img': player_img,
                                'player2_name': waiting_player_name,
                                'player2_img': waiting_player_img,
                                'room_name': room_name,
                                'message': "Opponent found",
                            }
                        )
            
                    else:
                        GameConsumer.waiting_players[player_id] = (self.channel_name, player_name, player_img)
                        self.room_name = None
                        print(f"PLAYER {player_name} just added to the waiting list !!!!")
                        
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
                # user = self.scope['user']
                # player_name = user.first_name
                # player_img = user.image
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
                    
                    # # Only update room players if we have all necessary IDs
                    # if self.player_id is not None and self.waiting_player_id is not None:
                    #     GameConsumer.rooms[self.room_name] = [
                    #         {"id": self.player_id, "name": player_name, "img": player_img, "channel_name": self.channel_name},
                    #         {"id": self.waiting_player_id, "name": self.waiting_player_name, "img": self.waiting_player_img, "channel_name": self.waiting_player_channel},
                    #     ]
                        
                    if self.room_name and self.room_name in GameConsumer.rooms:
                    #     room_players = GameConsumer.rooms[self.room_name]
                        
                    #     # Only attempt to find min ID if we have valid players
                    #     if room_players and all(player.get("id") is not None for player in room_players):
                    #         player_with_min_id = min(room_players, key=lambda player: player["id"])
                    #         ball_owner = player_with_min_id["name"]

                        await self.channel_layer.group_send(
                            self.room_name,
                            {
                                'type': 'ball_positions',
                                'x_ball': x_ball,
                                'y_ball': y_ball,
                                'x_velocity': x_velocity,
                                'y_velocity': y_velocity,
                                # 'ball_owner': ball_owner,
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
                'message': 'An error occurred'
            })
    
    async def ball_positions(self, event):
        await self.send_json({
            'type': 'ball_positions',
            # 'ball_owner': event['ball_owner'],
            # 'player_side': event['player_side'],
            'x_ball': event['x_ball'],
            'y_ball': event['y_ball'],
            'x_velocity': event['x_velocity'],
            'y_velocity': event['y_velocity'],
        })
    
    async def right_positions(self, event):
        await self.send_json({
            'type': 'right_positions',
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
            'ball_owner': event['ball_owner'],
            'player1_name': event['player1_name'],
            'player1_img': event['player1_img'],
            'player2_name': event['player2_name'],
            'player2_img': event['player2_img'],
        })

    async def disconnect(self, close_code):
        try:
            async with GameConsumer.lock:
                # Clean up waiting_players
                if self.player_id in GameConsumer.waiting_players:
                    del GameConsumer.waiting_players[self.player_id]
                
                # Get room_name from the channel mapping
                self.room_name = GameConsumer.channel_to_room.get(self.channel_name)
                
                # Clean up rooms and notify other player
                if self.room_name and self.room_name in GameConsumer.rooms:
                    room_players = GameConsumer.rooms[self.room_name]
                    remaining_player = next(
                        (player for player in room_players if player["id"] != self.player_id),
                        None
                    )
                    
                    if remaining_player:
                        # Add remaining player back to waiting list
                        GameConsumer.waiting_players[remaining_player["id"]] = (
                            remaining_player["channel_name"],
                            remaining_player["name"],
                            remaining_player["img"]
                        )
                        
                        # Clean up channel to room mappings
                        if self.channel_name in GameConsumer.channel_to_room:
                            del GameConsumer.channel_to_room[self.channel_name]
                        if remaining_player["channel_name"] in GameConsumer.channel_to_room:
                            del GameConsumer.channel_to_room[remaining_player["channel_name"]]
                        print(f"roooooooooooom name ", self.room_name )
                        # Notify remaining player
                        await self.channel_layer.group_send(
                            self.room_name,
                            {
                                'type': 'cancel',
                                'message': 'Searching for new opponent...',
                                'playertwo_name': self.scope['user'].first_name,
                                'playertwo_img': self.scope['user'].image,
                            }
                        )
                    
                    # Clean up the room
                    del GameConsumer.rooms[self.room_name]
                    
                await self.channel_layer.group_discard(self.room_name, self.channel_name)
        except Exception as e:
            print(f"Error in disconnect: {str(e)}")

    @database_sync_to_async
    def get_user_info(self, user_id):
        User = get_user_model()
        user = User.objects.get(id=user_id)
        return {
            'id': user.id,
            'name': user.first_name,
            'img': user.image,
            'channel_name': next((channel for channel, room in GameConsumer.channel_to_room.items() if room == self.room_name), None)
        }


