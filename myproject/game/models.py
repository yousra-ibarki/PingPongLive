from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from myapp.models import Achievement, User
from django.db import models, transaction
from django.core.cache import cache
from asgiref.sync import sync_to_async, async_to_sync
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from myapp.models import Notification

class GameResult(models.Model):
    user = models.CharField(max_length=150)
    opponent = models.CharField(max_length=150)
    userScore = models.IntegerField(default=0)
    opponentScore = models.IntegerField(default=0)
    result = models.CharField(max_length=4, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if self.userScore > self.opponentScore:
            self.result = 'WIN'
        else:
            self.result = 'LOSE'
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"user: {self.user}, opponent: {self.opponent} userScore: {self.userScore}, opponentScore: {self.opponentScore} at {self.timestamp}"

def update_rankings():
    """Update rankings for all users with improved tie handling"""
    with transaction.atomic():
        # Only consider users who have played at least one game
        users = User.objects.select_for_update().filter(
            wins__gt=0
        ).order_by(
            '-winrate',
            '-total_goals_scored',
            '-level',
            'username'  # As final tiebreaker, sort alphabetically
        )
        
        if not users:
            return
            
        current_rank = 1
        previous_stats = None
        tied_users_count = 0
        
        for user in users:
            current_stats = (user.winrate, user.total_goals_scored, user.level)
            
            if previous_stats and current_stats == previous_stats:
                # Same stats as previous user, assign same rank
                tied_users_count += 1
            else:
                # New stats, assign new rank (accounting for any previous ties)
                current_rank += tied_users_count
                tied_users_count = 0
            
            # Update user's rank
            user.rank = current_rank
            user.save(update_fields=['rank'])
            
            previous_stats = current_stats
            
        # Update unranked users (those with no games)
        User.objects.filter(wins=0).update(rank=None)

# Create notification in database
def create_notification(user_profile, achievement):
    return Notification.objects.create(
        recipient=user_profile,
        notification_type='achievement',
        message=f"Congratulations! You've unlocked the '{achievement}' achievement!"
    )

def handle_achievements(user_profile, instance):
    """Handle achievements and notifications for game wins"""
    channel_layer = get_channel_layer()
    achievements_to_notify = []

    # Only check for achievements if the user won
    if instance.userScore > instance.opponentScore:
        # First Win Achievement
        if user_profile.wins == 1:
            first_win_achievement, _ = Achievement.objects.get_or_create(
                achievement='First Victory',
                defaults={'description': 'Won your first game!'}
            )
            if first_win_achievement not in user_profile.achievements.all():
                user_profile.achievements.add(first_win_achievement)
                achievements_to_notify.append('First Victory')

        # Three Wins Achievement
        if user_profile.wins == 3:
            three_wins_achievement, _ = Achievement.objects.get_or_create(
                achievement='Rising Star',
                defaults={'description': 'Won 3 games total!'}
            )
            if three_wins_achievement not in user_profile.achievements.all():
                user_profile.achievements.add(three_wins_achievement)
                achievements_to_notify.append('Rising Star')

        # Ten Wins Achievement
        if user_profile.wins == 11:
            ten_wins_achievement, _ = Achievement.objects.get_or_create(
                achievement='Pong Master',
                defaults={'description': 'Won 10 games total!'}
            )
            if ten_wins_achievement not in user_profile.achievements.all():
                user_profile.achievements.add(ten_wins_achievement)
                achievements_to_notify.append('Pong Master')

        # Check for win streak (3 consecutive wins)
        recent_games = GameResult.objects.filter(
            user=instance.user,
            result='WIN'
        ).order_by('-timestamp')[:3]

        if len(recent_games) >= 3:
            streak_achievement, _ = Achievement.objects.get_or_create(
                achievement='Win Streak',
                defaults={'description': 'Won 3 games in a row!'}
            )
            if streak_achievement not in user_profile.achievements.all():
                user_profile.achievements.add(streak_achievement)
                achievements_to_notify.append('Win Streak')

        # First Loss Achievement
    if user_profile.losses == 1:
        first_loss_achievement, _ = Achievement.objects.get_or_create(
            achievement='First Defeat',
            defaults={'description': 'Everyone loses sometimes. Your first loss.'}
        )
        if first_loss_achievement not in user_profile.achievements.all():
            user_profile.achievements.add(first_loss_achievement)
            achievements_to_notify.append('First Defeat')

    # Total Goals Achievements
    if user_profile.total_goals_scored >= 7:
        seven_goals_achievement, _ = Achievement.objects.get_or_create(
            achievement='Goal Getter',
            defaults={'description': 'Scored 7 total goals!'}
        )
        if seven_goals_achievement not in user_profile.achievements.all():
            user_profile.achievements.add(seven_goals_achievement)
            achievements_to_notify.append('Goal Getter')

    if user_profile.total_goals_scored >= 14:
        fourteen_goals_achievement, _ = Achievement.objects.get_or_create(
            achievement='Sharp Shooter',
            defaults={'description': 'Scored 14 total goals!'}
        )
        if fourteen_goals_achievement not in user_profile.achievements.all():
            user_profile.achievements.add(fourteen_goals_achievement)
            achievements_to_notify.append('Sharp Shooter')

    # Save any changes to user_profile
    user_profile.save()

    # Send notifications for each new achievement
    for achievement in achievements_to_notify:
        # Create notification in database
        notification = create_notification(user_profile, achievement)
        
        # Send WebSocket notification
        async_to_sync(channel_layer.group_send)(
            f"notifications_{user_profile.username}",
            {
                "type": "notify_achievement",
                "achievement": achievement,
                "message": f"Congratulations! You've unlocked the '{achievement}' achievement!",
                "notification_id": notification.id,
            }
        )
        print(f'Achievement "{achievement}" unlocked and notification sent for {user_profile.username}')

    return achievements_to_notify  # Return list of new achievements for testing purposes


@receiver(post_save, sender=GameResult)
def update_user_stats(sender, instance, created, **kwargs):
    if created:
        try:
            with transaction.atomic():
                user_profile = User.objects.select_for_update().get(username=instance.user)

                # Update user stats based on the game result
                if instance.userScore > instance.opponentScore:  # WIN condition
                    user_profile.wins += 1
                    user_profile.total_goals_scored += instance.userScore
                else:  # LOSE condition
                    user_profile.losses += 1
                    user_profile.total_goals_scored += instance.userScore

                # Calculate winrate only if there are games played
                total_games = user_profile.wins + user_profile.losses
                if total_games > 0:
                    user_profile.winrate = (user_profile.wins / total_games) * 100
                
                user_profile.level = user_profile.wins // 5
                user_profile.save()

                # Handle achievements and notifications
                handle_achievements(user_profile, instance)

                # Update opponent's stats
                try:
                    opponent_profile = User.objects.select_for_update().get(username=instance.opponent)
                    
                    if instance.userScore < instance.opponentScore:  # Opponent WIN
                        opponent_profile.wins += 1
                        opponent_profile.total_goals_scored += instance.opponentScore
                    else:  # Opponent LOSE
                        opponent_profile.losses += 1
                        opponent_profile.total_goals_scored += instance.opponentScore
                    
                    # Calculate opponent's winrate
                    total_opponent_games = opponent_profile.wins + opponent_profile.losses
                    if total_opponent_games > 0:
                        opponent_profile.winrate = (opponent_profile.wins / total_opponent_games) * 100
                    
                    opponent_profile.level = opponent_profile.wins // 5
                    opponent_profile.save()
                    
                    # Handle achievements for opponent
                    handle_achievements(opponent_profile, instance)
                    
                except User.DoesNotExist:
                    print(f"Could not find opponent with username: {instance.opponent}")

                update_rankings()

        except User.DoesNotExist:
            print(f"Could not find user with username: {instance.user}")
        except Exception as e:
            print(f"Error updating user stats: {e}")

class GameMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='GameSent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='GameReceived_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']