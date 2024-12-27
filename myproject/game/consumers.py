from channels.generic.websocket import AsyncJsonWebsocketConsumer
import asyncio
from typing import Dict, Tuple
import time
import random

from .handlePlayMsg import handle_play_msg
from .handleCancelMsg import handle_cancel_msg
from .handdlePaddleCanvas import handle_paddle_msg, handle_canvas_resize

class GameConsumer(AsyncJsonWebsocketConsumer):
    # read more about typing in python
    waiting_players: Dict[int, Tuple[str, str, str]] = {}
    channel_to_room: Dict[str, str] = {}
    rooms: Dict[str, list] = {}
    games = {}
    lock = asyncio.Lock()
    games_tasks: Dict[str, asyncio.Task] = {} 
    
     
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
            target_fps = 60
            target_frame_time = 1.0 / target_fps
            
            while room_name in self.games:
                loop_start_time  = time.time()
                
                
                game = self.games[room_name]
                
                #i need to check for the game is over or not before updaing
                # if game.scoreR >= self.scoreMax or game.scoreL >= self.scoreMax:
                if game.isOver:
                    print(f"GameOver")
                    await self.stop_game_loop(self.room_name) 
                    return 
                game_state = game.update()
                
                # print(f"Sending ball positions: {game_state['ball']}")
                
                #reset the ball on scoring
                if game_state['scored']:
                    game.ball['x'] = game.canvas['width'] / 2
                    game.ball['y'] = game.canvas['height'] / 2
                    game.ball['vx'] = 3 * (1 if game_state['scored'] == 'right' else -1)
                    game.ball['vy'] = (random.random() - 1.5) * 2  # Random value between -1 and 1
                    game.ball['radius'] = 13
                
                await self.channel_layer.group_send(
                    room_name,
                    {
                        'type': 'ball_positions',
                        'ball': game_state['ball'],
                        'paddles': game_state['paddles'],
                        'scored': game_state['scored'],
                        'loser' : self.scope["user"].username,
                        'canvas_width': game.canvas['width'],
                    }
                )
                
                # await asyncio.sleep(1/120)
                
                process_time = time.time() - loop_start_time
                
                sleep_time = max(0, target_frame_time - process_time)
                await asyncio.sleep(sleep_time)
                
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
        # print("here")
        try:
            message_type = content.get('type')

            if message_type == 'play':
                await handle_play_msg(self, content)
                
            elif message_type == 'cancel':
               await handle_cancel_msg(self)
               
            elif message_type == 'PaddleLeft_move':
                await handle_paddle_msg(self, content)

            elif message_type == 'canvas_resize':
                await handle_canvas_resize(self, content)
            elif message_type == 'game_over':
                try:
                    async with GameConsumer.lock:
                        isReload = content.get("isReload")
                        
                        if isReload == "true":
                        #     await self.channel_layer.group_send(
                        #         room_name,
                        #         {
                        #             'type': 'isReload',
                        #             'message': "true",
                        #         }
                        #     )
                            if self.room_name in self.games:
                                room_players = self.__class__.rooms[self.room_name]
                                # current_player = next(
                                #     (player for player in room_players if player["channel_name"] == self.channel_name),
                                #     None
                                # )
                                opponent = next(
                                    (player for player in room_players if player["channel_name"] != self.channel_name),
                                    None
                                )
                                print(f"DJAAAANGOOOOOO {isReload} {opponent}")

                                if opponent:
                                    await self.channel_layer.send(
                                        opponent["channel_name"],
                                        {
                                            'type': 'isReload',
                                            'isReload': True,
                                            'isGameOver': True
                                            
                                        }
                                    )
                        # Clean up waiting_players
                        if self.player_id in GameConsumer.waiting_players:
                            del GameConsumer.waiting_players[self.player_id]

                        # Get room_name from the channel mapping
                        self.room_name = GameConsumer.channel_to_room.get(self.channel_name)
                        if self.room_name:
                            await self.stop_game_loop(self.room_name)

                except Exception as e:
                    print(f"error in game_over")
                    await self.send_json({
                        'type' : 'error',
                        'message' : 'Error in GAME_OVER'
                    })
            
        except Exception as e:
            print(f"Error in receive_json: {str(e)}")
            await self.send_json({
                'type': 'error',
                'message': 'Error in receive json'
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
        await self.send_json({
            'type': 'paddle_update',
            'paddle': event['paddle'],
            'y_position': event['y_position']
        })
    async def isReload(self, event):
        await self.send_json({
            'type': 'isReload',
            'isReload': event['isReload'],
            'isGameOver': event['isGameOver']
            
        })

    async def ball_positions(self, event):
        await self.send_json({
            'type': 'ball_positions',
            'ball': event['ball'],
            'paddles': event['paddles'],
            'scored': event['scored'],
            'loser' : event['loser'],
            'canvas_width': event['canvas_width'],
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

    
    async def right_positions(self, event):
        await self.send_json({
            'type': 'right_positions',
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
    