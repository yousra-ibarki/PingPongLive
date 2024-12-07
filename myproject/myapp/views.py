from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from django.contrib.auth import logout, login
from rest_framework.generics import RetrieveAPIView, ListAPIView, UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .serializers import AchievementsSerializer
from .models import User, Achievement
from .serializers import ProfileSerializer, UserSerializer, RegisterSerializer, ChangePasswordSerializer, CustomTokenObtainPairSerializer, TOTPVerifySerializer, TOTPSetupSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ProfileSerializer, FriendshipSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp import devices_for_user
from django.contrib.auth import authenticate
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework import status, views
from .models import User
from pprint import pp
import pprint
from django.utils.http import urlencode
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .CustomJWTAuthentication import CustomJWTAuthentication
from .models import Friendship, Block
from django.db.models import Q
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode
import base64
from io import BytesIO
import uuid
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from chat.models import ChatRoom, Message


class UsersView(ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get(self, request):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=200)

class RemoveFriendshipView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def delete(self, request, id):
        user = request.user
        Friendship.objects.filter(from_user=user, to_user_id=id).delete()
        return Response(status=204)
    

class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        user = request.user
        # Check if user is trying to unblock themselves
        if str(user.id) == str(id):
            return Response(
                {"error": "You cannot unblock yourself"}, 
                status=400
            )
            
        try:
            other_user = User.objects.get(id=id)
            # Delete any blocks in either direction
            Block.objects.filter(
                Q(blocker=user, blocked=other_user) | 
                Q(blocker=other_user, blocked=user)
            ).delete()
            
            return Response({
                "message": "User unblocked successfully.",
                "is_blocked": False
            }, status=200)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        user = request.user
        # Check if user is trying to block themselves
        if str(user.id) == str(id):
            return Response(
                {"error": "You cannot block yourself"}, 
                status=400
            )
            
        try:
            other_user = User.objects.get(id=id)
            # Check if block already exists
            block_exists = Block.objects.filter(
                blocker=user, 
                blocked=other_user
            ).exists()
            
            if block_exists:
                return Response(
                    {"error": "User is already blocked"}, 
                    status=400
                )
            
            # First, remove any existing friendship
            Friendship.objects.filter(
                (Q(from_user=user, to_user=other_user) | 
                Q(from_user=other_user, to_user=user))
            ).delete()
                
            # Then create the block
            Block.objects.create(blocker=user, blocked=other_user)
            return Response({
                "message": "User blocked successfully.",
                "friendship_status": None,
                "is_blocked": True,
                "can_send_request": False
            }, status=200)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class FriendRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        user = request.user
        friend_requests = Friendship.objects.filter(to_user=user, status='pending')
        serializer = FriendshipSerializer(friend_requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        request_id = request.data.get('request_id')
        action = request.data.get('action')  # 'accept' or 'reject'
        
        try:
            friendship = Friendship.objects.get(id=request_id, to_user=request.user, status='pending')
            if action == 'accept':
                friendship.status = 'accepted'
                friendship.save()
                return Response({"message": "Friend request accepted"}, status=200)
            elif action == 'reject':
                friendship.delete()
                return Response({"message": "Friend request rejected"}, status=200)
            
            return Response({"error": "Invalid action"}, status=400)
        except Friendship.DoesNotExist:
            return Response({"error": "Friend request not found"}, status=404)


class SendFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        user = request.user
        
        # Check if user is trying to send request to themselves
        if str(user.id) == str(id):  # Convert both to strings to ensure proper comparison
            return Response(
                {"error": "You cannot send a friend request to yourself"}, 
                status=400
            )
            
        try:
            other_user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=404
            )
        
        # Check if either user has blocked the other
        is_blocked = Block.objects.filter(
            Q(blocker=user, blocked=other_user) | 
            Q(blocker=other_user, blocked=user)
        ).exists()
        
        if is_blocked:
            return Response(
                {"error": "Cannot send friend request to blocked user"}, 
                status=400
            )
            
        # Check if a friendship already exists
        existing_friendship = Friendship.objects.filter(
            Q(from_user=user, to_user=other_user) |
            Q(from_user=other_user, to_user=user)
        ).exists()
        
        if existing_friendship:
            return Response(
                {"error": "Friendship request already exists"}, 
                status=400
            )
            
        Friendship.objects.create(from_user=user, to_user=other_user)
        return Response({"message": "Friend request sent successfully."}, status=200)


class FriendshipStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, id):
        user = request.user
        other_user = User.objects.get(id=id)
        
        friendship = Friendship.objects.filter(
            Q(from_user=user, to_user=other_user) | 
            Q(from_user=other_user, to_user=user)
        ).first()

        is_blocked = Block.objects.filter(
            Q(blocker=user, blocked=other_user) | 
            Q(blocker=other_user, blocked=user)
        ).exists()

        return Response({
            'friendship_status': friendship.status if friendship else None,
            'is_blocked': is_blocked,
            'can_send_request': not is_blocked and not friendship
        })


# class UsersView(ListAPIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [CustomJWTAuthentication]
#     serializer_class = UserSerializer
#     queryset = User.objects.all()

#     def get(self, request):
#         users = self.get_queryset()
#         serializer = self.get_serializer(users, many=True)
#         return Response({
#             'status': 'success',
#             'data': serializer.data
#         }, status=200)

class FriendsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        # Get friends who are not blocked
        return User.objects.filter(
            Q(friendship_received__from_user=user, friendship_received__status='accepted') |
            Q(friendship_sent__to_user=user, friendship_sent__status='accepted')
        ).exclude(
            # Exclude users that the current user has blocked
            Q(blocked__blocker=user) |
            # Exclude users that have blocked the current user
            Q(blocker__blocked=user)
        ).exclude(id=user.id).distinct()

    def get(self, request, *args, **kwargs):
        friends = self.get_queryset()
        serializer = self.get_serializer(friends, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=200)



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
        qr = qrcode.QRCode(version=1, box_size=5, border=5)
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
        httponly=True,  # Change based on your requirements
        secure=True,     # Set to True for HTTPS
        samesite='None'  # Allows cross-origin requests
    )
    return response

class AchievementsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        user = request.user
        achievements = Achievement.objects.filter(user=user)
        serializer = AchievementsSerializer(achievements, many=True)
        return Response(serializer.data)

