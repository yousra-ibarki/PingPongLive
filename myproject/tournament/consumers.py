import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
import asyncio

class TournamentConsumer(AsyncWebsocketConsumer):
    tournament_players = set()
    MAX_TOURNAMENT_PLAYERS = 8
    lock = asyncio.Lock()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.player_id = None

    async def connect(self):
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
                await self.close()
                return
            
            self.user = user
            self.player_id = user.id
            await self.accept()
            print(f"[222] Player {user.username} connected!")
        except Exception as e:
            print(f"Error in connection: {str(e)}")
            await self.close()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            print("------------------------- Message from tournament ", message_type)
        except Exception as e:
            print(f"Error in receive: {str(e)}")
            await self.close()
        if message_type == 'tournament':
            await self.handle_tournament_join()
        elif message_type == 'tournament_cancel':
            await self.handle_tournament_cancel()
        elif message_type == 'tournament_ready':
            await self.handle_tournament_ready()
        elif message_type == 'tournament_start':
            await self.handle_tournament_start()
        

    async def disconnect(self, close_code):
        group_name = self.scope.get('url_route', {}).get('kwargs', {}).get('group_name')
        if group_name:
            await self.channel_layer.group_discard(group_name, self.channel_name)
        else:
            # Handle the case where group_name is None
            print("Error in disconnect: None")


    async def handle_tournament_join(self):
        # Add user to tournament players
        await self.channel_layer.group_add(
            "tournament_lobby",
            self.channel_name
        )
        self.tournament_players.add(self.user)
        print(f"USER {self.user} ADDED TO TOURNAMENT PLAYERS")

        # print the tournament players
        print("self.tournament_players ==> ", self.tournament_players)

        # Check if tournament is ready to start
        if len(self.tournament_players) == self.MAX_TOURNAMENT_PLAYERS:
            await self.start_tournament()
        else:
            await self.send(text_data=json.dumps({
                'type': 'tournament_update',
                'message': f'Players waiting: {len(self.tournament_players)}/{self.MAX_TOURNAMENT_PLAYERS}'
            }))

    async def handle_tournament_cancel(self):
        # Remove user from tournament players
        if self.user in self.tournament_players:
            self.tournament_players.remove(self.user)
            print(f"USER {self.user} REMOVED FROM TOURNAMENT PLAYERS")
        
        await self.channel_layer.group_discard(
            "tournament_lobby",
            self.channel_name
        )

    async def start_tournament(self):
        players = list(self.tournament_players)
        tournament_matches = []
        
        # Create tournament matches with serializable player data
        for i in range(0, len(players), 2):
            match = {
                'player1': {
                    'id': players[i].id,
                    'username': players[i].username,
                    'image': players[i].image
                },
                'player2': {
                    'id': players[i+1].id,
                    'username': players[i+1].username,
                    'image': players[i+1].image
                }
            }
            tournament_matches.append(match)

        # Broadcast tournament start to all players
        await self.channel_layer.group_send(
            "tournament_lobby",
            {
                'type': 'tournament_started',
                'matches': tournament_matches
            }
        )

    async def tournament_started(self, event):
        # Send tournament start message to individual players
        await self.send(text_data=json.dumps({
            'type': 'tournament_ready',
            'matches': event['matches']
        }))