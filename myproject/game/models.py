from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from myapp.models import Achievement, Profile


class GameResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    opponent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='opponent_games')
    goals_scored = models.IntegerField(default=0)
    opponent_goals = models.IntegerField(default=0)
    result = models.CharField(max_length=10, choices=[
        ('WIN', 'Win'), 
        ('LOSE', 'Lose')
    ])
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

@receiver(post_save, sender=GameResult)
def update_user_stats(sender, instance, created, **kwargs):
    if created:
        user_profile = Profile.objects.get(pk=instance.user.pk)
        
        # Check for winning streak
        recent_games = GameResult.objects.filter(
            user=instance.user, 
            result='WIN'
        ).order_by('-timestamp')[:5]
        
        # Check if all recent games are wins
        if len(recent_games) >= 3 and all(game.result == 'WIN' for game in recent_games):
            winning_streak_achievement, _ = Achievement.objects.get_or_create(
                achievement='Winning Streak',
                defaults={
                    'description': 'Won 3 consecutive games',
                }
            )
            user_profile.achievements.add(winning_streak_achievement)

        # Other achievement checks can be added similarly
        # For example:
        if user_profile.wins >= 10:
            milestone_achievement, _ = Achievement.objects.get_or_create(
                achievement='Veteran Player',
                defaults={
                    'description': 'Won 10 games',
                }
            )
            user_profile.achievements.add(milestone_achievement)

        # Update other stats
        if instance.result == 'WIN':
            user_profile.wins += 1
        elif instance.result == 'LOSE':
            user_profile.losses += 1
        
        user_profile.winrate = (user_profile.wins / (user_profile.wins + user_profile.losses)) * 100
        user_profile.level = user_profile.wins // 5
        user_profile.save()

class GameMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='GameSent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='GameReceived_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']