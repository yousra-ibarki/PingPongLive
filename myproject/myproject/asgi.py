"""
ASGI config for myproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""


import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from game.routing import websocket_urlpatterns as game_websocket_urlpatterns
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from myapp.routing import websocket_urlpatterns as myapp_websocket_urlpatterns

# Set the Django settings module before any Django imports

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from chat import routing
from .middleware import JWTAuthMiddleware

# Initialize the ASGI application
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            game_websocket_urlpatterns + chat_websocket_urlpatterns + myapp_websocket_urlpatterns
        )
    ),
})
