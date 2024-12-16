
import asyncio
from .GameState import GameState


async def handle_play_msg(self, content):
    user = self.scope['user']
    player_id = user.id
    player_name = user.first_name
    player_img = user.image
    
    async with self.__class__.lock:
        canvas_width = content.get('canvas_width')
        canvas_height = content.get('canvas_height')
        ball_owner = content.get('ball_owner')
        if self.room_name in self.games:
            game = self.games[self.room_name]
            game.paddles['right']['x'] = content.get('RpaddleX')
            game.paddles['left']['x'] = content.get('LpaddleX')
            game.paddles['right']['y'] = content.get('RpaddleY')
            game.paddles['left']['y'] = content.get('LpaddleY')
        # Check if player is already in a room or waiting
        if any(player_id in room for room in self.__class__.rooms.values()):
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
        if self.__class__.waiting_players:
            waiting_player_id, (waiting_player_channel, waiting_player_name, waiting_player_img) = self.__class__.waiting_players.popitem()
            self.waiting_player_id = waiting_player_id
            self.waiting_player_name = waiting_player_name
            self.waiting_player_img = waiting_player_img
            self.waiting_player_channel = waiting_player_channel
            # Ensure players aren't paired with themselves
            if waiting_player_id == player_id:
                self.__class__.waiting_players[waiting_player_id] = (waiting_player_channel, waiting_player_name, waiting_player_img)
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
                game = GameState(canvas_width=canvas_width, canvas_height=canvas_height, RpaddleX=content.get('RpaddleX'), RpaddleY=content.get('RpaddleY'), LpaddleX=content.get('LpaddleX'), LpaddleY=content.get('LpaddleY'))
                self.games[room_name] = game
                print("DDDDDDDDDDDD")
                # Store the task so it can be cancelled later
                self.game_tasks = getattr(self, 'game_tasks', {})
                self.game_tasks[room_name] = asyncio.create_task(self.__class__.game_loop(self, room_name))
        else:
            self.__class__.waiting_players[player_id] = (self.channel_name, player_name, player_img)
            self.room_name = None
            print(f"PLAYER {player_name} just added to the waiting list !!!!")
            
