from django.db import models
from django.core.cache import cache
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

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
        if user_profile.wins == 10:
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

# Make sure your GameResult model includes this modification in the save method
class GameResult(models.Model):
    user = models.CharField(max_length=150)
    opponent = models.CharField(max_length=150)
    userScore = models.IntegerField(default=0)
    opponentScore = models.IntegerField(default=0)
    result = models.CharField(max_length=4, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Set the result based on scores
        if self.userScore > self.opponentScore:
            self.result = 'WIN'
        else:
            self.result = 'LOSE'
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-timestamp']