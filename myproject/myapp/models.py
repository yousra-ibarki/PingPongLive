from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class User(AbstractUser):
    # other fields
    image = models.URLField(max_length=255, null=True, blank=True)
    is_online = models.BooleanField(default=False)
    is_2fa_enabled = models.BooleanField(default=False)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    level = models.IntegerField(default=0)
    winrate = models.FloatField(default=0)
    rank = models.IntegerField(default=0)
    total_goals_scored = models.IntegerField(default=0)
    match_history = models.ManyToManyField('game.GameResult', related_name='match_history', blank=True)
    achievements = models.ManyToManyField('Achievement', related_name='profiles', blank=True)
    language = models.CharField(max_length=255, default='en')
    last_active = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

class Achievement(models.Model):
    # user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    achievement = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    icon = models.URLField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.achievement

    class Meta:
        ordering = ['-date']


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

class Friendship(models.Model):
    FRIENDSHIP_STATUS = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('blocked', 'Blocked')
    ]

    from_user = models.ForeignKey(User, related_name='friendship_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friendship_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=FRIENDSHIP_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f'{self.from_user} - {self.to_user}: {self.status}'

class Block(models.Model):
    blocker = models.ForeignKey(User, related_name='blocker', on_delete=models.CASCADE)
    blocked = models.ForeignKey(User, related_name='blocked', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f'{self.blocker} blocked {self.blocked}'


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('notify_chat_message', 'Chat Message'),
        ('notify_game_request', 'Game Request'),
        ('notify_friend_request', 'Friend Request'),
        ('game_response', 'Game Response'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} for {self.recipient.username}"

# after making a new model or making changes to a models we use:
# python manage.py makemigrations
# python manage.py migrate    
