# myproject/myapp/CustomJWTAuthentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        cookie_token = request.COOKIES.get('access_token')
        
        if not cookie_token:
            return None  # Return None instead of raising exception for unauthenticated requests
            
        try:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {cookie_token}'
            result = super().authenticate(request)
            
            # If authentication was successful, update last_active
            if result:
                user, token = result
                user.last_active = timezone.now()
                user.save(update_fields=['last_active'])
            return result
            
        except Exception:
            return None

