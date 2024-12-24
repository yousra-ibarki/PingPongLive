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
        
        # Debug cache check
        cache_key = f'blacklist_token_{cookie_token}'
        cache_value = cache.get(cache_key)
        print(f"JWT Auth - Checking token {cookie_token[:30]}...")
        print(f"JWT Auth - Cache key: {cache_key[:50]}...")
        print(f"JWT Auth - Cache value: {cache_value}")
        
        if cache_value == 'blacklisted':
            raise AuthenticationFailed('Token is blacklisted')
            
        # Check blacklist
        if cache_value == 'blacklisted':
            print(f"Token is blacklisted in cache")
            raise AuthenticationFailed('Token is blacklisted')
        
        try:
            validated_token = self.get_validated_token(cookie_token)
            user = self.get_user(validated_token)
            
            if user:
                user.last_active = timezone.now()
                user.save(update_fields=['last_active'])
                
            return (user, validated_token)
            
        except (InvalidToken, TokenError) as e:
            print(f"Token validation error: {str(e)}")
            raise AuthenticationFailed(str(e))
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            raise AuthenticationFailed('Authentication failed')
        