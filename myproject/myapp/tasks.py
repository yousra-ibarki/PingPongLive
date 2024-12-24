# tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.core.cache import cache
from .models import User
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.tokens import AccessToken
from django.core.cache import cache
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.tokens import AccessToken

@shared_task
def check_inactive_users():
    from django.utils import timezone
    from datetime import timedelta
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.core.cache import cache
    
    print("Checking inactive users")
    threshold_time = timezone.now() - timedelta(minutes=1)
    
    inactive_users = User.objects.filter(
        is_online=True,
        last_active__lt=threshold_time
    )
    
    for user in inactive_users:
        user.is_online = False
        user.save()
        print(f"User {user.username} marked as offline")
        
        try:
            # Get all outstanding tokens for the user
            outstanding_tokens = OutstandingToken.objects.filter(user=user)
            print(f"Found {outstanding_tokens.count()} outstanding tokens for {user.username}")
            
            for token_record in outstanding_tokens:
                try:
                    if not BlacklistedToken.objects.filter(token=token_record).exists():
                        # Blacklist the refresh token
                        token = RefreshToken(token_record.token)
                        token.blacklist()
                        
                        # Get the corresponding access token
                        access_token = str(token.access_token)
                        
                        # Blacklist both tokens in cache
                        cache.set(
                            f'blacklist_token_{token_record.token}',
                            'blacklisted',
                            timeout=36000
                        )
                        cache.set(
                            f'blacklist_token_{access_token}',
                            'blacklisted',
                            timeout=36000
                        )
                        
                        print(f"Blacklisted refresh token and access token for {user.username}")
                        
                        # Verify the blacklisting
                        if cache.get(f'blacklist_token_{access_token}') == 'blacklisted':
                            print(f"Verified access token blacklist")
                            
                except Exception as e:
                    print(f"Error processing token: {str(e)}")
                    
        except Exception as e:
            print(f"Error handling tokens for {user.username}: {str(e)}")