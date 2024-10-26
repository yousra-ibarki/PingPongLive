from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json

class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive_json(self, content):
        pass
