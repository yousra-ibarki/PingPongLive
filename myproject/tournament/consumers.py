import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User

class TournamentConsumer(AsyncWebsocketConsumer):
    tournament_players = set()
    MAX_TOURNAMENT_PLAYERS = 8

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        # Remove player from tournament if disconnected
        if self.user in self.tournament_players:
            self.tournament_players.remove(self.user)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'tournament':
            await self.handle_tournament_join()
        elif message_type == 'tournament_cancel':
            await self.handle_tournament_cancel()

    async def handle_tournament_join(self):
        # Add user to tournament players
        await self.channel_layer.group_add(
            "tournament_lobby",
            self.channel_name
        )
        self.tournament_players.add(self.user)

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
        
        await self.channel_layer.group_discard(
            "tournament_lobby",
            self.channel_name
        )

    async def start_tournament(self):
        # Logic to start tournament and match players
        # This is a simplified example
        players = list(self.tournament_players)
        tournament_matches = []
        
        # Create tournament matches (4 matches for 8 players)
        for i in range(0, len(players), 2):
            match = {
                'player1': players[i],
                'player2': players[i+1]
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