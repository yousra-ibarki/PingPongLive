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
    opponent_image = models.URLField(max_length=255, null=True, blank=True)
    
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
        # Get users ordered by stats
        users = User.objects.select_for_update().order_by(
            '-winrate',
            '-total_goals_scored',
            '-level',
            'username'
        )
        
        if not users:
            return
            
        current_rank = 1
        previous_stats = None
        tied_users_count = 0
        
        for user in users:
            if user.wins == 0:
                user.rank = 0  # Set rank 0 for users with no wins
                user.save(update_fields=['rank'])
                continue
                
            current_stats = (user.winrate, user.total_goals_scored, user.level)
            
            if previous_stats and current_stats == previous_stats:
                tied_users_count += 1
            else:
                current_rank += tied_users_count
                tied_users_count = 0
            
            user.rank = current_rank
            user.save(update_fields=['rank'])
            
            previous_stats = current_stats
            tied_users_count = 1  # Reset tied_users_count for the next user

# Create notification in database
def create_notification(user_profile, achievement):
    return Notification.objects.create(
        recipient=user_profile,
        notification_type='achievement',
        message=f"Congratulations! You've unlocked the '{achievement}' achievement!"
    )


def handle_achievements(user_profile, instance):
    """Handle achievements and notifications for game wins"""
    with transaction.atomic():
        channel_layer = get_channel_layer()
        achievements_to_notify = []

        # Re-fetch user with lock to ensure data consistency
        user_profile = User.objects.select_for_update().get(id=user_profile.id)

        print(f"Checking achievements for {user_profile.username}")
        print(f"Wins: {user_profile.wins}, Losses: {user_profile.losses}")
        print(f"Current achievements: {user_profile.achievements.all()}")

        # First Win Achievement
        if user_profile.wins == 1 and instance.result == 'WIN':
            first_win, _ = Achievement.objects.get_or_create(
                achievement='First Victory',
                defaults={
                    'description': 'Won your first game!',
                    'icon': '/trophy/firstWin.png'
                }
            )
            if first_win not in user_profile.achievements.all():
                user_profile.achievements.add(first_win)
                achievements_to_notify.append('First Victory')

        # Three Wins Achievement
        if user_profile.wins == 3:
            three_wins_achievement, _ = Achievement.objects.get_or_create(
                achievement='Rising Star',
                defaults={'description': 'Won 3 games total!',
                            'icon': '/trophy/3_games.png'}
            )
            if three_wins_achievement not in user_profile.achievements.all():
                user_profile.achievements.add(three_wins_achievement)
                achievements_to_notify.append('Rising Star')

        # Ten Wins Achievement
        if user_profile.wins == 11:
            ten_wins_achievement, _ = Achievement.objects.get_or_create(
                achievement='Pong Master',
                defaults={'description': 'Won 10 games total!',
                            'icon': '/trophy/10_games.png'}
            )
            if ten_wins_achievement not in user_profile.achievements.all():
                user_profile.achievements.add(ten_wins_achievement)
                achievements_to_notify.append('Pong Master')

        # Win Streak - Only check current streak for the current game
        if instance.result == 'WIN':
            recent_games = GameResult.objects.filter(
                user=user_profile.username
            ).order_by('-timestamp')[:3]

            consecutive_wins = 0
            for game in recent_games:
                if game.userScore > game.opponentScore:
                    consecutive_wins += 1
                else:
                    break

            if consecutive_wins >= 3:
                streak_achievement, _ = Achievement.objects.get_or_create(
                    achievement='Win Streak',
                    defaults={
                        'description': 'Won 3 games in a row!',
                        'icon': '/trophy/win_streak.png'
                    }
                )
                if streak_achievement not in user_profile.achievements.all():
                    user_profile.achievements.add(streak_achievement)
                    achievements_to_notify.append('Win Streak')

        # First Loss Achievement
        if user_profile.losses == 1 and instance.result == 'LOSE':
            first_loss, _ = Achievement.objects.get_or_create(
                achievement='First Defeat',
                defaults={
                    'description': 'Everyone loses sometimes. Your first loss.',
                    'icon': '/trophy/defeat.png'
                }
            )
            if first_loss not in user_profile.achievements.all():
                user_profile.achievements.add(first_loss)
                achievements_to_notify.append('First Defeat')

        # Total Goals Achievements
        if user_profile.total_goals_scored >= 7:
            seven_goals_achievement, _ = Achievement.objects.get_or_create(
                achievement='Goal Getter',
                defaults={'description': 'Scored 7 total goals!',
                          'icon': '/trophy/7_goals.png'}
            )
            if seven_goals_achievement not in user_profile.achievements.all():
                user_profile.achievements.add(seven_goals_achievement)
                achievements_to_notify.append('Goal Getter')

        if user_profile.total_goals_scored >= 14:
            fourteen_goals_achievement, _ = Achievement.objects.get_or_create(
                achievement='Sharp Shooter',
                defaults={'description': 'Scored 14 total goals!',
                          'icon': '/trophy/14_goals.png'}
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
            # Process both players in a single transaction
            with transaction.atomic():
                # Lock both user profiles at once to prevent race conditions
                user_profile = User.objects.select_for_update().get(username=instance.user)
                opponent_profile = User.objects.select_for_update().get(username=instance.opponent)

                # Update user stats
                if instance.userScore > instance.opponentScore:  # User WIN, Opponent LOSE
                    user_profile.wins += 1
                    user_profile.total_goals_scored += instance.userScore
                    opponent_profile.losses += 1
                    opponent_profile.total_goals_scored += instance.opponentScore
                else:  # User LOSE, Opponent WIN
                    user_profile.losses += 1
                    user_profile.total_goals_scored += instance.userScore
                    opponent_profile.wins += 1
                    opponent_profile.total_goals_scored += instance.opponentScore

                # Calculate winrates
                user_total_games = user_profile.wins + user_profile.losses
                if user_total_games > 0:
                    user_profile.winrate = (user_profile.wins / user_total_games) * 100

                opponent_total_games = opponent_profile.wins + opponent_profile.losses
                if opponent_total_games > 0:
                    opponent_profile.winrate = (opponent_profile.wins / opponent_total_games) * 100

                # Update levels
                user_profile.level = float(user_profile.wins) / 5.0
                opponent_profile.level = float(opponent_profile).wins / 5.0

                # Save both profiles
                user_profile.save()
                opponent_profile.save()

                # Handle achievements for both players with the correct result for each
                handle_achievements(user_profile, instance)  # Instance already has correct result for user
                
                # For opponent, we pass the same instance but with an inverted result
                instance.result = 'WIN' if instance.userScore < instance.opponentScore else 'LOSE'
                handle_achievements(opponent_profile, instance)
                
                # Restore original result (in case it's needed elsewhere)
                instance.result = 'WIN' if instance.userScore > instance.opponentScore else 'LOSE'

                # Update rankings
                update_rankings()

        except User.DoesNotExist as e:
            print(f"Could not find user: {e}")
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