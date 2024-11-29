from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

class Profile(AbstractUser):
    # other fields
    # image = models.ImageField(upload_to='media',  null=True, blank=True)
    image = models.URLField(max_length=255, null=True, blank=True)
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return self.username

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

    from_user = models.ForeignKey(Profile, related_name='friendship_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(Profile, related_name='friendship_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=FRIENDSHIP_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f'{self.from_user} - {self.to_user}: {self.status}'

class Block(models.Model):
    blocker = models.ForeignKey(Profile, related_name='blocker', on_delete=models.CASCADE)
    blocked = models.ForeignKey(Profile, related_name='blocked', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f'{self.blocker} blocked {self.blocked}'