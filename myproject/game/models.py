from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from myapp.models import Achievement, User
from django.db import models, transaction
from django.core.cache import cache


class GameResult(models.Model):
    user = models.CharField(max_length=150)
    opponent = models.CharField(max_length=150)
    userScore = models.IntegerField(default=0)
    opponentScore = models.IntegerField(default=0)
    result = models.CharField(max_length=4, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if self.userScore > self.opponentScore : 
            self.result = 'WIN'
        else :
            self.result = 'LOSE'
        super().save(*args, **kwargs)
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"user: {self.user}, opponent: {self.opponent} userScore: {self.userScore}, opponentScore: {self.opponentScore} at {self.timestamp}"

def update_rankings():
    """Update rankings for all users"""
    with transaction.atomic():
        users = User.objects.select_for_update().order_by(
            '-winrate',
            '-total_goals_scored',
            '-level'
        )
        
        current_rank = 1
        previous_stats = None
        
        for user in users:
            current_stats = (user.winrate, user.total_goals_scored, user.level)
            
            if previous_stats and current_stats == previous_stats:
                # Same stats as previous user, assign same rank
                user.rank = current_rank - 1
            else:
                user.rank = current_rank
                current_rank += 1
            
            user.save()
            previous_stats = current_stats

@receiver(post_save, sender=GameResult)
def update_user_stats(sender, instance, created, **kwargs):
    if created:
        with transaction.atomic():
            user_profile = User.objects.select_for_update().get(pk=instance.user.pk)
            
            # Update user stats
            if instance.result == 'WIN':
                user_profile.wins += 1
                user_profile.total_goals_scored += instance.userScore
            elif instance.result == 'LOSE':
                user_profile.losses += 1
            
            user_profile.winrate = (user_profile.wins / (user_profile.wins + user_profile.losses)) * 100
            user_profile.level = user_profile.wins // 5
            
            # Check achievements
            recent_games = GameResult.objects.filter(
                user=instance.user, 
                result='WIN'
            ).order_by('-timestamp')[:5]
            
            if len(recent_games) >= 3 and all(game.result == 'WIN' for game in recent_games):
                winning_streak_achievement, _ = Achievement.objects.get_or_create(
                    achievement='Winning Streak',
                    defaults={'description': 'Won 3 consecutive games'}
                )
                user_profile.achievements.add(winning_streak_achievement)

            if user_profile.wins >= 10:
                milestone_achievement, _ = Achievement.objects.get_or_create(
                    achievement='Veteran Player',
                    defaults={'description': 'Won 10 games'}
                )
                user_profile.achievements.add(milestone_achievement)
            
            user_profile.save()

        # Check if we should update rankings
        last_update = cache.get('last_ranking_update')
        if not last_update:
            update_rankings()
            cache.set('last_ranking_update', 'true', 60)  # Set 60 second cooldown

class GameMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='GameSent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='GameReceived_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']