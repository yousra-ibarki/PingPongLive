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
    tournament_pre_match_players: Dict[str, List[Dict]] = {}
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
        """
        Handle player entering tournament waiting list
        """
        print(f"Tournament play initiated for player: {player_name} (ID: {player_id})")

        # Check if player is already waiting or in a match
        if player_id in GameConsumer.tournament_waiting_players or \
           any(player_id in [p['id'] for p in room] for room in GameConsumer.tournament_pre_match_players.values()):
            await self.send_json({
                'type': 'error',
                'message': 'Already in tournament queue'
            })
            return

        # Add player to waiting list
        GameConsumer.tournament_waiting_players[player_id] = (
            self.channel_name, player_name, player_img
        )

        
        # Print current waiting players for debugging
        print(f"Tournament waiting players: {[(pid, player_name) for pid, (_, player_name, _) in GameConsumer.tournament_waiting_players.items()]}")
        
        # Attempt to create matches
        await self.try_create_tournament_matches()

    

    async def try_create_tournament_matches(self):
        """
        Attempt to create tournament matches when enough players are waiting.
        Supports various tournament sizes (2, 4, 8 players).
        """
        # Determine tournament sizes to support
        supported_tournament_sizes = [2, 4, 8]
        
        for tournament_size in supported_tournament_sizes:
            # Check if enough players are waiting
            if len(GameConsumer.tournament_waiting_players) >= tournament_size:
                # Get players for this tournament
                tournament_players = list(GameConsumer.tournament_waiting_players.items())[:tournament_size]
                
                print(f"Creating tournament match for {tournament_size} players")
                
                # Create a unique room name for this tournament
                room_name = f"room_{min(tournament_players[0][0], tournament_players[1][0])}_{max(tournament_players[0][0], tournament_players[1][0])}"

                pre_match_players = []

                for player_id, (channel, name, img) in tournament_players:
                    # Remove from waiting list
                    del GameConsumer.tournament_waiting_players[player_id]
                    
                    # Prepare player info for pre-match
                    player_info = {
                        "id": player_id, 
                        "channel_name": channel, 
                        "name": name, 
                        "img": img
                    }
                    pre_match_players.append(player_info)

                # Store pre-match players
                GameConsumer.tournament_pre_match_players[room_name] = pre_match_players

                print(f"PRE MATCH PLAYERS: {pre_match_players}")

                # Send pre-match notification to all selected players
                # for player in pre_match_players:
                #     await self.channel_layer.send(
                #         player['channel_name'], 
                #         {
                #             'type': 'tournament_pre_match',
                #             'room_name': room_name,
                #             'message': 'Tournament match forming',
                #             'players': [
                #                 {"name": p['name'], "img": p['img']} 
                #                 for p in pre_match_players
                #             ]
                #         }
                #     )
                
                # Start pre-match countdown
                asyncio.create_task(self.tournament_pre_match_countdown(room_name))


    async def tournament_pre_match_countdown(self, room_name, countdown_time=3):
        """
        Handle pre-match countdown with ability to replace players
        """
        try:
            for remaining_time in range(countdown_time, -1, -1):
                # Check if we still have 8 players
                current_players = GameConsumer.tournament_pre_match_players.get(room_name, [])
                
                # If we don't have 8 players, try to fill from waiting list
                while len(current_players) < 2 and GameConsumer.tournament_waiting_players:
                    # Get next waiting player
                    next_player_id, (channel, name, img) = GameConsumer.tournament_waiting_players.popitem()
                    
                    next_player = {
                        "id": next_player_id, 
                        "channel_name": channel, 
                        "name": name, 
                        "img": img
                    }
                    current_players.append(next_player)
                    
                    # Notify this player they've been added
                    # await self.channel_layer.send(
                    #     channel, 
                    #     {
                    #         'type': 'tournament_pre_match',
                    #         'room_name': room_name,
                    #         'message': 'Added to tournament match',
                    #         'players': [
                    #             {"name": p['name'], "img": p['img']} 
                    #             for p in current_players
                    #         ]
                    #     }
                    # )
                
                # Update pre-match players
                GameConsumer.tournament_pre_match_players[room_name] = current_players
                
                # If we can't get 8 players, abort tournament
                if len(current_players) < 2:
                    # Return all current players to waiting list
                    for player in current_players:
                        GameConsumer.tournament_waiting_players[player['id']] = (
                            player['channel_name'], player['name'], player['img']
                        )
                    
                    # Clear pre-match room
                    del GameConsumer.tournament_pre_match_players[room_name]
                    return
            
            # Tournament match is ready to start
            # Transition players to actual match
            await self.start_tournament_match(room_name)
        
        except Exception as e:
            print(f"Tournament pre-match error: {e}")

    async def handle_tournament_cancel(self):
        """
        Handle cancellation during pre-match countdown
        """
        # Find which pre-match room the player is in
        room_name = None
        player_to_remove = None
        
        for room, players in GameConsumer.tournament_pre_match_players.items():
            for player in players:
                if player['channel_name'] == self.channel_name:
                    room_name = room
                    player_to_remove = player
                    break
            if room_name:
                break
        
        if not room_name:
            # Player not in pre-match, might be in waiting list
            if self.player_id in GameConsumer.tournament_waiting_players:
                print(f"Tournament waiting players before removal: {GameConsumer.tournament_waiting_players}")
                del GameConsumer.tournament_waiting_players[self.player_id]
                print(f"Tournament waiting players after removal: {GameConsumer.tournament_waiting_players}")
            return
        
        # Remove player from pre-match players
        print(f"Tournament pre-match players before removal: {GameConsumer.tournament_pre_match_players}")
        current_players = GameConsumer.tournament_pre_match_players[room_name]
        current_players = [p for p in current_players if p != player_to_remove]
        print(f"Tournament pre-match players after removal: {current_players}")
        
        # Update pre-match players
        GameConsumer.tournament_pre_match_players[room_name] = current_players
        
        print(f"Tournament pre-match players after update: {GameConsumer.tournament_pre_match_players}")

        # Notify other players about cancellation
        # for player in current_players:
        #     await self.channel_layer.send(
        #         player['channel_name'], 
        #         {
        #             'type': 'tournament_player_canceled',
        #             'canceled_player_name': player_to_remove['name']
        #         }
        #     )
        
        # Restart pre-match countdown to fill the spot
        asyncio.create_task(self.tournament_pre_match_countdown(room_name))


    async def tournament_waiting_list(self):
        await self.send_json({
            "type": "tournament_waiting_list",
            "message": "Tournament waiting list",
        })

    async def start_tournament_match(self, room_name):
        """
        Transition pre-match players to actual tournament match with multiple rounds
        
        Args:
            room_name (str): Unique identifier for the tournament room
        """
        print(f"Starting tournament match for room: {room_name}")

        players = GameConsumer.tournament_pre_match_players.get(room_name, [])
        
        if len(players) != 2:
            print("Cannot start tournament - insufficient players")
            return
        
        # Shuffle players to randomize match-ups
        import random
        random.shuffle(players)
        
        # First round match-ups
        first_round_matches = [
            (players[0], players[1]),  # Match 1
            # (players[2], players[3]),  # Match 2
            # (players[4], players[5]),  # Match 3
            # (players[6], players[7])   # Match 4
        ]
        
        # Create tournament structure
        tournament_structure = {
            'room_name': room_name,
            'current_round': 1,
            'matches': first_round_matches,
            'winners': []
        }
        
        # Create individual match rooms and send player paired messages
        for match_index, (player1, player2) in enumerate(first_round_matches, 1):
            # Create unique match room
            match_room_name = f"{room_name}"
            
            # Add players to match room
            await self.channel_layer.group_add(match_room_name, player1['channel_name'])
            await self.channel_layer.group_add(match_room_name, player2['channel_name'])
            
            # Map channels to match rooms
            GameConsumer.tournament_channel_to_room[player1['channel_name']] = match_room_name
            GameConsumer.tournament_channel_to_room[player2['channel_name']] = match_room_name
            
            print(f"Self room name BEFORE: {self.room_name}")
            self.room_name = match_room_name
            print(f"Self room name AFTER: {self.room_name}")

            # Store match room information
            GameConsumer.tournament_rooms[match_room_name] = [
                {
                    "id": player1['id'], 
                    "name": player1['name'], 
                    "img": player1['img'], 
                    "channel_name": player1['channel_name']
                },
                {
                    "id": player2['id'], 
                    "name": player2['name'], 
                    "img": player2['img'], 
                    "channel_name": player2['channel_name']
                }
            ]
            
            # Send player paired message for each match
            await self.channel_layer.group_send(
                match_room_name,
                {
                    'type': 'player_paired',
                    'player1_name': player1['name'],
                    'player1_img': player1['img'],
                    'player2_name': player2['name'],
                    'player2_img': player2['img'],
                    'room_name': match_room_name,
                    'message': "Tournament ready",
                    'mode': 'tournament',
                    'match_number': match_index
                }
            )
            print(f"player1: {player1['name']} and player2: {player2['name']} are ready")
            
            # Start countdown for the match
            await self.send_tournament_countdown(match_room_name)
        
        # Clear pre-match players for this tournament
        del GameConsumer.tournament_pre_match_players[room_name]
        
        print(f"Tournament pre-match players cleared: {GameConsumer.tournament_pre_match_players}")

        # Store tournament structure (you might want to use a more persistent storage)
        # This is a placeholder and might need to be adapted based on your specific requirements
        setattr(self, f'tournament_{room_name}', tournament_structure)
        
        print(f"Tournament started with {len(first_round_matches)} matches")


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
                # await self.channel_layer.group_send(
                #     room_name,
                #     {
                #         'type': 'cancel',
                #         'message': 'Tournament match interrupted',
                #         'playertwo_name': self.scope['user'].first_name,
                #         'playertwo_img': self.scope['user'].image,
                #     }
                # )
                
                # Clean up tournament-specific data structures
                del GameConsumer.tournament_rooms[room_name]
                del GameConsumer.tournament_channel_to_room[self.channel_name]
                del GameConsumer.tournament_channel_to_room[remaining_player["channel_name"]]

