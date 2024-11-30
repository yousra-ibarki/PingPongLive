# myproject/myapp/middleware/__init__.py
# myproject/myapp/middleware/auth.py

class RefreshTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # If a new access token was generated during authentication
        if hasattr(request, 'new_access_token'):
            response.set_cookie(
                'access_token',
                request.new_access_token,
                max_age=36000,
                expires=36000,
                httponly=True,
                secure=True,
                samesite='None',
            )
            
        return response
