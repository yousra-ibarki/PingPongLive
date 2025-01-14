def handle_achievements(user_profile, instance):
    """Handle achievements and notifications for game wins"""
    with transaction.atomic():
        # Re-fetch user with lock to ensure data consistency
        user_profile = User.objects.select_for_update().get(id=user_profile.id)
        
        channel_layer = get_channel_layer()
        achievements_to_notify = []

        print(f"Checking achievements for {user_profile.username}")
        print(f"Game result: {instance.result}")
        print(f"Wins: {user_profile.wins}, Losses: {user_profile.losses}")
        print(f"Current achievements: {user_profile.achievements.all()}")

        # First Win Achievement - Check achievements table first
        if instance.result == 'WIN':
            if not user_profile.achievements.filter(achievement='First Victory').exists():
                first_win, _ = Achievement.objects.get_or_create(
                    achievement='First Victory',
                    defaults={
                        'description': 'Won your first game!',
                        'icon': '/trophy/firstWin.png'
                    }
                )
                user_profile.achievements.add(first_win)
                achievements_to_notify.append('First Victory')

        # First Loss Achievement - Check achievements table first
        if instance.result == 'LOSE':
            if not user_profile.achievements.filter(achievement='First Defeat').exists():
                first_loss, _ = Achievement.objects.get_or_create(
                    achievement='First Defeat',
                    defaults={
                        'description': 'Everyone loses sometimes. Your first loss.',
                        'icon': '/trophy/defeat.png'
                    }
                )
                user_profile.achievements.add(first_loss)
                achievements_to_notify.append('First Defeat')

        # Rest of the achievements remain the same...
        # [Previous achievement code for Three Wins, Ten Wins, etc.]

        # Save any changes to user_profile
        user_profile.save()

    # Create notifications outside the transaction
    for achievement in achievements_to_notify:
        try:
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
        except Exception as e:
            print(f"Error sending achievement notification: {e}")

    return achievements_to_notify





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
                user_profile.level = user_profile.wins // 5
                opponent_profile.level = opponent_profile.wins // 5

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