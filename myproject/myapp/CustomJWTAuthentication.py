from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


# class CustomJWTAuthentication(JWTAuthentication):
#     def authenticate(self, request):
#         cookie_token = request.COOKIES.get('access_token')
#         # print('CustomJWTAuthentication',cookie_token)
#         if cookie_token:
#             request.META['HTTP_AUTHORIZATION'] = f'Bearer {cookie_token}'
#             return super().authenticate(request)
#         else:
#             raise AuthenticationFailed("No token provided")

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        cookie_token = request.COOKIES.get('access_token')
        
        if not cookie_token:
            raise AuthenticationFailed("No token provided")
            
        try:
            # First try with the current access token
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {cookie_token}'
            return super().authenticate(request)
            
        except AuthenticationFailed as e:
            # If authentication fails, try to refresh the token
            refresh_token = request.COOKIES.get('refresh_token')
            if not refresh_token:
                raise AuthenticationFailed("No refresh token available")
                
            try:
                # Attempt to get new tokens using refresh token
                refresh = RefreshToken(refresh_token)
                new_access_token = str(refresh.access_token)
                
                # Update request with new access token
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {new_access_token}'
                
                # Set the new access token in cookies
                response = super().authenticate(request)
                if response:
                    user, auth = response
                    # Store the new access token for the response middleware
                    request.new_access_token = new_access_token
                    return response
                    
            except Exception as refresh_error:
                raise AuthenticationFailed("Token refresh failed")
                
        return None

