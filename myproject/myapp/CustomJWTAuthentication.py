from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        cookie_token = request.COOKIES.get('access_token')
        print('CustomJWTAuthentication',cookie_token)
        if cookie_token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {cookie_token}'
            return super().authenticate(request)
        else:
            raise AuthenticationFailed("No token provided")