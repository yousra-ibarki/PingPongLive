from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json

class GameConsumer(AsyncJsonWebsocketConsumer):
    waiting_players = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None

    async def connect(self):
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
                await self.close()
                return
            
            await self.accept()
            
            # await self.send_json({
            #     "type": "connection_established",
            #     "message": f"Connected as {user.username}!"
            # })

            player_id = user.id
            username = user.username

            # Pair the player if another player is waiting
            if GameConsumer.waiting_players:
                waiting_player_id, (waiting_player_channel, waiting_player_name, waiting_player_img) = GameConsumer.waiting_players.popitem()
                
                room_name = f"room_{min(player_id, waiting_player_id)}_{max(player_id, waiting_player_id)}"
                
                await self.channel_layer.group_add(room_name, self.channel_name)
                await self.channel_layer.group_add(room_name, waiting_player_channel)
                
                self.room_name = room_name            

                # await self.channel_layer.group_send(
                #     room_name,
                #     {
                #         'type': 'player_paired',
                #         'player2_name': waiting_player_name,
                #         'player2_img': waiting_player_img,
                #         'room_name': room_name,
                #         'message': f'Players {self.scope["user"].first_name} and {waiting_player_id} have been paired!',
                #     }
                # )
                await self.send_json({
                    "type": "players",
                    'player_name': waiting_player_name,
                    'player_img': waiting_player_img,
                    # "message": f"Connected as {user.username}!"
                })
            else:
                # No waiting player, so add this player to waiting_players
                GameConsumer.waiting_players[player_id] = (self.channel_name, self.scope["user"].first_name, self.scope["user"].image)
                self.room_name = None
        
        except Exception as e:
            print(f"Error in connection: {str(e)}")
            await self.close()

    async def player_paired(self, event):
        print("player_paired event ", event)
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'player_paired', 
            'message': message,
            'room_name': event['room_name'],
            'player2_name': event['player2_name'],
            'player2_img': event['player2_img'],
        }))

    # async def receive_json(self, content):
    #     try:
    #         message_type = content.get('type')
             
    #         if message_type == 'game_update':
    #             player_id = content.get('player_id')
    #             player_position = content.get('player_position')
    #             ball_position = content.get('ball_position')

    #             print(f"Incoming data: Player {player_id} at {player_position}, Ball at {ball_position}")
                
    #             await self.channel_layer.group_send(
    #                 self.room_name, {
    #                     'type': 'game_update',
    #                     'player_id': player_id,
    #                     'player_position': player_position,
    #                     'ball_position': ball_position
    #                 }
    #             )
            
    #         print(f"Player action from {self.scope['user'].username} with id: {self.scope['user'].id}")
        
    #     except Exception as e:
    #         print(f"Error in receive_json: {str(e)}")




    async def disconnect(self, close_code):
        user_id = self.scope['user'].id
        if user_id in GameConsumer.waiting_players:
            del GameConsumer.waiting_players[user_id]
        
        print(f"Disconnected with code: {close_code}")
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)
