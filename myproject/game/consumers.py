from channels.generic.websocket import AsyncJsonWebsocketConsumer
import asyncio
from typing import Dict, Tuple, Any
from functools import wraps
import time
import random


class GameState:
    def __init__(self, canvas_width, canvas_height):
        #we need to define the original width and height
        self.original_width = 800
        self.original_height = 600
        
        #we need to calculate the scale factor 
        self.scale_x = canvas_width / self.original_width
        self.scale_y = canvas_height / self.original_height
        
        
        self.ball = {
            'x': self.original_width / 2,
            'y': self.original_height / 2,
            'vx' : 3,
            'vy': 2,
            'radius': 13
        }
        
        self.paddles = {
            'left': {'x': 10  , 'y': self.original_height / 2 - 65 , 'width': 20, 'height': 130, 'dy': 0},
            'right': {'x': self.original_width - 30, 'y': self.original_height / 2 - 65 , 'width': 20, 'height': 130, 'dy': 0}
        }
        
        self.canvas = {'width': canvas_width, 'height': canvas_height, 
        'original_width': self.original_width, 'original_height': self.original_height}
        self.last_update = time.time()
        self.speed_factor = 1.08
        self.min_speed = 3
        self.max_speed = 5
    
    
    def check_collision(self, ball, paddle, is_right_paddle):
        # ball_x = self.canvas['width'] - ball['x'] if is_right_paddle else ball['x']
        
        # print(f"PADDLES {paddle['x']} {paddle['y']}")
        
        if ball['y'] == paddle['y'] :
            print(f"VIRTUAL PADDLE aaaaaaaaaaaaaaaaaaaaaaaa")
        
        
        if is_right_paddle:
            ball_x = ball['x'] - ball['radius']  # Adjust for ball radius
        else:
            ball_x = ball['x'] + ball['radius']  # Adjust for ball radius
            
        collision = (
            ball_x > paddle['x'] - ball['radius'] and  # Check if ball is to the right of the paddle's left edge
            ball_x < paddle['x'] + paddle['width'] + ball['radius'] and  # Check if ball is to the left of the paddle's right edge
            ball['y'] > paddle['y'] - ball['radius'] and  # Check if ball is above the paddle's top edge
            ball['y'] < paddle['y'] + paddle['height'] + ball['radius']  # Check if ball is below the paddle's bottom edge
        )
        
        if collision:
            print(f"Collision detected! Ball pos: ({ball['x']}, {ball['y']}), Paddle pos: ({paddle['x']}, {paddle['y']})")
            # Move ball to proper position to prevent sticking
            if is_right_paddle:
                ball['x'] =paddle['x'] - ball['radius'] - 1  # Move just outside left edge of right paddle
            else:
                ball['x'] = paddle['x'] + paddle['width'] + ball['radius'] + 1  # Move just outside right edge of left paddle
                
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
        
        # Update ball position with delta time
        self.ball['x'] += self.ball['vx'] * date * 60  # Normalize to 60 FPS
        self.ball['y'] += self.ball['vy'] * date * 60

       # Wall collisions (top and bottom)
        if self.ball['y'] - self.ball['radius'] <= 0:
            self.ball['y'] = self.ball['radius']
            self.ball['vy'] = abs(self.ball['vy'])  # Ensure positive velocity
        elif self.ball['y'] + self.ball['radius'] >= self.original_height:
            self.ball['y'] = self.original_height - self.ball['radius']
            self.ball['vy'] = -abs(self.ball['vy'])  # Ensure negative velocity

        left_collision = self.check_collision(self.ball, self.paddles['left'], False)
        right_collision = self.check_collision(self.ball, self.paddles['right'], True )

        #collision with paddles
        if (right_collision or left_collision):
        # if (left_collision or right_collision):
            print("2222222222")
            self.ball['vx'] *= -1
            # Add some randomization to prevent loops
            self.ball['vy'] += (random.random() - 0.5) * 2
            # self.control_speed()

        #increasing speed
        # self.ball['vx'] *= self.speed_factor
        # self.ball['vy'] *= self.speed_factor
        # self.control_speed()
        # Scoring
        scored = None
        if self.ball['x'] - self.ball['radius'] <= 0:
            print("right")
            scored = 'right'
            self.ball['x'] = self.canvas['width'] / 2
            self.ball['y'] = self.canvas['height'] / 2
        elif self.ball['x'] + self.ball['radius'] >= self.canvas['width']:
            scored = 'left'
            print("left")
            self.ball['x'] = self.canvas['width'] / 2
            self.ball['y'] = self.canvas['height'] / 2

        scaled_ball = {
            'x': self.ball['x'] * self.scale_x,
            'y': self.ball['y'] * self.scale_y,
            'radius': self.ball['radius'] * min(self.scale_x, self.scale_y)
        }

        return {
            'ball': scaled_ball,
            'paddles': self.paddles,
            'scored': scored,
            'original_width': self.original_width,
            'original_height': self.original_height
        }


