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
from .serializers import RegisterStepTwoSerializer, FriendshipSerializer, UserSerializer, RegisterSerializer, ChangePasswordSerializer, CustomTokenObtainPairSerializer, TOTPVerifySerializer, TOTPSetupSerializer, EmailChangeSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django_otp import devices_for_user
from django.contrib.auth import authenticate
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework import status, views
from .models import User
from pprint import pp
import pprint
from django.utils.http import urlencode
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
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
from chat.models import ChatRoom, Message
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
import random
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from .serializers import BlockSerializer
from django.db import transaction

from PIL import Image

class ProfilePictureUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    
    def post(self, request, *args, **kwargs):
        try:
            if 'image' not in request.FILES:
                return Response(
                    {'error': 'No image file provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            image_file = request.FILES['image']
            
            # Validate file type
            if not image_file.content_type.startswith('image/'):
                return Response(
                    {'error': 'Invalid file type. Please upload an image file'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate file size (5MB)
            if image_file.size > 5 * 1024 * 1024:
                return Response(
                    {'error': 'File size too large. Maximum size is 5MB'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # Read the image file
                image_content = image_file.read()
                
                # Convert to PIL Image
                img = Image.open(BytesIO(image_content))
                
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1])
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')

                # Save as JPEG in memory
                buffer = BytesIO()
                img.save(buffer, format='JPEG', quality=85)
                buffer.seek(0)
                
                # Convert to base64
                img_str = base64.b64encode(buffer.getvalue()).decode()
                base64_image = f"data:image/jpeg;base64,{img_str}"

                # Create new request data for UploadImageView
                new_request = type('Request', (), {})()
                new_request.data = {'image': base64_image}
                
                # Use existing UploadImageView
                upload_view = UploadImageView()
                upload_response = upload_view.post(new_request)

                if upload_response.status_code == status.HTTP_201_CREATED:
                    image_url = upload_response.data.get('url')
                    
                    # Update user's image URL
                    request.user.image = image_url
                    request.user.save()

                    return Response({
                        'message': 'Profile picture updated successfully',
                        'image': image_url
                    }, status=status.HTTP_200_OK)
                else:
                    return upload_response

            except Exception:
                return Response(
                    {'error': 'Error processing image. Please try again.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception:
            return Response(
                {'error': 'An error occurred while updating profile picture'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, *args, **kwargs):
        """Remove profile picture and set to default"""
        try:
            request.user.image = None
            request.user.save()

            return Response({
                'message': 'Profile picture removed successfully'
            }, status=status.HTTP_200_OK)

        except Exception:
            return Response(
                {'error': 'An error occurred while removing profile picture'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request, *args, **kwargs):
        """Get current profile picture URL"""
        try:
            return Response({
                'image': request.user.image
            }, status=status.HTTP_200_OK)

        except Exception:
            return Response(
                {'error': 'An error occurred while fetching profile picture'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EmailChangeView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = EmailChangeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            try:
                # Update the user's email
                user = request.user
                serializer.update(user, serializer.validated_data)

                return Response({
                    'message': 'Email updated successfully',
                    'email': user.email
                }, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView1(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email,
            'is_2fa_enabled': user.is_2fa_enabled,
            'auth_provider': user.auth_provider
        })

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    
    def delete(self, request):
        try:
            user = request.user
            # Delete the user - this will cascade delete related objects 
            # if foreign keys are set up with on_delete=CASCADE
            user.delete()
            # Clear the session
            logout(request)
            return Response(
                {"message": "Account successfully deleted"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    "error": "Failed to delete account",
                    "detail": str(e) if settings.DEBUG else "Please try again later"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class HealthView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        return Response({'status': 'ok'})

class UpdateUserLastActiveView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        user = request.user
        user.last_active = timezone.now()
        user.save()
        print("user.last_active1 = = = updated for user = = = ", user.username)
        print("last_active ", user.last_active)
        return Response({'message': 'User last active updated'})

class UsersView(ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get(self, request):
        """
        Get all users
        get_queryset() is used to get all users from the database and is defined in the class FriendsView
        """
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
        """
        Remove a friendship between the current user and another user
        """
        user = request.user
        Friendship.objects.filter(Q(from_user=user, to_user_id=id) | 
                                  Q(to_user=user, from_user_id=id)).delete()
        return Response(status=204)

class UnblockUserView(APIView):
    # this view is used to unblock a user
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        """
        Unblock a user
        """
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

class BlockCheckView(APIView):
    """
    this view is to know how blocked the other
    to know if A blocked B or B blocked A
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, id):
        """
        Check if the current user has blocked another user
        """
        user = request.user
        try:
            other_user = User.objects.get(id=id)
            # Check if block exists in either direction
            block_exists = Block.objects.filter(
                Q(blocker=user, blocked=other_user) 
            ).exists()
            if block_exists:
                return Response({
                    "message": "You have blocked this user",
                    "is_blocked": True
                }, status=200)
            elif Block.objects.filter(
                Q(blocker=other_user, blocked=user)
            ).exists():
                return Response({
                    "message": "This user has blocked you",
                    "is_blocked": True
                }, status=201)
            return Response({
                "message": "No block found",
                "is_blocked": False
            }, status=202)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
            

class BlockedUsersView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = BlockSerializer


    def get(self, request):
        """
        Get all blocked users for the current user
        """
        blocked_users = Block.objects.filter(blocker=request.user)
        serializer = self.serializer_class(blocked_users, many=True)
        return Response(serializer.data)

class BlockedByUsersView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = BlockSerializer

    def get(self, request):
        """
        Get all users that have blocked the current user
        """
        blocked_by_users = Block.objects.filter(blocked=request.user)
        serializer = self.serializer_class(blocked_by_users, many=True)
        return Response(serializer.data)

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        """
        Block a user
        """
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
                "can_send_request": False,
                "blocker": user.username,
                "blocked": other_user.username
            }, status=200)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class FriendRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        """
        Get all friend requests for the current user
        """
        user = request.user
        friend_requests = Friendship.objects.filter(to_user=user, status='pending')
        serializer = FriendshipSerializer(friend_requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Accept or reject a friend request
        """
        print("request.data = = = >>>", request.data)
        friend_request_id = request.data.get('request_id')
        action = request.data.get('action')  # 'accept' or 'reject'
        
        try:
            friendship = Friendship.objects.get(id=friend_request_id, to_user=request.user, status='pending')
            if action == 'accept':
                friendship.status = 'accepted'
                friendship.save()
                return Response({"message": "Friend request accepted"}, status=200)
            elif action == 'reject':
                friendship.delete()
                return Response({"message": "Friend request rejected"}, status=200)
            
            return Response({"error": "Invalid action"}, status=400)
        except Friendship.DoesNotExist:
            return Response({"error": "Friend request not found"}, status=400)


class FriendshipStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, id):
        """
        Get the friendship status between the current user and another user
        """
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
        # print("friendship from_user = = = ", friendship.from_user)
        # print("friendship to_user = = = ", friendship.to_user)
        return Response({
            'friendship_status': friendship.status if friendship else None,
            'is_blocked': is_blocked,
            'can_send_request': not is_blocked and not friendship,
            'from_user': friendship.from_user.username if friendship else None,
            'to_user': friendship.to_user.username if friendship else None,
        })

class FriendsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = UserSerializer

    def get_queryset(self):
        """
        Get friends of the current user
        """
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
        """
        Get friends of the current user
        """
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
        # Creates a new unconfirmed TOTP device for the current user
        device = TOTPDevice.objects.create(
            user=request.user,
            confirmed=False
        )
        # Creates a new QR code object with specified version, box size, and border width
        qr = qrcode.QRCode(version=1, box_size=5, border=5)
        # Gets the configuration URL from the TOTP device (contains the secret key and other settings)
        provisioning_uri = device.config_url
        # Adds the configuration URL to the QR code and generates the QR code matrix
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        # Creates a black and white image of the QR code
        img = qr.make_image(fill_color="black", back_color="white")
        # Creates a memory buffer and saves the QR code image as PNG to it
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        # Converts the PNG image to a base64 string that can be sent in JSON
        qr_code = base64.b64encode(buffer.getvalue()).decode()
        
        return Response({
            'qr_code': qr_code,
            'secret_key': device.config_url,
        })

    def post(self, request):
        serializer = TOTPSetupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Tries to find the user's unconfirmed TOTP device, returns error if none exists
        try:
            device = TOTPDevice.objects.get(user=request.user, confirmed=False)
        except TOTPDevice.DoesNotExist:
            return Response(
                {'error': 'No TOTP device found. Please start setup process again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Verifies if the provided token matches what the TOTP device generates
        if device.verify_token(serializer.validated_data['token']):
            # Delete any previously confirmed devices
            TOTPDevice.objects.filter(user=request.user, confirmed=True).delete()
            # Marks the current device as confirmed and saves it
            device.confirmed = True
            device.save()
            # Enables 2FA on the user's account and saves the change
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
            # Attempts to find the user's confirmed TOTP device
            device = TOTPDevice.objects.get(user=request.user, confirmed=True)
            # Deletes the TOTP device, effectively disabling 2FA
            device.delete()  # Delete the device to disable 2FA
            # Updates the user's profile to indicate 2FA is disabled and saves the changes
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
            # Gets the 2FA status from the user's profile
            is_2fa_enabled = request.user.is_2fa_enabled
            return Response({
                "isTwoFaEnabled": is_2fa_enabled,
                "can_enable_2fa": request.user.can_enable_2fa
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




def set_auth_cookies_and_response(user, refresh_token, access_token, request):
    # Creattes response with serialized user data
    response = Response({
        'user': UserSerializer(user, context={'request': request}).data
    })
    # Set access token cookie
    response.set_cookie(
        'access_token',
        str(access_token),
        max_age=36000,
        expires=36000,
        httponly=True, 
        secure=True,  # Use secure=True if your site is served over HTTPS
        samesite='None',  # Adjust as needed, could also be 'Strict' or 'None'
    )
    # max_age/expires: 10 hours (36000 seconds)
    # httponly: Prevents JavaScript access
    # secure: Only sent over HTTPS
    # samesite: Cross-origin cookie behavior
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
    # httponly: False allows JavaScript access
    # secure: False allows HTTP
    # samesite: Strict security for cross-origin requests
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
            'redirect_uri': 'https://10.13.10.10:8001/callback',
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
            'redirect_uri': 'https://10.13.10.10:8001/callback',
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
                'auth_provider': User.AuthProvider.INTRA,
            }
        )
        # if user.is_online:
        #     return Response({'error': 'User is already logged in'}, status=400)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        cache.set(f'access_token_{str(user.id)}', access_token, timeout=6000)

        user.is_online = True
        user.save()
        return set_auth_cookies_and_response(user, refresh_token, access_token, request)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    authentication_classes = [CustomJWTAuthentication]  # Disable authentication for this view
    # serializer_class = ProfileSerializer
    serializer_class = UserSerializer

    def get(self, request):
        profile = request.user  # Since Profile extends AbstractUser
        serializer = UserSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user
        serializer = UserSerializer(profile, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User data updated successfully."}, status=200)
        return Response(serializer.errors, status=400)
    

class CustomLoginView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # Extracts username and password from the request data
        username = request.data.get('username')
        password = request.data.get('password')

        # Attempts to authenticate the user with provided credentials
        user = authenticate(username=username, password=password)

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.is_online:
            return Response({'error': 'User is already logged in'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if 2FA is enabled
        if user.is_2fa_enabled:
            return Response({
                'requires_2fa': True,
                'user_id': user.id, # You might want to encrypt this in production
                'username': username
            }, status=status.HTTP_200_OK)
        
        # If 2FA not enabled, generates JWT refresh and access tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        cache.set(f'access_token_{user.id}', access_token, timeout=6000)

        # Marks user as online and saves the change
        user.is_online = True
        user.save()

        return set_auth_cookies_and_response(user, refresh_token, access_token, request)


    
class TOTPVerifyView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # Validates the incoming data (session_id and token) using a serializer, returns errors if invalid
        serializer = TOTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Extracts the validated session ID and TOTP token from the request
        user_id = serializer.validated_data['user_id']
        token = serializer.validated_data['token']
        # Tries to retrieve the temporary session from cache. Returns error if not found or expired
        # session = cache.get(session_id)
        # if not session:
        #     return Response({
        #         'error': 'Invalid or expired session'
        #     }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Attempts to find the user associated with the session ID
            user = User.objects.get(id=user_id)
            # Looks for the user's confirmed TOTP device
            device = TOTPDevice.objects.get(user=user, confirmed=True)
            # Checks if the provided TOTP token is valid
            if device.verify_token(token):
                # If token is valid, removes the temporary session from cache
                # cache.delete(session_id)
                # Generates new JWT refresh and access tokens for the authenticated user
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                user.is_online = True
                user.save()
                
                return set_auth_cookies_and_response(
                    user, 
                    refresh_token, 
                    access_token,
                    request
                )
            
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        except TOTPDevice.DoesNotExist:
            return Response({
                'error': 'No 2FA device found'
            }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    
    def post(self, request):
        try:
            # Get tokens from cookies
            refresh_token = request.COOKIES.get('refresh_token')
            access_token = request.COOKIES.get('access_token')
            
            # Blacklist refresh token if exists
            if refresh_token:
                try:
                    # Convert token string to RefreshToken object
                    token = RefreshToken(str(refresh_token))
                    token.blacklist()
                except (TokenError, AttributeError, TypeError) as e:
                    print(f"Refresh token blacklist error: {str(e)}")
            
            # Blacklist access token if exists
            if access_token:
                try:
                    cache.set(
                        f'blacklist_token_{str(access_token)}',
                        'blacklisted',
                        timeout=36000
                    )
                except Exception as e:
                    print(f"Cache error: {str(e)}")
            
            # Update user status
            user = request.user
            user.is_online = False
            user.save()
            
            # Create response and delete cookies
            response = Response({'message': 'Logged out successfully'})
            
            # Delete cookies with complete parameters
            response.delete_cookie('access_token', path='/')
            response.delete_cookie('refresh_token', path='/')
            response.delete_cookie('logged_in', path='/')
            
            return response
            
        except Exception as e:
            print(f"Logout error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

def clear_auth_cookies(response):
    print('clear_auth_cookies')
    response.set_cookie('access_token', '', max_age=0)
    response.set_cookie('refresh_token', '', max_age=0)
    response.set_cookie('logged_in', '', max_age=0)
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
            
            return set_auth_cookies_and_response(
                refresh.get('user'),
                refresh_token,
                access_token,
                request
            )
            
        except Exception as e:
            response = Response({
                'error': 'Invalid refresh token'
            })
            response = clear_auth_cookies(response)
            return response

class UserRetrieveAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # serializer_class = ProfileSerializer
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data
        })

class ListUsers(ListAPIView):
    """
    this view is used to list all the users
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    # serializer_class = ProfileSerializer
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


from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import base64
import uuid
import os

class UploadImageView(APIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = RegisterSerializer

    # Define allowed image formats
    ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'gif', 'webp']

    def ensure_avatar_directory(self):
        """Ensure the avatars directory exists"""
        avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        if not os.path.exists(avatar_dir):
            os.makedirs(avatar_dir, exist_ok=True)
        return avatar_dir

    def get_file_extension(self, format_str):
        """Extract and validate file extension from format string"""
        # For data:image/jpeg;base64 -> returns 'jpeg'
        ext = format_str.split('/')[-1].lower()
        return ext if ext in self.ALLOWED_FORMATS else None

    def post(self, request):
        try:
            image_data = request.data.get('image')
            
            if not image_data:
                return Response(
                    {'error': 'No image data provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ensure avatar directory exists
            self.ensure_avatar_directory()

            # Handle base64 image
            if isinstance(image_data, str):
                try:
                    if 'data:image' in image_data:
                        format_str, imgstr = image_data.split(';base64,')
                        ext = self.get_file_extension(format_str)
                        if not ext:
                            return Response({
                                'error': f'Invalid image format. Allowed formats: {", ".join(self.ALLOWED_FORMATS)}'
                            }, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        return Response({
                            'error': 'Invalid image format. Image must be in base64 format with proper header'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    filename = f"{uuid.uuid4()}.{ext}"
                    try:
                        data = ContentFile(base64.b64decode(imgstr))
                    except Exception:
                        return Response({
                            'error': 'Invalid base64 image data'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Save file in avatars subdirectory
                    file_path = f'avatars/{filename}'
                    saved_path = default_storage.save(file_path, data)
                    
                    # Generate URL using backend port
                    image_url = f"http://127.0.0.1:8000/media/{saved_path}"
                    
                    return Response({'url': image_url}, status=status.HTTP_201_CREATED)
                except Exception:
                    return Response({
                        'error': 'Error processing image. Please try again.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'error': 'Invalid image data'
            }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception:
            return Response({
                'error': 'An unexpected error occurred'
            }, status=status.HTTP_400_BAD_REQUEST)
    
class RegisterStepOneView(APIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = RegisterSerializer

    def post(self, request):
        print("Received step one data:", request.data)  # Debug line
        serializer = self.serializer_class(data=request.data, partial=True)
        if serializer.is_valid():
            return Response({
                "status": "success",
                "message": "Step one data submitted successfully.",
                "data": serializer.validated_data  # Return the validated data to the client
            }, status=status.HTTP_200_OK)
        
        print("Validation errors:", serializer.errors)  # Debug line
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterCompleteView(APIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = RegisterStepTwoSerializer

    def post(self, request):
        # Validate and process complete registration data
        complete_data = request.data
        print("Received complete registration data:", complete_data)  # Debug line

        serializer = RegisterSerializer(data=complete_data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "image": user.image,
                "status": "success",
                "message": "Registration successful, please setup 2FA"
            }, status=status.HTTP_201_CREATED)

        print("Validation errors:", serializer.errors)  # Debug line
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class RegisterView(APIView):
#     permission_classes = []
#     authentication_classes = []
#     serializer_class = RegisterSerializer

#     def post(self, request):
#         print("Received registration data:", request.data)  # Add this debug line
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             return Response({
#                 "user_id": user.id,
#                 "username": user.username,
#                 "email": user.email,
#                 "image": user.image,
#                 "status": "success",
#                 "message": "Registration successful, please setup 2FA"
#             }, status=status.HTTP_201_CREATED)
        
#         print("Validation errors:", serializer.errors)  # Add this debug line
#         return Response({
#             "status": "error",
#             "errors": serializer.errors
#         }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        print("Received change password data:", request.data)  # Debug line
        # Pass request in the context when initializing the serializer
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        user = request.user

        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)

            # Set the new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

        print("Validation errors:", serializer.errors)  # Debug line
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    
    def post(self, request, notification_id=None):
        """Mark a specific notification as read"""
        try:
            notification = Notification.objects.get(
                id=notification_id, 
                recipient=request.user,
            )
            if notification.is_read:
                return Response(
                    {"error": "Notification already read"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            notification.is_read = True
            notification.save()
            return Response(status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class NotificationListView(APIView):
    """
    This view is used to get all the notifications for the current user.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# class NotificationsView(APIView):
#     """
#     This view is used to get all the notifications for the current user.
#     """
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [CustomJWTAuthentication]
#     def get(self, request):
#         notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
#         serializer = NotificationSerializer(notifications, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

class DeleteNotificationsView(APIView):
    """
    This view is used to delete all the notifications for the current user.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    def post(self, request):
        Notification.objects.filter(recipient=request.user).delete()
        return Response(status=status.HTTP_200_OK)
    
class UnreadNotificationView(APIView):
    """
    This view is used to get all the unread notifications for the current user.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    def get(self, request):
        unread_notifications = Notification.objects.filter(recipient=request.user, is_read=False)
        serializer = NotificationSerializer(unread_notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

    
class MarkAllAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response(status=status.HTTP_200_OK)


class UserAchievementsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = AchievementsSerializer

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            achievements = user.achievements.all()
            serializer = self.serializer_class(achievements, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )