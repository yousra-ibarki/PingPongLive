import asyncio


async def handle_paddle_msg(self, content):
    async with self.__class__.lock:
        if self.room_name in self.games:
            game = self.games[self.room_name]
            game.paddles['left']['y'] = content.get('y_position')
            game.paddles['right']['y'] = content.get('yr_position')
            
        sender_channel = self.channel_name
        # x_left = content.get('x_position')
        y_left = content.get('y_position')
        if self.room_name and self.room_name in self.__class__.rooms:
            room_players = self.__class__.rooms[self.room_name]
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
    

# async def handle_resize_msg(self, content):
#     async with self.__class__.lock:            
#         if self.room_name in self.games:
#             game = self.games[self.room_name]
#             if game.stopped:  # Don't update if game is stopped
#                 return
#             game_state = game.update()
            
#             game.canvas['width'] = content.get('canvas_width')
#             game.canvas['height'] = content.get('canvas_height')
#             await self.channel_layer.group_send(
#                 self.room_name,
#                 {
#                     'type': 'ball_positions',
#                     'ball': game_state['ball'],
#                     'scored': game_state['scored'],
#                     'canvas_width': game.canvas['width'],
#                 }
#             )

