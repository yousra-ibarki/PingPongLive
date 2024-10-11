from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from django.contrib.auth import logout, login
from rest_framework.generics import RetrieveAPIView, ListAPIView, UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .serializers import UserSerializer, MyTokenObtainPairSerializer, RegistrationSerializer, ChangePasswordSerializer
from .models import Profile
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp import devices_for_user
from django.contrib.auth import authenticate
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework import status
from .models import Profile
from pprint import pp
from django.utils.http import urlencode
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

def set_auth_cookies_and_response(user, refresh_token, access_token, request):
    # print('####set_auth_cookies_and_response', refresh_token, access_token)
    response = Response({
        'user': UserSerializer(user, context={'request': request}).data,
    })
    #print access_token
    print('000000access_token', access_token)
    response.set_cookie(
        'access',
        str(access_token),
        max_age=36000,
        expires=36000,
        httponly=True, 
        secure=True,  # Use secure=True if your site is served over HTTPS
        samesite='None'  # Adjust as needed, could also be 'Strict' or 'None'
    )
    response.set_cookie(
        'refresh',
        str(refresh_token),
        max_age=36000,
        expires=36000,
        httponly=True,
        secure=True,  # Use secure=True if your site is served over HTTPS
        samesite='None'  # Adjust as needed, could also be 'Strict' or 'None'
    )

    return response

