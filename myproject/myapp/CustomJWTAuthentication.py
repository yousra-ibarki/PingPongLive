# myproject/myapp/CustomJWTAuthentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from django.core.cache import cache


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        cookie_token = request.COOKIES.get('access_token')
        
        if not cookie_token:
            return None
            
        # Check blacklist
        if cache.get(f'blacklist_token_{cookie_token}'):
            return None
            
        try:
            # Set authorization header from cookie
            validated_token = self.get_validated_token(cookie_token)
            user = self.get_user(validated_token)
            
            # Update last active timestamp
            if user:
                user.last_active = timezone.now()
                user.save(update_fields=['last_active'])
                
            return (user, validated_token)
            
        except (InvalidToken, TokenError):
            return None
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return None
        