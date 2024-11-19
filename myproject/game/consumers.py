from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import cache 
import json
import asyncio

class GameConsumer(AsyncJsonWebsocketConsumer):
    waiting_players = {}
    rooms = {}
    lock = asyncio.Lock()
     
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
            print(f"Player {user.username} connected!!")
        except Exception as e:
            print(f"Error in connection: {str(e)}")
            await self.close()
          
        
    async def receive_json(self, content):
        try:
            message_type = content.get('type')
            if message_type == 'play': #add this play type to the front 
                user = self.scope['user']
                player_id = user.id
                player_name = user.first_name
                player_img = user.image
                
                async with GameConsumer.lock:
                    if GameConsumer.waiting_players:
                        waiting_player_id, (waiting_player_channel, waiting_player_name, waiting_player_img) = GameConsumer.waiting_players.popitem()

                        room_name = f"room_{min(player_id, waiting_player_id)}_{max(player_id, waiting_player_id)}"

                        await self.channel_layer.group_add(room_name, self.channel_name)
                        await self.channel_layer.group_add(room_name, waiting_player_channel)
                        
                        self.room_name = room_name
                        GameConsumer.rooms[room_name] = [
                            {"id": player_id, "name": player_name, "img": player_img},
                            {"id": waiting_player_id, "name": waiting_player_name, "img": waiting_player_img},
                        ]
                        await self.channel_layer.group_send(
                            room_name,
                            {
                                'type': 'player_paired',
                                'player1_name': player_name,
                                'player1_img': player_img,
                                'player2_name': waiting_player_name,
                                'player2_img': waiting_player_img,
                                'message': "Opponent found",
                            }
                        )
                        # print(f"NBR OF WAITING PLAYERS {len( GameConsumer.waiting_players)}")
                        print(f"PPPlayer {player_name} added to waiting list!!!")
                    else:
                        GameConsumer.waiting_players[player_id] = (self.channel_name, player_name, player_img)
                        self.room_name = None
                        print(f"Player {player_name} added to waiting list!!!")
                        
            elif message_type == 'join_game':
                if self.room_name:
                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            'type': 'join_game',
                            'message': "Searching for an opponent ...",

                        }
                    )
            elif message_type == 'cancel':
            #    self.scope['user'].id = self.scope['user'].id

                # If the player is in a room, remove them from the group
                if self.room_name:
                    print(f"Cancel pressed by {self.scope['user'].username} in room: {self.room_name}")

                    # Remove the canceling player from the room
                    # await self.channel_layer.group_discard(self.room_name, self.channel_name)

                    # Find the remaining player in the rooms
                    print(f"jfjfjfjfjf {GameConsumer.rooms}")
                    if self.room_name in GameConsumer.rooms:
                        room_players = GameConsumer.rooms[self.room_name]
                        
                        remaining_player = None
                        for player in room_players:
                            if player["id"] != self.scope['user'].id:
                                remaining_player = player
                                break
                        print(f"remaining player: {remaining_player}")
                    
                    #add the remaining player to the waiting player
                    if remaining_player:
                        GameConsumer.waiting_players[remaining_player["id"]] = (
                            remaining_player["name"],
                            remaining_player["img"],
                            remaining_player["id"],
                        )
                    print(f"Remaining player {remaining_player['name']} added back to waiting_players.")
                    # await self.channel_layer.group_send(
                    #        self.room_name,
                    #        {
                    #             'type': 'player_paired',
                    #             'player1_name': "",
                    #             'player1_img':  "",
                    #             'player2_name': "",
                    #             'player2_img':  "",
                    #             'message': "Opponent found",
                               
                    #        }
                    #    )
                    # Remove the canceling player's room
                    del GameConsumer.rooms[self.room_name]
                    print(f"Room {self.room_name} destroyed.")
                else:
                    # If the player was in waiting_players, just remove them
                    print(f"Player {self.scope['user'].username} removed from waiting_players.")
                    if self.scope['user'].id in GameConsumer.waiting_players:
                        del GameConsumer.waiting_players[self.scope['user'].id]

                print(f"Current waiting_players: {len(GameConsumer.waiting_players)}")
                # check when canceling from ahmed it will not be canceled because there is no room 
                # so automatically it will enter to else instead of ig self.room_name
                # you should know what is the fucking difference 
        except Exception as e:
            print(f"Error in receive_json: {str(e)}")
           
           
    async def player_paired(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_paired',
            'message': event['message'],
            'player1_name': event['player1_name'],
            'player1_img': event['player1_img'],
            'player2_name': event['player2_name'],
            'player2_img': event['player2_img'],
        }))

    async def disconnect(self, close_code):
        user_id = self.scope['user'].id
        async with GameConsumer.lock:
            if user_id in GameConsumer.waiting_players:
                del GameConsumer.waiting_players[user_id]
        
        print(f"Player disconnected with code: {close_code}")
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)









 # user = self.scope["user"]
            # player_id = user.id
            # username = user.username
            # player_name = user.first_name
            # player_img = user.image

            # # Pair the player if another player is waiting
            # async with GameConsumer.lock:
            #     for waiting_player_id, (waiting_player_channel, waiting_player_name, waiting_player_img) in GameConsumer.waiting_players.items():
            #         if waiting_player_id == player_id :
            #             # If the player already exists in waiting_players, do not pair or send data
            #             print(f"Player {player_name} is already in waiting players, skipping pairing.")
            #             return
            #     if GameConsumer.waiting_players:
            #         waiting_player_id, (waiting_player_channel, waiting_player_name, waiting_player_img) = GameConsumer.waiting_players.popitem()
            #         room_name = f"room_{min(player_id, waiting_player_id)}_{max(player_id, waiting_player_id)}"
                    
            #         await self.channel_layer.group_add(room_name, self.channel_name)
            #         await self.channel_layer.group_add(room_name, waiting_player_channel)

            #         self.room_name = room_name            
            #         user_id = self.scope['user'].id
            #         cache.set(f"user_{user_id}_room", self.room_name, timeout=None)

            #         await self.channel_layer.group_send(
            #             room_name,
            #             {
            #                 'type': 'player_paired',
            #                 'player1_name': player_name,
            #                 'player1_img': player_img,
            #                 'player2_name': waiting_player_name,
            #                 'player2_img': waiting_player_img,
            #                 'room_name': room_name,
            #                 'message': f'Players {player_name} and {waiting_player_name} have been paired!',
            #             }
            #         )
            #         # await self.send_json({
            #         #     "type": "players",
            #         #     'player_name': waiting_player_name,
            #         #     'player_img': waiting_player_img,
            #         #     # "message": f"Connected as {user.username}!"
            #         # })
            #     else:
            #         # No waiting player, so add this player to waiting_players
            #         GameConsumer.waiting_players[player_id] = (self.channel_name, player_name, player_img)
            #         self.room_name = None
                    
            # user_id = self.scope['user'].id
            # self.room_name = cache.get(f"user_{user_id}_room")
            # if not self.room_name:
            #     # print("Errrrrroooooooor Roome is NONE")
            #     return
            # print(f"SELFROOMNAME {self.room_name}")
            # message_type = content.get('type')
            # if message_type == 'join_game':
            #     playerTwoN = content.get('first_name')
            #     playerTwoImg = content.get('image')
                
            #     player_id = user_id
            #     if player_id in GameConsumer.waiting_players:
            #         waiting_player_channel, waiting_player_name, waiting_player_img = GameConsumer.waiting_players[player_id]
            #     else:
            #         print("Error: Player ID not found in waiting_players.")
            #         return
                
            #     print(f"PLAYERTWONAME AND PLAYERTWOUSERNAME {playerTwoN}")
            #     await self.channel_layer.group_send(
            #         self.room_name, { #ERROR cuz you don't have the room_name at second time it becomes None
            #             'type': 'join_game',
            #             'player1_name': waiting_player_name,
            #             'player1_img': waiting_player_img,
            #             'player2_name': playerTwoN,
            #             'player2_img': playerTwoImg,
            #             'message': f'Players {waiting_player_name} and {playerTwoN} have been paired!',
            #         }
            #     )