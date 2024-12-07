from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from myapp.consumers import NotificationConsumer

websocket_urlpatterns = [
    re_path(r'wss/notifications/$', NotificationConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns),
})