from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from tournament.consumers import TournamentConsumer

websocket_urlpatterns = [
    re_path(r'ws/tournament/(?P<username>[\w-]+)/$', TournamentConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns),
})