from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.conf import settings
from jwt import decode
from jwt.exceptions import InvalidTokenError
from http import cookies
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from django.db import close_old_connections
from django.core.cache import cache

class JWTAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)
        self.inner = inner

    async def __call__(self, scope, receive, send):
        close_old_connections()
        
        token = self.get_token_from_cookies(scope)
        print(f"Path: {scope['path']}")

        if not token:
            if scope['type'] == 'websocket':
                await self.close_websocket(send)
            else:
                await self.handle_unauthorized_http(send)
            return

        # Check if token is blacklisted
        if await self.is_blacklisted(token):
            if scope['type'] == 'websocket':
                await self.close_websocket(send)
            else:
                await self.handle_unauthorized_http(send)
            return

        try:
            UntypedToken(token)
            decoded_token = decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            
            user = await self.get_user(decoded_token['user_id'])
            if not user:
                if scope['type'] == 'websocket':
                    await self.close_websocket(send)
                else:
                    await self.handle_unauthorized_http(send)
                return
            scope['user'] = user
            return await super().__call__(scope, receive, send)
            
        except (InvalidToken, TokenError, InvalidTokenError) as e:
            print(f"Token validation error: {str(e)}")
            if scope['type'] == 'websocket':
                await self.close_websocket(send)
            else:
                await self.handle_unauthorized_http(send)
            return

    @database_sync_to_async
    def is_blacklisted(self, token):
        return cache.get(f'blacklist_token_{token}') is not None

    def get_token_from_cookies(self, scope):
        cookie_header = ''
        for name, value in scope.get('headers', []):
            if name == b'cookie':
                cookie_header = value.decode()
                break
        
        if not cookie_header:
            return None

        cookie = cookies.SimpleCookie()
        cookie.load(cookie_header)
        
        return cookie.get('access_token', {}).value if 'access_token' in cookie else None

    async def close_websocket(self, send):
        await send({
            "type": "websocket.close",
            "code": 4001
        })

    async def handle_unauthorized_http(self, send):
        await send({
            'type': 'http.response.start',
            'status': 401,
            'headers': [
                (b'content-type', b'application/json'),
            ]
        })
        await send({
            'type': 'http.response.body',
            'body': b'{"error": "Unauthorized"}',
        })

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return get_user_model().objects.get(id=user_id)
        except get_user_model().DoesNotExist:
            return None