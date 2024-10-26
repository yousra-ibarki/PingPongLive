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

class JWTAuthMiddleware(BaseMiddleware):
    """The __init__ method initializes the middleware with an inner application.
    The inner parameter represents the next application or middleware in the stack"""
    def __init__(self, inner):
        super().__init__(inner)
        self.inner = inner
    """The __call__ method is called when the middleware is invoked.
    when a WebSocket connection is established and the middleware is called,"""
    async def __call__(self, scope, receive, send):
        # Close old database connections to prevent usage of timed out connections
        close_old_connections()

        # Get the token from cookies
        token = self.get_token_from_cookies(scope)
        
        if not token:
            await self.close_connection(send)
            return

        try:
            # Verify the token
            UntypedToken(token)
            decoded_token = decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            
            # Get the user using the user ID from the decoded token
            user = await self.get_user(decoded_token['user_id'])
            if not user:
                await self.close_connection(send)
                return
            
            # Add the authenticated user to the scope
            scope['user'] = user
        except (InvalidToken, TokenError, InvalidTokenError) as e:
            print(f"Token validation error: {str(e)}")
            await self.close_connection(send)
            return

        return await super().__call__(scope, receive, send)

    def get_token_from_cookies(self, scope):
        """Extract the JWT token from the cookies in the scope"""
        cookie_header = ''
        for name, value in scope.get('headers', []):
            if name == b'cookie':
                cookie_header = value.decode()
                break
        
        if not cookie_header:
            return None

        cookie = cookies.SimpleCookie()
        cookie.load(cookie_header)
        
        # Try to get the access token from cookies
        if 'access_token' in cookie:
            return cookie['access_token'].value
        return None

    async def close_connection(self, send):
        await send({
            "type": "websocket.close",
            "code": 4001  # Custom error code for authentication failure
        })

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return get_user_model().objects.get(id=user_id)
        except get_user_model().DoesNotExist:
            return None