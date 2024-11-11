# yourapp/consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import async_to_sync
import json

class GameConsumer(AsyncJsonWebsocketConsumer):
    #__init__ is a method used to initialize an instance of a class 
    #self reffers t the instance of the class itself (this)
    #args/kwargs allows the func accept an arbitrary nbr of positional arg and keyword args
    
    waiting_players = {}
    
    def __init__(self, *args, **kwargs):
        #super to call the constructor of the class that we inherited from
        super().__init__(*args, **kwargs)
        self.user_room = None

    async def connect(self):
        try:
            #check if the user is authenticated or not if yes continue if no return 
            user = self.scope["user"]
            if not user.is_authenticated:
                await self.close()
                return
            
            # #creates a user room which is an instance attribute 
            # self.user_room = user.username
            
            # #adding the user that just athenticated to the room that just created
            # #await is a keyword that ensures the completing of the current task before executing the next one\
            # #it's used with async fcts to handle long-running tasks without blocking the entire program
            # await self.channel_layer.group_add(
            #     self.user_room,
            #     self.channel_name
            # )

            #accept the connection from the current user
            await self.accept()
            print(f"User {self.user_room} connected!")
            
            #sends JSON data over WebSocket/HTTP to the client which is a msg indicating a connection has been established
            await self.send_json({
                "type": "connection_established",
                "message": f"Connected as {self.user_room}!"
            })
            
            
            player_id = user.id
            username = user.username

            if GameConsumer.waiting_players:
                waiting_players_id, waiting_player_channel = GameConsumer.waiting_players.popitem()
                
                room_name = f"room_{min(playerid, waiting_player_id)}_{max(player_id, waiting_player_id)}"
                
                await self.channel_layer.group_add(room_name,  self.channel_name)
                await self.channel_layer.group_add(room_name, waiting_player_channel)
                
                self.room_name = room_name            
                #here where you can cancle the waiting for other players in front place the player in his place
                await self.channel_layer.group_send(
                room_name,
                {
                    'type': 'player_paired',
                    'message': f'Players {username} and {waiting_player_id} have been paired!',
                    'room_name': room_name,
                })
            else:
                # No waiting player, so add this player to waiting_players
                GameConsumer.waiting_players[player_id] = self.channel_name
                self.room_name = None
            
        #handle if try throw an exception by printing error and close the connection
        except Exception as e:
            print(f"ErrorErrorErrorError in connection : {str(e)}")
            await self.close()

    #disconnecting by removing the current connection after checking if user_roome is not none
    async def disconnect(self, close_code):
        if self.scope['user'].id in GameConcumer.waiting_players:
            del GameConsumer.waiting_players[self.scope['user'].id]
        )
        print(f"Disconnected with code: {close_code}")

    #handle the data comes from the game app such as the ball/rackets positiong as a JSON 
    async def receive_json(self, content):
        user = self.scope["user"]
        try:
            #get the type of the received data
            message_type = content.get('type')
            
            
            #handles the position of the objects in the game generally                
            # if message_type == 'game_update':
            #     #get the data needed 
            #     player_id = content.get('player_id')
            #     player_position = content.get('player_position')
            #     ball_position = content.get('ball_position')

            #     print(f"Incoming data are : Player {player_id} at {player_position}, Ball at {ball_position}")
                
            #     #send the data to all player in the room
            #     await self.channel_layer.group_send(
            #         self.user_room,{
            #             'type' : 'game_update',
            #             'player_id' : player_id,
            #             'player_position' : player_position,
            #             'ball_position' : ball_position
            #         }
            #     )
                
                
                
            #handles the position of the individual player actions
            if message_type == 'join_game':
                username = content.get('username')
                player_id = content.get('player_id')
                print(f"UUUUUUUUUUUUUUUUUU: player {username} - {player_id}") 
                print(f"TESSSSSS : {user.id}")
                #send the data to other players
                # await self.channel_layer.group_send(
                #     self.user_room,{
                #         'type': 'broadcast_join_game',
                #         'player_id' : player_id,
                #         'username' : username
                #     }
                # )

        #handle the try in case it throws an error
        except Exception as e:
            print(f"Error in receive_json: {str(e)}")
    # Add this method to handle the broadcast message within the same consumer class
    # async def broadcast_join_game(self, event):
    #     # Broadcast the join event to WebSocket clients
    #     await self.send_json({
    #         'type': 'join_game',
    #         'username': event['username'],
    #         'player_id': event['player_id'],
    #     })






    #     data = json.loads(text_data)
    #     await self.channel_layer.group_send(
    #         self.user_room,
    #         {
    #             'type': 'game_message',
    #             'data': data
    #         }
    #     )

    # async def game_message(self, event):
    #     await self.send(text_data=json.dumps(event['data']))