class LoginView42(APIView):
    permission_classes = []
    authentication_classes = []
    def get(self, request):
        base_url = "https://api.intra.42.fr/oauth/authorize"
        params = {
            'client_id': 'u-s4t2ud-f2a0bfd287f4c37740530cca763664739f4f578abb6ac907be0ea54d0337efbc',
            'redirect_uri': 'https://127.0.0.1:8001/callback',
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
            'client_id': 'u-s4t2ud-f2a0bfd287f4c37740530cca763664739f4f578abb6ac907be0ea54d0337efbc',
            'client_secret': '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',
            'redirect_uri': 'https://127.0.0.1:8001/callback',
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

        user, created = User.objects.get_or_create(username=user_data['login'],
            defaults={
                'username' : user_data['login'],
                'email' : user_data['email'],
                'first_name' : user_data['first_name'],
                'last_name' : user_data['last_name'],
                'image': user_data['image']['link'], 
            }
        )
        
        # print('IS ACTIVE NOW ', user.is_active)
        # print('USER ID', user.id)
        # print('GROUP USER ', user.groups)        
        # print('IS TEST ACTIVE NOWNOW ', User.objects.get(id=1).is_active)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        user.is_online = True
        user.save()
        return set_auth_cookies_and_response(user, refresh_token, access_token, request)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    authentication_classes = [CustomJWTAuthentication]  # Disable authentication for this view
    serializer_class = ProfileSerializer

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
    

class CustomLoginView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response({'error': 'Invalid credentials'}, status=400)
            
        # Check if 2FA is enabled
        if user.is_2fa_enabled:
            # Create a temporary session for 2FA verification
            session = {
                'user_id': user.id,
                'requires_2fa': True
            }
            session_id = str(uuid.uuid4())
            cache.set(session_id, session, timeout=300)  # 5 minutes timeout
            
            return Response({
                'requires_2fa': True,
                'session_id': session_id
            }, status=status.HTTP_200_OK)
        
        # If 2FA is not enabled, proceed with normal login
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        user.is_online = True
        user.save()
        return set_auth_cookies_and_response(user, refresh_token, access_token, request)

    
class TOTPVerifyView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = TOTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        session_id = serializer.validated_data['session_id']
        token = serializer.validated_data['token']
        
        # Retrieve session from cache
        session = cache.get(session_id)
        if not session:
            return Response({
                'error': 'Invalid or expired session'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=session['user_id'])
            device = TOTPDevice.objects.get(user=user, confirmed=True)
            
            if device.verify_token(token):
                # Clear the session
                cache.delete(session_id)
                
                # Create tokens and login
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                
                return set_auth_cookies_and_response(
                    user, 
                    refresh, 
                    access_token, 
                    request
                )
            
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except (User.DoesNotExist, TOTPDevice.DoesNotExist):
            return Response({
                'error': 'Invalid session'
            }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    
    def post(self, request):
        user = request.user
        user.is_online = False
        user.save()
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        response.delete_cookie('logged_in')
        return response

class RefreshTokenView(APIView):
    permission_classes = []
    authentication_classes = []
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token not found'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            response = Response({'detail': 'Token refreshed successfully'})
            
            # Set the new access token
            # response.set_cookie(
            #     'access_token',
            #     access_token,
            #     max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            #     httponly=True,
            #     secure=True,
            #     samesite='None'
            # )
            
            return set_auth_cookies_and_response(
                refresh.get('user'),
                refresh_token,
                access_token,
                request
            )
            
        except Exception as e:
            return Response(
                {'error': 'Invalid refresh token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

# class RefreshTokenView(APIView):
#     permission_classes = []
#     authentication_classes = []
    
#     def post(self, request):
#         refresh_token = request.COOKIES.get('refresh_token')
        
#         if not refresh_token:
#             return Response(
#                 {'error': 'Refresh token not found'}, 
#                 status=status.HTTP_401_UNAUTHORIZED
#             )
            
#         try:
#             refresh = RefreshToken(refresh_token)
#             access_token = str(refresh.access_token)
            
#             # Get user information
#             token = RefreshToken(refresh_token)
#             user_id = token.payload.get('user_id')
#             user = User.objects.get(id=user_id)
            
#             # Use your existing function to set cookies and create response
#             return set_auth_cookies_and_response(
#                 user,
#                 refresh_token,
#                 access_token,
#                 request
#             )
            
#         except Exception as e:
#             return Response(
#                 {'error': 'Invalid refresh token'}, 
#                 status=status.HTTP_401_UNAUTHORIZED
#             )


class UserRetrieveAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data
        })

class ListUsers(ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = UserSerializer
    # print('hfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfh ',queryset)
    def get(self, request):
        user = User.objects.all()
        #prints all data that mounted about the user
        # print('This shows the actual SQL query', user.query)
        #displayes the data by your choice (to know the choice see the output of up print )
        print('WAKWAKWAKWAKWAKWAKWAKWKAKWAK', user.values('id', 'username', 'is_active')) 
        #displayes all the fields 
        # print('values', user.values())
        print(f"Total user: {user.count()}")
        print(f"First user: {user.first()}")
        # logger.debug(f"Query: {users.query}")
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class UserUpdateAPIView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

class RegisterView(APIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = RegisterSerializer

    def post(self, request):
        print('REQUEST DATAmmmmmmmmmm', request.data)
        """
        Register View
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            pp(user)
            return Response({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "status": "success",
                "message": "Registration successful, please setup 2FA"
            }, status=status.HTTP_201_CREATED)
        
        # Return all validation errors
        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# class ProfileView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         user = request.user
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)
    
# class ManageProfileView(APIView):
#     permission_classes = [IsAuthenticated]
#     def put(self, request):
#         user = request.user
#         serializer = ProfileSerializer(user, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=400)
    
#     def get(self, request):
#         user = request.user
#         serializer = ProfileSerializer(user)
#         return Response(serializer.data)

# class ProfileAccountView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         user = request.user
#         serializer = ProfileSerializer(user)
#         return Response(serializer.data)
    
# def verify_otp(user, token):
#     for device in devices_for_user(user):
#         if device.verify_token(token):
#             return True
#     return False

# class TwoFactorLoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')
#         token = request.data.get('token')
        
#         # Authenticate user
#         user = authenticate(username=username, password=password)
#         if user is not None:
#             if verify_otp(user, token):  # Verify the OTP
#                 login(request, user)
#                 return Response({'status': 'success'}, status=200)
#             else:
#                 return Response({'error': 'Invalid OTP'}, status=400)
#         else:
#             return Response({'error': 'Invalid credentials'}, status=400)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

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

