# myproject/myapp/CustomJWTAuthentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        cookie_token = request.COOKIES.get('access_token')
        
        if not cookie_token:
            return None  # Return None instead of raising exception for unauthenticated requests
            
        try:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {cookie_token}'
            return super().authenticate(request)
        except Exception:
            return None  # Return None for invalid tokens

