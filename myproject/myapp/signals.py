from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import AbstractUser
from .models import MatchHistory, Achievement

@receiver(post_save, sender=AbstractUser)
def create_initial_data(sender, instance, created, **kwargs):
    if created:
        # Create an initial entry for match history or achievements
        Achievement.objects.create(user=instance, name='Registered', date=instance.date_joined)
