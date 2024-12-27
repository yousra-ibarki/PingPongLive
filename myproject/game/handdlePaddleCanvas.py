import asyncio


async def handle_paddle_msg(self, content):
    try:
        async with self.__class__.lock:
            if self.room_name in self.games:
                game = self.games[self.room_name]
                y_position = content.get('y_position')
                
                # For tournament games, check in tournament rooms
                if self.room_name.startswith('match_tournament_'):
                    # Get player info from tournament pre_match_rooms
                    room_players = self.tournament_manager.pre_match_rooms[self.room_name]
                else:
                    # Regular game rooms
                    room_players = self.__class__.rooms[self.room_name]
                    
                current_player = next(
                    (player for player in room_players if player["channel_name"] == self.channel_name),
                    None
                )
                if current_player:
                    is_left_player = current_player["id"] == min(p["id"] for p in room_players)
                    if is_left_player:
                        game.paddles['left']['y'] = y_position
                    else:
                        game.paddles['right']['y'] = y_position

                    opponent = next(
                        (player for player in room_players if player["channel_name"] != self.channel_name),
                        None
                    )
                    if opponent:
                        await self.channel_layer.send(
                            opponent["channel_name"],
                            {
                                'type': 'right_positions',
                                'y_right': y_position,
                            }
                        )
    except Exception as e:
        print(f"Error in Paddle: {str(e)}")  # Improved error logging
        await self.send_json({
            'type': 'error',
            'message': f'Error in Paddle: {str(e)}'
        })
        

async def handle_canvas_resize(self, content):
    try:
        if self.room_name in self.games:
           game = self.games[self.room_name]
           new_width = content.get('canvas_width')
           new_height = content.get('canvas_height')
           game.canvas['width'] = new_width
           game.canvas['height'] = new_height
    except Exception as e:
        print(f"Error while resizing canvas: {str(e)}")
        await self.send_json({
            'type': 'error',
            'message': f"Error while resizing canvas {e}"
        })