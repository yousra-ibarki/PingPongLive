from channels.generic.websocket import AsyncJsonWebsocketConsumer
import asyncio
from typing import Dict, Tuple, Any
from functools import wraps
import time


class GameState:
    def __init__(self, canvas_width, canvas_height, RpaddleX, RpaddleY, LpaddleX, LpaddleY):

        self.ball = {
            'x': canvas_width / 2,
            'y': canvas_height / 2,
            'vx' : 3,
            'vy': 2,
            'radius': 17
        }
        
        self.paddles = {
            'left': {'x': LpaddleX  , 'y': LpaddleY , 'width': 20, 'height': 130, 'dy': 0},
            'right': {'x': RpaddleX, 'y': LpaddleY , 'width': 20, 'height': 130, 'dy': 0}
        }
        
        self.canvas = {'width': canvas_width, 'height': canvas_height}
        self.last_update = time.time()
        self.speed_factor = 1.08
        self.min_speed = 3
        self.max_speed = 5
        
    
    def check_collision(self, ball, paddle, is_right_paddle):
        ball_x = self.canvas['width'] - ball['x'] if is_right_paddle else ball['x']
        
        # ball_y = self.canvas['height'] - ball['y'] if is_left_paddle else ball['y']
        collision = (
            ball['x'] + ball['radius'] > paddle['x'] and
            ball['x'] - ball['radius'] < paddle['x'] + paddle['width'] and
            ball['y'] > paddle['y'] and
            ball['y'] < paddle['y'] + paddle['height']
        )
        if not is_right_paddle:
            print(f"Left Paddle: , {paddle['x']}, {paddle['y']}")
        else:
            print(f"Right Paddle: , {paddle['x']}, {paddle['y']}")
   

        
        # print(f"BALL AT {ball['x']} PADDLE AT {paddle['x']}")
        if collision:
            print(f"COLLISION DETECTED with paddle at x={paddle['x']}")
            
        return collision
    
    def control_speed(self):
        speed = (self.ball['vx'] ** 2 + self.ball['vy'] ** 2) ** 0.5
        if speed < self.min_speed or speed > self.max_speed:
            scale = min(self.max_speed / speed, max(self.min_speed / speed, 1))
            self.ball['vx'] *= scale
            self.ball['vy'] *= scale
     
    def update(self):
        current_time = time.time()
        date = current_time - self.last_update
        self.last_update = current_time
        # print(f"DATE {date}")
        
        #update ball 
        self.ball['x'] += self.ball['vx']
        self.ball['y'] += self.ball['vy']

        #ball collision
        if(self.ball['y'] - self.ball['radius'] < 0 or self.ball['y'] + self.ball['radius'] > self.canvas['height']):
            print("11111111111")
            self.ball['vy'] *= -1

        left_collision = self.check_collision(self.ball, self.paddles['left'], False)
        right_collision = self.check_collision(self.ball, self.paddles['right'], True )

        # print(f"LEFT COLLISION {left_collision} RIGHT COLLISION {right_collision}")
        #collision with paddles
        if (left_collision or right_collision):
            print("2222222222")
            self.ball['vx'] *= -1


        #increasing speed
        # self.ball['vx'] *= self.speed_factor
        # self.ball['vy'] *= self.speed_factor
        # self.control_speed()

        # print(f"RIGHT {self.ball['x'] - self.ball['radius']}")
        scored = None
        if self.ball['x'] - self.ball['radius'] < 0 :
            print("33333333333")
            scored = 'right'
        elif self.ball['x'] + self.ball['radius'] > self.canvas['width']:
            print("44444444444")
            scored = 'left'

        return {
            'ball': self.ball,
            'paddles': self.paddles,
            'scored': scored
        }


class GameConsumer(AsyncJsonWebsocketConsumer):
    # read more about typing in python
    waiting_players: Dict[int, Tuple[str, str, str]] = {}
    channel_to_room: Dict[str, str] = {}
    rooms: Dict[str, list] = {}
    games = {}
    #to avoid race condition 
    lock = asyncio.Lock()
    
     
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

                player_id = user.id
                player_name = user.first_name
                player_img = user.image
                
                async with GameConsumer.lock:
                    canvas_width = content.get('canvas_width')
                    canvas_height = content.get('canvas_height')
                    ball_owner = content.get('ball_owner')
                    RpaddleX = content.get('RpaddleX')
                    RpaddleY = content.get('RpaddleY')
                    LpaddleX = content.get('LpaddleX')
                    LpaddleY = content.get('LpaddleY')
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
                                player_with_max_id = max(room_players, key=lambda player: player["id"])
                                left_player = player_with_min_id["name"]
                                right_player = player_with_max_id["name"]
                                print(f"LEFT PLAYER {left_player} RIGHT PLAYER {right_player}")
                        #create_task it wrap the coroutine to send it later !!
                        asyncio.create_task(self.send_countdown())
                        print(f"PLAYER NAME B {user.first_name}")
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
                            self.games[room_name] = GameState(canvas_width=canvas_width, canvas_height=canvas_height, RpaddleX=RpaddleX, RpaddleY=RpaddleY, LpaddleX=LpaddleX, LpaddleY=LpaddleY)
                            print("DDDDDDDDDDDD")
                            asyncio.create_task(self.game_loop(room_name, LpaddleX, LpaddleY, RpaddleX, RpaddleY))
            
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
            
            elif message_type == 'PaddleLeft_move':
                async with GameConsumer.lock:
                    if self.room_name in self.games:
                        game = self.games[self.room_name]
                        game.paddles['left']['y'] = content.get('y_position')
                        game.paddles['right']['y'] = content.get('yr_position')
                        
                    sender_channel = self.channel_name
                    # x_left = content.get('x_position')
                    y_left = content.get('y_position')

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
                                    # 'x_right': x_left,
                                    'y_right': y_left,
                                },
                            )
                        # print(f"x_position {x_left}, y_position {y_left} !!")

        except Exception as e:
            print(f"Error in receive_json: {str(e)}")
            await self.send_json({
                'type': 'error',
                'message': 'An error occurred'
            })
            
    
    async def game_loop(self, room_name, LpaddleX, LpaddleY, RpaddleX, RpaddleY):
        try:
            while room_name in self.games:
                game = self.games[room_name]
                game_state = game.update()
                
                # print(f"Sending ball positions: {game_state['ball']}")
                
                #reset the ball on scoring
                if game_state['scored']:
                    game.ball['x'] = game.canvas['width'] / 2
                    game.ball['y'] = game.canvas['height'] / 2
                    # game.ball['vx'] = 3 * (-1 if game_state['scored'] == 'right' else 1)
                    # game.ball['vy'] = (random.random() - 0.5) * 2  # Random value between -1 and 1
                    game.ball['radius'] = 17
                await self.channel_layer.group_send(
                    room_name,
                    {
                        'type': 'ball_positions',
                        'ball': game_state['ball'],
                        # 'paddles': game_state['paddles'],
                        'scored': game_state['scored'],
                        'canvas_width': game.canvas['width'],
                    }
                )
                await asyncio.sleep(1/120)
            
            
        except Exception as e:
            print(f"ERORO IN GAME LOOP {e}")
            
    
    
    async def ball_positions(self, event):
        await self.send_json({
            'type': 'ball_positions',
            'ball': event['ball'],
            # 'paddles': event['paddles'],
            'scored': event['scored'],
            'canvas_width': event['canvas_width'],
        })
    
    
    async def right_positions(self, event):
        await self.send_json({
            'type': 'right_positions',
            # 'x_right': event['x_right'],
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
            'left_player': event['left_player'],
            'right_player': event['right_player'],
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









