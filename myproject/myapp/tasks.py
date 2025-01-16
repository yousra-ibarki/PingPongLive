# tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import OutstandingToken, RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from .models import User
from django.core.cache import cache
from .models import User
from django.core.cache import cache
    


@shared_task
def check_inactive_users():
    print("Checking inactive users")
    #timedelta(minutes=1) - Creates duration of 1 minute
    threshold_time = timezone.now() - timedelta(minutes=1)
    
    # __lt is "less than" operator
    inactive_users = User.objects.filter(
        is_online=True,
        last_active__lt=threshold_time
    )
    
    for user in inactive_users:
        user.is_online = False
        user.save()
        print(f"User {user.username} marked as offline")

        access_token = cache.get(f'access_token_{user.id}')

        if access_token:
            cache.set(f'blacklist_token_{access_token}', True, timeout=timedelta(days=1).total_seconds())
            cache.delete(f'access_token_{user.id}')  # Remove token from cache
        
        # Blacklist all outstanding tokens for this user
        for outstanding_token in OutstandingToken.objects.filter(user=user):
            try:
                # Create BlacklistedToken directly
                BlacklistedToken.objects.get_or_create(token=outstanding_token)
                # print(f"Blacklisted token: {outstanding_token.token}")
                # Also invalidate potential access tokens in cache
                cache.set(f'blacklist_token_{outstanding_token.token}', 'blacklisted', timeout=36000)
                
            except Exception as e:
                print(f"Failed to blacklist token for user {user.username}: {str(e)}")