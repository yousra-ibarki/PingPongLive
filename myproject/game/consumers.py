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
            player_name = user.first_name
            player_img = user.image

            # Pair the player if another player is waiting
            if GameConsumer.waiting_players:
                waiting_player_id, (waiting_player_channel, waiting_player_name, waiting_player_img) = GameConsumer.waiting_players.popitem()
                
                room_name = f"room_{min(player_id, waiting_player_id)}_{max(player_id, waiting_player_id)}"
                
                await self.channel_layer.group_add(room_name, self.channel_name)
                await self.channel_layer.group_add(room_name, waiting_player_channel)
                
                self.room_name = room_name            
                print(f"ROOOOOOOOOOMMM {self.room_name}")

                await self.channel_layer.group_send(
                    room_name,
                    {
                        'type': 'player_paired',
                        'player1_name': player_name,
                        'player1_img': player_img,
                        'player2_name': waiting_player_name,
                        'player2_img': waiting_player_img,
                        'room_name': room_name,
                        'message': f'Players {player_name} and {waiting_player_name} have been paired!',
                    }
                )
                # await self.send_json({
                #     "type": "players",
                #     'player_name': waiting_player_name,
                #     'player_img': waiting_player_img,
                #     # "message": f"Connected as {user.username}!"
                # })
            else:
                # No waiting player, so add this player to waiting_players
                GameConsumer.waiting_players[player_id] = (self.channel_name, player_name, player_img)
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
            'player1_name': event['player1_name'],
            'player1_img': event['player1_img'],
            'player2_name': event['player2_name'],
            'player2_img': event['player2_img'],
        }))

    async def receive_json(self, content):
        try:
            message_type = content.get('type')
            if message_type == 'join_game':
                playerTwoN = content.get('first_name')
                playerTwoUN = content.get('username')
                print(f"ROOOOOOOOOOMMM {self.room_name}")
                await self.channel_layer.group_send(
                    self.room_name, {
                        'type': 'join_game',
                        'player_name' : playerTwoN,
                        'player_username' : playerTwoUN,
                        'msg' : "messsageeee",
                    }
                )
            print(f"LLLLLLL {playerTwoN} AND {playerTwoUN}")
            # if message_type == 'game_update':
            #     player_id = content.get('player_id')
            #     player_position = content.get('player_position')
            #     ball_position = content.get('ball_position')
            # print(f"Incoming data: Player {player_id} at {player_position}, Ball at {ball_position}")
                
                # await self.channel_layer.group_send(
                #     self.room_name, {
                #         'type': 'game_update',
                #         'player_id': player_id,
                #         'player_position': player_position,
                #         'ball_position': ball_position
                #     }
                # )
            
            # print(f"Player action from {self.scope['user'].username} with id: {self.scope['user'].id}")
        
        except Exception as e:
            print(f"Error in receive_json: {str(e)}")

    async def join_game(self, event):
        player_name = event['player_name']
        player_username = event['player_username']
        msg = event['msg']



    async def disconnect(self, close_code):
        user_id = self.scope['user'].id
        if user_id in GameConsumer.waiting_players:
            del GameConsumer.waiting_players[user_id]
        
        print(f"Disconnected with code: {close_code}")
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)
