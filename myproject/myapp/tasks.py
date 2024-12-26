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
    #timedelta(minutes=5) - Creates duration of 5 minutes
    threshold_time = timezone.now() - timedelta(minutes=5)
    
    # __lt is "less than" operator
    inactive_users = User.objects.filter(
        is_online=True,
        last_active__lt=threshold_time
    )
    
    for user in inactive_users:
        user.is_online = False
        user.save()
        print(f"User {user.username} marked as offline")
        
        # Blacklist all outstanding tokens for this user
        for outstanding_token in OutstandingToken.objects.filter(user=user):
            try:
                # Create BlacklistedToken directly
                BlacklistedToken.objects.get_or_create(token=outstanding_token)
                # print(f"Blacklisted token: {outstanding_token.token}")
                # Also invalidate potential access tokens in cache
                cache_key = f'blacklist_token_{outstanding_token.token}'
                cache.set(cache_key, 'blacklisted', timeout=36000)
                
            except Exception as e:
                print(f"Failed to blacklist token for user {user.username}: {str(e)}")