import asyncio
from typing import Dict, Tuple, Any, Optional

async def handle_cancel_msg(self):
    try:
        async with self.__class__.lock:            
            self.room_name = self.__class__.channel_to_room.get(self.channel_name)            
            if self.room_name and self.room_name in self.__class__.rooms:
                room_players = self.__class__.rooms.get(self.room_name)
                
                if room_players and isinstance(room_players, list):
                    try:
                        # Find the other player
                        remaining_player = next(
                            (player for player in room_players if player["id"] != self.player_id),
                            None
                        )
                        
                        # Add remaining player back to waiting list
                        if remaining_player:
                            self.__class__.waiting_players[remaining_player["id"]] = (
                                remaining_player["channel_name"],
                                remaining_player["name"],
                                remaining_player["img"]
                            )
                            #remove  the room_name !!
                            if self.channel_name in self.__class__.channel_to_room:
                                del self.__class__.channel_to_room[self.channel_name]
                            if remaining_player["channel_name"] in self.__class__.channel_to_room:
                                del self.__class__.channel_to_room[remaining_player["channel_name"]]
                            
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
                            del self.__class__.rooms[self.room_name]
                    except Exception as e:
                        print(f"Error in Room Playerr {e}")
                        await self.send_json({
                            'type': 'error',
                            'message': f'Error in room player {e}'
                        })
            # Remove from waiting list if they were waiting
            elif self.player_id in self.__class__.waiting_players:
                del self.__class__.waiting_players[self.player_id]
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