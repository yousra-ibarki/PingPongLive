from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from django.contrib.auth import logout, login
from rest_framework.generics import RetrieveAPIView, ListAPIView, UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .serializers import UserSerializer, RegistrationSerializer, ChangePasswordSerializer, CustomTokenObtainPairSerializer, TOTPSetupSerializer, TOTPVerifySerializer
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
from rest_framework import status, views
from .models import Profile
# from pprint import pp
from django.utils.http import urlencode
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .CustomJWTAuthentication import CustomJWTAuthentication
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode
import base64
from io import BytesIO

  
class TOTPSetupView(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        # Delete any existing unconfirmed devices
        TOTPDevice.objects.filter(user=request.user, confirmed=False).delete()
        
        # Create new TOTP device
        device = TOTPDevice.objects.create(
            user=request.user,
            confirmed=False
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        provisioning_uri = device.config_url
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        qr_code = base64.b64encode(buffer.getvalue()).decode()
        
        return Response({
            'qr_code': qr_code,
            'secret_key': device.config_url,
        })

    def post(self, request):
        serializer = TOTPSetupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            device = TOTPDevice.objects.get(user=request.user, confirmed=False)
        except TOTPDevice.DoesNotExist:
            return Response(
                {'error': 'No TOTP device found. Please start setup process again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if device.verify_token(serializer.validated_data['token']):
            # Delete any previously confirmed devices
            TOTPDevice.objects.filter(user=request.user, confirmed=True).delete()
            
            device.confirmed = True
            device.save()
            request.user.is_2fa_enabled = True
            request.user.save()
            return Response({'message': '2FA setup successful'})
        
        return Response(
            {'error': 'Invalid token'},
            status=status.HTTP_400_BAD_REQUEST
        )

class TOTPDisableView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request):
        # Retrieve the user's confirmed TOTP device
        try:
            device = TOTPDevice.objects.get(user=request.user, confirmed=True)
            device.delete()  # Delete the device to disable 2FA
            request.user.is_2fa_enabled = False  # Update user's profile
            request.user.save()
            return Response({'message': '2FA disabled successfully'}, status=status.HTTP_200_OK)
        except TOTPDevice.DoesNotExist:
            return Response({'error': '2FA is not enabled'}, status=status.HTTP_400_BAD_REQUEST)
        
class TOTStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        try:
            is_2fa_enabled = request.user.is_2fa_enabled
            return Response({"isTwoFaEnabled": is_2fa_enabled}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def set_auth_cookies_and_response(user, refresh_token, access_token, request):
    response = Response({
        'user': UserSerializer(user, context={'request': request}).data
    })
    response.set_cookie(
        'access_token',
        str(access_token),
        max_age=36000,
        expires=36000,
        httponly=True, 
        secure=True,  # Use secure=True if your site is served over HTTPS
        samesite='None',  # Adjust as needed, could also be 'Strict' or 'None'
    )
    response.set_cookie(
        'refresh_token',
        str(refresh_token),
        max_age=36000,
        expires=36000,
        httponly=True,
        secure=True,  # Use secure=True if your site is served over HTTPS
        samesite='None',  # Adjust as needed, could also be 'Strict' or 'None'
    )
    response.set_cookie(
        'logged_in',
        'true',
        httponly=False,  # Change based on your requirements
        secure=False,     # Set to True for HTTPS
        samesite='Strict'  # Allows cross-origin requests
    )
    return response

class LoginView42(APIView):
    permission_classes = []
    authentication_classes = []
    def get(self, request):
        base_url = "https://api.intra.42.fr/oauth/authorize"
        params = {
            'client_id': 'u-s4t2ud-1934f076a4e06ecf5603d6a5a7bc5034b834f50bcb4039ee8ea5527f6f270a48',
            'redirect_uri': 'http://127.0.0.1:8001/login/callback',
            'response_type': 'code',
            'scope': 'public',
            'state': settings.STATE42,
        }
        redirect_url = f'{base_url}?{urlencode(params)}'
        return Response({'redirect_url': redirect_url })

class LoginCallbackView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        code = request.query_params.get('code')
        payload = {
            'code': code,
            'grant_type': 'authorization_code',
            'client_id': 'u-s4t2ud-1934f076a4e06ecf5603d6a5a7bc5034b834f50bcb4039ee8ea5527f6f270a48',
            'client_secret': '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',
            'redirect_uri': 'http://127.0.0.1:8001/login/callback',
        }
        token_url = 'https://api.intra.42.fr/oauth/token'
        response = requests.post(token_url, data=payload)

        if response.status_code != 200:
            return Response({'error': 'Failed to retrieve access token'}, status=400)
        data = response.json()

        headers = {'Authorization': f'Bearer {data["access_token"]}'}
        me_url = 'https://api.intra.42.fr/v2/me'
        response = requests.get(me_url, headers=headers)
        user_data = response.json()
        if response.status_code != 200:
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
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return set_auth_cookies_and_response(user, refresh, access_token, request)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    authentication_classes = [CustomJWTAuthentication]  # Disable authentication for this view

    def get(self, request):
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

class LoginView(APIView):
    permission_classes = []
    authentication_classes = []
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            return set_auth_cookies_and_response(user, refresh, access_token, request)
        return Response({'error': 'Invalid credentials'}, status=400)
    
class CustomLoginView(TokenObtainPairView):
    permission_classes = []
    authentication_classes = []
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            # Use the serializer to validate credentials
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data
            
            # Extract the necessary data
            user = validated_data['user']
            refresh = validated_data['refresh']
            access_token = validated_data['access_token']
            
            # Set cookies and return response using your existing function
            return set_auth_cookies_and_response(user, refresh, access_token, request)
            
        except Exception as e:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_400_BAD_REQUEST
            )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    def post(self, request):
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        response.delete_cookie('logged_in')
        return response

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

class UserRetrieveAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

class ListUsers(ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    queryset = Profile.objects.all()
    serializer_class = UserSerializer
    def get(self, request):
        users = Profile.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class UserUpdateAPIView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Save the user without generating a token
            return Response({
                'status': 'success',
                'message': 'User registered successfully',
            }, status=201)
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
