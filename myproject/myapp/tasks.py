# tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import OutstandingToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

@shared_task
def check_inactive_users():
    from .models import User
    
    print("Checking inactive users")
    threshold_time = timezone.now() - timedelta(minutes=1)
    
    # Get users who are marked online but haven't been active for 2 minutes
    inactive_users = User.objects.filter(
        is_online=True,
        last_active__lt=threshold_time
    )
    
    for user in inactive_users:
        user.is_online = False
        user.save()
        print(f"User {user.username} marked as offline")
        
        # Get and blacklist tokens
        for token in OutstandingToken.objects.filter(user=user):
            try:
                BlacklistedToken.objects.create(token=token)
            except Exception:
                pass  # Token might already be blacklisted