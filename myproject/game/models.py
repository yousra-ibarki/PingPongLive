from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from myapp.models import Achievement, User
from django.db.models import F
from django.db import transaction


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


@receiver(post_save, sender=GameResult)
def update_user_stats(sender, instance, created, **kwargs):
    if created:
        with transaction.atomic():
            # Existing stats update code
            user_profile = User.objects.get(pk=instance.user.pk)
            
            # Update wins/losses and other stats
            if instance.result == 'WIN':
                user_profile.wins += 1
                user_profile.total_goals_scored += instance.userScore
            elif instance.result == 'LOSE':
                user_profile.losses += 1
                user_profile.total_goals_scored += instance.userScore
            
            user_profile.winrate = (user_profile.wins / (user_profile.wins + user_profile.losses)) * 100
            user_profile.level = user_profile.wins // 5
            
            # Achievement checks (existing code)
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
            
            # Update ranks for all players
            update_all_ranks()

def update_all_ranks():
    """
    Updates the rank of all players based on winrate, total goals, and level.
    Players with the same stats will receive the same rank number.
    """
    with transaction.atomic():
        # Get all users ordered by our ranking criteria
        users = User.objects.all().order_by(
            '-winrate',  # Higher winrate first
            '-total_goals_scored',  # More goals scored second
            '-level',  # Higher level third
        )
        
        if not users:
            return
        
        current_rank = 1
        previous_user = None
        
        for user in users:
            if previous_user:
                # If current user has same stats as previous user, assign same rank
                if (user.winrate == previous_user.winrate and 
                    user.total_goals_scored == previous_user.total_goals_scored and 
                    user.level == previous_user.level):
                    user.rank = previous_user.rank
                else:
                    # Otherwise, assign next rank
                    user.rank = current_rank
            else:
                # First user gets rank 1
                user.rank = current_rank
            
            user.save()
            previous_user = user
            current_rank += 1

class GameMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='GameSent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='GameReceived_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']
