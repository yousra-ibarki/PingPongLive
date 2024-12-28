import asyncio


async def handle_paddle_msg(self, content):
    try:
        async with self.__class__.lock:
            if self.room_name in self.games:
                game = self.games[self.room_name]
                y_position = content.get('y_position')
                # Find current player's position (left or right)
                room_players = self.__class__.rooms[self.room_name]
                current_player = next(
                    (player for player in room_players if player["channel_name"] == self.channel_name),
                    None
                )
                if current_player:
                    is_left_player = current_player["id"] == min(p["id"] for p in room_players)
                    # Update the appropriate paddle in game state
                    #changed
                    if is_left_player:
                        game.paddles['left']['y'] = y_position #/ game.scale_y
                    else:
                        game.paddles['right']['y'] = y_position #/ game.scale_y
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
        # print(f"Error in Paddle {e}")
        await self.send_json({
            'type': 'errorr',
            'message': f'Error in Paddle {e}'
            })
        

async def handle_canvas_resize(self, content):
    try:
        self.canvas_width = content.get('canvas_width')
        self.canvas_height = content.get('canvas_height')
        
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