class LoginView42(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        base_url = "https://api.intra.42.fr/oauth/authorize"
        params = {
            'client_id': 'u-s4t2ud-04e40fa6c4c8af49bbef164edc9ebe06ba12c7e05bd291217d20c9584b7d0e44',
            'redirect_uri': 'http://127.0.0.1:3000/login_intra/callback',
            'response_type': 'code',
            'scope': 'public',
            'state': settings.STATE42,
        }
        redirect_url = f'{base_url}?{urlencode(params)}'
        return Response({'redirect_url': redirect_url   })

class LoginCallbackView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        code = request.query_params.get('code')
        print('####code', code)
        payload = {
            'code': code,
            'grant_type': 'authorization_code',
            'client_id': 'u-s4t2ud-04e40fa6c4c8af49bbef164edc9ebe06ba12c7e05bd291217d20c9584b7d0e44',
            'client_secret': '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',
            'redirect_uri': 'http://127.0.0.1:3000/login_intra/callback',
        }
        token_url = 'https://api.intra.42.fr/oauth/token'
        response = requests.post(token_url, data=payload)

        if response.status_code != 200:
            print('####token')
            return Response({'error': 'Failed to retrieve access token'}, status=400)
        data = response.json()
        pp(data)

        headers = {'Authorization': f'Bearer {data["access_token"]}'}
        me_url = 'https://api.intra.42.fr/v2/me'
        response = requests.get(me_url, headers=headers)
        user_data = response.json()
        if response.status_code != 200:
            print('z#####gh')
            return Response({'error': response.json()}, status=response.status_code)
        user_data = response.json()
  

        user, created = Profile.objects.get_or_create(username=user_data['login'],
            defaults={
                'username' : user_data['login'],
                'email' : user_data['email'],
                'first_name' : user_data['first_name'],
                'last_name' : user_data['last_name'],
            }
        )
        # print(user_data['access_token'])
        # print(user_data['login'])
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        login(request, user)
        
        return set_auth_cookies_and_response(user, refresh, access_token, request)
        # return redirect('http://localhost:3000/login_intra/callback?access_token=' + data['access_token'])
        # return Response({'status': 'success', 'redirect_url': 'http://127.0.0.1:3000/login_intra/callback'})


# class LoginCallbackView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         code = request.GET.get('code')

#         if not code:
#             return Response({'error': 'Authorization code is missing'}, status=400)

#         payload = {
#             'code': code,
#             'grant_type': 'authorization_code',
#             'client_id': 'u-s4t2ud-784cf673b089ab17c871c4bb8c8d93d873fefe6ac02534bb33989e45847f1ecd',
#             'client_secret': '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',
#             'redirect_uri': 'http://127.0.0.1:8000/accounts/42/login/callback/',
#         }
        
#         token_url = 'https://api.intra.42.fr/oauth/token'
#         response = requests.post(token_url, data=payload)
#         data = response.json()

#         if 'access_token' not in data:
#             return Response({'error': 'Failed to retrieve access token'}, status=400)

#         # Fetch user data
#         headers = {'Authorization': 'Bearer ' + data['access_token']}
#         me_url = 'https://api.intra.42.fr/v2/me'
#         user_response = requests.get(me_url, headers=headers)

#         if user_response.status_code != 200:
#             return Response({'error': 'Failed to retrieve user data'}, status=user_response.status_code)

#         user_data = user_response.json()

#         # Create or update user profile
#         user, created = Profile.objects.get_or_create(
#             username=user_data['login'],
#             defaults={
#                 'username': user_data['login'],
#                 'email': user_data.get('email', ''),
#                 'first_name': user_data.get('first_name', ''),
#                 'last_name': user_data.get('last_name', ''),
#             }
#         )

#         # Log in the user
#         login(request, user)

#         # Generate JWT tokens
#         refresh = RefreshToken.for_user(user)
#         access_token = str(refresh.access_token)

#         # Set cookies for JWT tokens
#         response = Response({
#             'status': 'success',
#             'first_name': user_data['first_name'],
#             'last_name': user_data['last_name'],
#             'email': user_data.get('email', ''),
#             'access_token': access_token,
#             'refresh_token': str(refresh),
#         }, status=200)

#         # Set cookies
#         response.set_cookie('access', access_token, httponly=True, secure=True)  # Use secure=True in production
#         response.set_cookie('refresh', str(refresh), httponly=True, secure=True)  # Use secure=True in production

#         # Redirect to the frontend login page after successful login
#         return redirect('http://localhost:3000/login')  # Adjust URL as needed

# class LoginView42(APIView):
#     permission_classes = [AllowAny]
#     def get(self, request):
#         return redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-784cf673b089ab17c871c4bb8c8d93d873fefe6ac02534bb33989e45847f1ecd&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2Faccounts%2F42%2Flogin%2Fcallback%2F&response_type=code')



# class LoginCallbackView(View):
#     def get(self, request):
#         code = request.GET.get('code')

#         # Ensure the authorization code is present
#         if not code:
#             return JsonResponse({"error": "Authorization code is missing."}, status=400)

#         # Exchange authorization code for access token
#         token_url = 'https://api.intra.42.fr/oauth/token'
#         data = {
#             'code': code,
#             'grant_type': 'authorization_code',
#             'client_id': 'u-s4t2ud-784cf673b089ab17c871c4bb8c8d93d873fefe6ac02534bb33989e45847f1ecd',
#             'client_secret': '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',
#             'redirect_uri': 'http://127.0.0.1:8000/accounts/42/login/callback/',
#         }

#         token_response = requests.post(token_url, data=data)

#         # Check if the token exchange was successful
#         if token_response.status_code == 200:
#             token_data = token_response.json()
#             access_token = token_data.get('access_token')
#             refresh_token = token_data.get('refresh_token')

#             # Fetch user data using the access token
#             user_info_url = 'https://api.intra.42.fr/v2/me'
#             user_response = requests.get(user_info_url, headers={
#                 'Authorization': f'Bearer {access_token}'
#             })

#             # Check if user data retrieval was successful
#             if user_response.status_code == 200:
#                 user_data = user_response.json()

#                 # Create or update the user profile
#                 user, created = Profile.objects.get_or_create(
#                     username=user_data['login'],
#                     defaults={
#                         'first_name': user_data['first_name'],
#                         'last_name': user_data['last_name'],
#                         'email': user_data.get('email', ''),
#                         'image': user_data.get('image_url', 'default.jpg')
#                     }
#                 )

#                 # Log in the user
#                 login(request, user)

#                 # Set cookies for access and refresh tokens
#                 set_auth_cookies_and_response(user, refresh_token, access_token, request)

#                 # Return access and refresh tokens in the JSON response
#                 return JsonResponse({
#                     "access_token": access_token,
#                     "refresh_token": refresh_token
#                 })

#             # Handle case where user data could not be retrieved
#             return JsonResponse({"error": "Error retrieving user data"}, status=user_response.status_code)

#         # Handle error when retrieving access token
#         return JsonResponse({"error": "Error retrieving access token"}, status=400)

class RefreshTokenView(View):
    def post(self, request):
        refresh_token = request.session.get('refresh_token')

        if not refresh_token:
            return JsonResponse({"error": "No refresh token available"}, status=400)

        token_url = 'https://api.intra.42.fr/oauth/token'
        data = {
            'code': code,
            'grant_type': 'authorization_code',
            'client_id': 'u-s4t2ud-784cf673b089ab17c871c4bb8c8d93d873fefe6ac02534bb33989e45847f1ecd',
            'client_secret': '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',
            'redirect_uri': 'http://127.0.0.1:8000/accounts/42/login/callback/',
        }

        response = requests.post(token_url, data=data)

        if response.status_code == 200:
            response_data = response.json()
            access_token = response_data.get('access_token')
            refresh_token = response_data.get('refresh_token')

            # Update tokens in the session
            request.session['access_token'] = access_token
            request.session['refresh_token'] = refresh_token
            
            return JsonResponse({"access_token": access_token})

        # Log the error response for debugging
        print("Refresh token response:", response.json())
        return JsonResponse({"error": "Error refreshing access token"}, status=400)


class LogoutView(View):
    def post(self, request):
        # Log out the user
        logout(request)

        # Optionally clear any tokens stored in the session
        request.session.flush()  # This clears the entire session

        return JsonResponse({"message": "Logged out successfully."})


class UserRetrieveAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

class ListUsers(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = UserSerializer

class UserUpdateAPIView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate token for the registered user
            refresh = RefreshToken.for_user(user)
            # set the access token and refresh token in the backend on cookies

            response = Response({
                'status': 'success',
                'message': 'User registered successfully',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=201)
            response.set_cookie(key='refresh', value=str(refresh), httponly=True)
            response.set_cookie(key='access', value=str(refresh.access_token), httponly=True)
            return response
        return Response(serializer.errors, status=400)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class ManageProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        serializer = ProfileSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    def get(self, request):
        user = request.user
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

class ProfileAccountView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = ProfileSerializer(user)
        return Response(serializer.data)
    
def verify_otp(user, token):
    for device in devices_for_user(user):
        if device.verify_token(token):
            return True
    return False

class TwoFactorLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        token = request.data.get('token')
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        if user is not None:
            if verify_otp(user, token):  # Verify the OTP
                login(request, user)
                return Response({'status': 'success'}, status=200)
            else:
                return Response({'error': 'Invalid OTP'}, status=400)
        else:
            return Response({'error': 'Invalid credentials'}, status=400)


class UserProfileView(APIView):
    # permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        access_token = request.COOKIES.get('access')
        print('-------------access_token  -|', access_token)
        profile = request.user  # Since Profile extends AbstractUser
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user
        serializer = ProfileSerializer(profile, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User data updated successfully."}, status=200)
        return Response(serializer.errors, status=400)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        user = request.user

        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
