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



    def __str__(self):
        return self.username

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)



class MatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='match_history')
    opponent = models.CharField(max_length=255)
    result = models.CharField(max_length=10, choices=[('WIN', 'Win'), ('LOSE', 'Lose')])
    date = models.DateTimeField(auto_now_add=True)

class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    name = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
