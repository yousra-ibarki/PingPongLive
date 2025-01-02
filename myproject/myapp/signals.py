from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Achievement, User
from .utils import send_notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache
from django.db.models.signals import m2m_changed

User = get_user_model()

@receiver(post_save, sender=User)
def create_login_achievement(sender, instance, created, **kwargs):
    """
    Create and assign login achievement when a user is created
    """
    if created:  # Only when a new user is created
        achievement, created = Achievement.objects.get_or_create(
            achievement="Logged In :D",
            defaults={
                'description': "Successfully logged into the application!",
            }
        )
        
        instance.achievements.add(achievement)
        print(f"Login achievement added for user: {instance.username}")
        
        # Send WebSocket notification
        send_notification(
            user_id=instance.id,
            notification_type='achievement',
            message=f"Congratulations! You've earned the '{achievement.achievement}' achievement!"
        )

@receiver(m2m_changed, sender=User.achievements.through)
def send_achievement_notification(sender, instance, action, pk_set, **kwargs):
    if action == "post_add":
        # Get new achievements
        new_achievements = Achievement.objects.filter(id__in=pk_set)
        
        # Get channel layer
        channel_layer = get_channel_layer()
        
        for achievement in new_achievements:
            # Send to user-specific group
            async_to_sync(channel_layer.group_send)(
                f"achievements_{instance.id}",
                {
                    "type": "achievement_notification",
                    "achievement": achievement.achievement,
                    "description": achievement.description,
                }
            )