class GameConsumer(AsyncJsonWebsocketConsumer):
    # read more about typing in python
    waiting_players: Dict[int, Tuple[str, str, str]] = {}
    channel_to_room: Dict[str, str] = {}
    rooms: Dict[str, list] = {}
    games = {}
    lock = asyncio.Lock()
    games_tasks: Dict[str, asyncio.Task] = {} #store game loop tasks for cleaning it up later
    
     
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.player_id = None
        self.waiting_player_id = None
        self.waiting_player_name = None
        self.waiting_player_img = None
        self.waiting_player_channel = None
        #this shit to update the name of the room with the first one pressed play
        
    async def stop_game_loop(self, room_name):
        # First, remove the game state to stop the game loop
        if room_name in self.games:
            print(f"Removing game state for room {room_name}")
            del self.games[room_name]
            
        # Then cancel the task
        if room_name in self.games_tasks:
            print(f"Cancelling game task for room {room_name}")
            task = self.games_tasks[room_name]
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                print(f"Game task cancelled for room {room_name}")
            del self.games_tasks[room_name]
            
        print(f"Cleanup completed for room {room_name}")
                
    async def game_loop(self, room_name):
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
                    game.ball['radius'] = 13
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
            
        except asyncio.CancelledError:
            print(f"Game loop cancelled for room {room_name}")
            await self.send_json({
                'type': 'error',
                'message': 'Game loop cancelled'
            })
            raise
        except Exception as e:
            print(f"Error in game loop: {e}")
            await self.send_json({
                'type': 'error',
                'message': f"Error in game LOOOP {e}"
            })
            if room_name in self.games:
                del self.games[room_name]
    
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
                    async with GameConsumer.lock:
                        canvas_width = content.get('canvas_width')
                        canvas_height = content.get('canvas_height')
                       
                        # Check if player is already in a room or waiting
                        if any(player_id in room for room in GameConsumer.rooms.values() if room):
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
                        #FROOOOM HERE
                        # Handle waiting players
                        if GameConsumer.waiting_players:
                            # Get first waiting player safely
                            waiting_player_id, waiting_data = next(iter(GameConsumer.waiting_players.items()))
                            if waiting_data is None or not isinstance(waiting_data, tuple) or len(waiting_data) < 3:
                                if waiting_player_id in GameConsumer.waiting_players:
                                # Invalid waiting player data, clean it up
                                    del GameConsumer.waiting_players[waiting_player_id]
                                await self.send_json({
                                    'type': 'error',
                                    'message': 'Invalid waiting player data'
                                })
                                return
                            waiting_player_channel, waiting_player_name, waiting_player_img = waiting_data
                            # Remove the waiting player we're about to pair
                            del GameConsumer.waiting_players[waiting_player_id]
                            # Don't pair with self
                            if waiting_player_id == player_id:
                                GameConsumer.waiting_players[waiting_player_id] = (waiting_player_channel, waiting_player_name, waiting_player_img)
                                await self.send_json({
                                    'type': 'error',
                                    'message': 'Cannot pair with self'
                                })
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
                            GameConsumer.waiting_players[player_id] = (self.channel_name, player_name, player_img)
                            self.room_name = None
                            print(f"PLAYER {player_name} just added to the waiting list !!!!")
                except Exception as e:
                    print(f"Error in waiting player paired {e}")
                    await self.send_json({
                        'type': 'error',
                        'message': f'Error in waiting players {e}'
                        })
        
            elif message_type == 'cancel':
                try:
                    async with GameConsumer.lock:
                        self.room_name = GameConsumer.channel_to_room.get(self.channel_name)
                        # if self.room_name:
                        #     await self.stop_game_loop(self.room_name)
                        print(f"CANCEL PRESSED ROOM NAME {self.room_name}")
                        
                        if self.room_name and self.room_name in GameConsumer.rooms:
                            room_players = GameConsumer.rooms.get(self.room_name)

                            if room_players and isinstance(room_players, list):
                                try:
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
                                except Exception as e:
                                    print(f"Error in Room Playerr {e}")
                                    await self.send_json({
                                        'type': 'error',
                                        'message': f'Error in room player {e}'
                                    })
                        # Remove from waiting list if they were waiting
                        elif self.player_id in GameConsumer.waiting_players:
                            del GameConsumer.waiting_players[self.player_id]
                            await self.send_json({
                                'type': 'cancel',
                                'message': 'Search cancelled'
                            })
                except Exception as e:
                    print(f"Error in Cancel {e}")
                    await self.send_json({
                        'type': 'error',
                        'message': f'Error in cancel {e}'
                        })
            
            
            elif message_type == 'PaddleLeft_move':
                async with GameConsumer.lock:
                    if self.room_name in self.games:
                        game = self.games[self.room_name]
                        y_position = content.get('y_position')
                        
                        # Find current player's position (left or right)
                        room_players = GameConsumer.rooms[self.room_name]
                        current_player = next(
                            (player for player in room_players if player["channel_name"] == self.channel_name),
                            None
                        )
                        
                        if current_player:
                            is_left_player = current_player["id"] == min(p["id"] for p in room_players)
                            
                            # Update the appropriate paddle in game state
                            if is_left_player:
                                game.paddles['left']['y'] = y_position
                            else:
                                game.paddles['right']['y'] = y_position
                            
                            # Send to opponent to update their display
                            opponent = next(
                                (player for player in room_players if player["channel_name"] != self.channel_name),
                                None
                            )
                            if opponent:
                                await self.channel_layer.send(
                                    opponent["channel_name"],
                                    {
                                        'type': 'right_positions',
                                        'y_right': y_position,  # This will be used to update the opponent's paddle
                                    }
                                )
        except Exception as e:
            print(f"Error in receive_json: {str(e)}")
            await self.send_json({
                'type': 'error',
                'message': 'Error in the whole receive json'
            })

    async def disconnect(self, close_code):
        try:
            async with GameConsumer.lock:
                # Clean up waiting_players
                if self.player_id in GameConsumer.waiting_players:
                    del GameConsumer.waiting_players[self.player_id]
                
                # Get room_name from the channel mapping
                self.room_name = GameConsumer.channel_to_room.get(self.channel_name)
                if self.room_name:
                    await self.stop_game_loop(self.room_name)
                    
                    
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


    async def paddle_update(self, event):
        """Handle paddle position updates"""
        await self.send_json({
            'type': 'paddle_update',
            'paddle': event['paddle'],
            'y_position': event['y_position']
        })

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
            # Check if room_name exists
            if not self.room_name:
                print("No room name available for countdown")
                await self.send_json({
                    'type': 'error',
                    'message': 'No room available for countdown'
                })
                return

            for remaining_time in range(total_time, -1, -1):
                # Check if room still exists before each iteration
                if self.room_name not in GameConsumer.rooms:
                    print("Room no longer exists during countdown")
                    await self.send_json({
                        'type': 'error',
                        'message': 'Room no longer available'
                    })
                    return

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
                await asyncio.sleep(1)

        except Exception as e:
            print(f"COUNTDOWN ERROR: {e}")
            await self.send_json({
                'type': 'error',
                'message': f'Countdown error: {str(e)}'
            })
            
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
