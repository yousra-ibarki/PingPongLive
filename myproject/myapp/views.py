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
from .serializers import FirstNameUpdateSerializer, RegisterStepTwoSerializer, UserSerializer, RegisterSerializer, ChangePasswordSerializer, CustomTokenObtainPairSerializer, TOTPVerifySerializer, TOTPSetupSerializer, EmailChangeSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import FriendshipSerializer
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
import os
from datetime import datetime
from urllib.parse import urlparse, urlunparse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


# this endpoint is used to get user image based on user username
class UserImageView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            return Response({
                'image': user.image
            })
            print("uuuuuu",username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class ProfilePictureUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    
    def build_url_with_port(self, request, path):
        """Build absolute URI with port 8002"""
        port = settings.BACKEND_PORT
        url = request.build_absolute_uri(path)
        parsed = urlparse(url)
        return urlunparse((
            parsed.scheme,
            f"{parsed.hostname}:{port}",
            parsed.path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))

    def process_image(self, image_file):
        """Process and optimize the image"""
        img = Image.open(image_file)
        
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
        
        return buffer

    def generate_unique_filename(self):
        """Generate a unique filename for the image"""
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        unique_id = uuid.uuid4().hex[:8]
        return f"profile_{unique_id}_{timestamp}.jpg"

    def save_image(self, image_data, request):
        """Save the image and return the URL"""
        filename = self.generate_unique_filename()
        
        # Ensure the profile_images directory exists
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'profile_images')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join('profile_images', filename)
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        
        with open(full_path, 'wb') as f:
            f.write(image_data.getvalue())
        
        # Generate URL with port 8002
        relative_url = os.path.join(settings.MEDIA_URL, file_path)
        return self.build_url_with_port(request, relative_url)

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
                # Process the image
                processed_image = self.process_image(image_file)
                
                # Delete old image if exists
                if request.user.image:
                    old_path = urlparse(request.user.image).path
                    if old_path.startswith('/media/'):
                        old_path = old_path[7:]  # Remove '/media/' prefix
                        full_path = os.path.join(settings.MEDIA_ROOT, old_path)
                        if os.path.exists(full_path):
                            os.remove(full_path)
                
                # Save the new image and get URL
                image_url = self.save_image(processed_image, request)
                
                # Update user's image URL
                request.user.image = image_url
                request.user.save()

                return Response({
                    'message': 'Profile picture updated successfully',
                    'image': image_url
                }, status=status.HTTP_200_OK)

            except Exception as e:
                return Response(
                    {'error': 'Error processing image. Please try again.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {'error': 'An error occurred while updating profile picture'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FirstNameUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = FirstNameUpdateSerializer

    def post(self, request, *args, **kwargs):
        try:
            # Get data from request
            new_name = request.data.get('new_name')
            confirm_new_name = request.data.get('confirm_new_name')

            # Check if both fields are provided
            if not new_name or not confirm_new_name:
                return Response(
                    {'error': 'Both new name and confirmation are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Initialize serializer with request data
            serializer = self.serializer_class(data=request.data)

            # Validate the data
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if names match
            if new_name != confirm_new_name:
                return Response(
                    {'error': 'Names do not match. Please enter matching names'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if the name is different from current
            if request.user.first_name == new_name:
                return Response(
                    {'error': 'New name is the same as current name'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update user's first name
            request.user.first_name = new_name
            request.user.save(update_fields=['first_name'])
            print("request.data789 ",request.data)
            return Response({
                'message': 'First name updated successfully',
                'first_name': new_name
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': 'An error occurred while updating first name'}, 
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
        return Response({'message': 'User last active updated'})

class UsersView(ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get(self, request):
        """
        Get all users
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
        base_url = f"{settings.INTRA42_API_URL}/oauth/authorize"
        params = {
            'client_id': settings.INTRA42_CLIENT_ID,
            'redirect_uri': settings.INTRA42_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'public',
            'state': settings.STATE42,
        }
        redirect_url = f'{base_url}?{urlencode(params)}'
        return Response({'redirect_url': redirect_url})


class LoginCallbackView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        code = request.query_params.get('code')
        payload = {
            'code': code,
            'grant_type': 'authorization_code',
            'client_id': settings.INTRA42_CLIENT_ID,
            'client_secret': settings.INTRA42_CLIENT_SECRET,
            'redirect_uri': settings.INTRA42_REDIRECT_URI,
        }
        token_url = f'{settings.INTRA42_API_URL}/oauth/token'
        response = requests.post(token_url, data=payload)

        if response.status_code != 200:
            return Response({'error': 'Failed to retrieve access token'}, status=400)
        data = response.json()

        headers = {'Authorization': f'Bearer {data["access_token"]}'}
        me_url = f'{settings.INTRA42_API_URL}/v2/me'
        response = requests.get(me_url, headers=headers)
        
        if response.status_code != 200:
            return Response({'error': response.json()}, status=response.status_code)
        user_data = response.json()

        if len(user_data['login']) > 8:
            user_data['login'] = user_data['login'][:8]
        if len(user_data['first_name']) > 8:
            user_data['first_name'] = user_data['first_name'][:8]

        user, created = User.objects.get_or_create(
            username=user_data['login'],
            defaults={
                'username': user_data['login'],
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'image': user_data['image']['link'],
                'auth_provider': User.AuthProvider.INTRA,
            }
        )
        
        if user.is_online:
            return Response({'error': 'User is already logged in'}, status=400)
            
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
        # Validates the request data
        serializer = TOTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Extracts the user ID and TOTP token from the validated data
        user_id = serializer.validated_data['user_id']
        token = serializer.validated_data['token']
        try:
            # Retrieves the user object using the user ID
            user = User.objects.get(id=user_id)
            # Looks for the user's confirmed TOTP device
            device = TOTPDevice.objects.get(user=user, confirmed=True)
            # Checks if the provided TOTP token is valid
            if device.verify_token(token):
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
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

def clear_auth_cookies(response):
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
    serializer_class = UserSerializer
    def get(self, request):
        user = User.objects.all()
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UploadImageView(APIView):
    permission_classes = []
    authentication_classes = []

    ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'gif', 'webp']
    MAX_SIZE = 5 * 1024 * 1024  # 5MB

    def ensure_avatar_directory(self):
        """Ensure the avatars directory exists"""
        avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        if not os.path.exists(avatar_dir):
            os.makedirs(avatar_dir, exist_ok=True)
        return avatar_dir

    def build_url_with_port(self, request, path):
        """Build absolute URI with port 8002"""
        port = settings.BACKEND_PORT
        url = request.build_absolute_uri(path)
        parsed = urlparse(url)
        return urlunparse((
            parsed.scheme,
            f"{parsed.hostname}:{port}",
            parsed.path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))

    def handle_base64_image(self, image_data):
        """Handle base64 encoded image data"""
        try:
            format_str, imgstr = image_data.split(';base64,')
            ext = format_str.split('/')[-1].lower()
            
            if ext not in self.ALLOWED_FORMATS:
                raise ValueError(f'Invalid image format. Allowed formats: {", ".join(self.ALLOWED_FORMATS)}')

            image_data = base64.b64decode(imgstr)
            
            if len(image_data) > self.MAX_SIZE:
                raise ValueError('Image size should be less than 5MB')

            # Verify if it's a valid image using PIL
            try:
                # Open the image using PIL
                img = Image.open(BytesIO(image_data))
                # Verify the image by trying to load it
                img.verify()
                
                # Re-open the image after verify (verify closes the file)
                img = Image.open(BytesIO(image_data))
                # Ensure the format matches the extension
                if img.format.lower() not in self.ALLOWED_FORMATS:
                    raise ValueError('Image format does not match the file extension')
                
                # Optional: You can add more checks here
                # For example, checking minimum dimensions:
                # if img.width < 100 or img.height < 100:
                #     raise ValueError('Image dimensions too small')

            except Exception as e:
                raise ValueError(f'Invalid image content: {str(e)}')
            return ContentFile(image_data), ext
            
        except Exception as e:
            raise ValueError(f'Invalid base64 image: {str(e)}')

    def post(self, request):
        """Handle new image upload"""
        content_length = request.META.get('CONTENT_LENGTH')
        if content_length and int(content_length) > self.MAX_SIZE:
            return Response({
                'error': 'File size exceeds maximum limit of 5MB'
            }, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

        try:
            image_data = request.data.get('image')
            if not image_data:
                return Response({
                    'error': 'No image data provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(image_data, str) or not image_data.startswith('data:image'):
                return Response({
                    'error': 'Invalid image format. Please provide a base64 encoded image'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Calculate base64 size before decoding
            # Remove the data:image/png;base64, part before calculating
            base64_str = image_data.split(',')[1] if ',' in image_data else image_data
            base64_size = len(base64_str) * 3 / 4  # Approximate size after decoding
            if base64_size > self.MAX_SIZE:
                return Response({
                    'error': 'File size exceeds maximum limit of 5MB'
                }, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

            try:
                content, ext = self.handle_base64_image(image_data)
            except ValueError as e:
                print(f"Error: {str(e)}")
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


            # Ensure avatar directory exists
            self.ensure_avatar_directory()

            # Generate unique filename
            filename = f"{uuid.uuid4()}.{ext}"
            file_path = f'avatars/{filename}'

            # Save new image
            saved_path = default_storage.save(file_path, content)
            
            # Generate URL with port 8002
            image_url = self.build_url_with_port(request, settings.MEDIA_URL + saved_path)
            
            return Response({
                'url': image_url,
                'message': 'Image uploaded successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'An unexpected error occurred: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class RegisterStepOneView(APIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, partial=True)
        if serializer.is_valid():
            print(serializer.validated_data)
            return Response({
                "status": "success",
                "message": "Step one data submitted successfully.",
                "data": serializer.validated_data  # Return the validated data to the client
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterCompleteView(APIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = RegisterStepTwoSerializer

    def post(self, request):
        # Validate and process complete registration data
        complete_data = request.data

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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
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