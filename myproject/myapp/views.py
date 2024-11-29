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
from .models import Profile
from pprint import pp
import pprint

from django.utils.http import urlencode
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .CustomJWTAuthentication import CustomJWTAuthentication
from .models import Friendship, Block
from django.db.models import Q


class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        user = request.user
        other_user = Profile.objects.get(id=id)
        Block.objects.filter(blocker=user, blocked=other_user).delete()
        return Response({"message": "User unblocked successfully."}, status=200)

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        user = request.user
        other_user = Profile.objects.get(id=id)
        Block.objects.create(blocker=user, blocked=other_user)
        return Response({"message": "User blocked successfully."}, status=200)

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
        print('IDDDDD', id)
        user = request.user
        other_user = Profile.objects.get(id=id)
        Friendship.objects.create(from_user=user, to_user=other_user)
        return Response({"message": "Friend request sent successfully."}, status=200)


class FriendshipStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, id):
        user = request.user
        other_user = Profile.objects.get(id=id)
        
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
            'is_blocked': is_blocked
        })


# class UsersView(ListAPIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [CustomJWTAuthentication]
#     serializer_class = UserSerializer
#     queryset = Profile.objects.all()

#     def get(self, request):
#         users = self.get_queryset()
#         serializer = self.get_serializer(users, many=True)
#         return Response({
#             'status': 'success',
#             'data': serializer.data
#         }, status=200)

class UsersView(ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        # Get friends who are not blocked
        return Profile.objects.filter(
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
                'image': user_data['image']['link'], 
                # 'is_online': True,
                # 'is_active': true
                # 'is_active': user_data['is_active'],
                # 'id': user_data['id']
                # 'image': request.build_absolute_uri(user_data['image']['link']),
            }
        )
                
        
        print('IS ACTIVE NOW ', user.is_active)
        print('USER ID', user.id)
        print('GROUP USER ', user.groups)        
        print('IS TEST ACTIVE NOWNOW ', Profile.objects.get(id=1).is_active)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        user.is_online = True
        user.save()
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
            user.is_online = True
            user.save()
            return set_auth_cookies_and_response(user, refresh, access_token, request)
        return Response({'error': 'Invalid credentials'}, status=400)

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
    authentication_classes = [CustomJWTAuthentication]
    queryset = Profile.objects.all()
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
        user = Profile.objects.all()
        #prints all data that mounted about the user
        # print('This shows the actual SQL query', user.query)
        #displayes the data by your choice (to know the choice see the output of up print )
        print('WAKWAKWAKWAKWAKWAKWAKWKAKWAK', user.values('id', 'username', 'is_active')) 
        #displayes all the fields 
        # print('values', user.values())
        print(f"Total user: {user.count()}")
        print(f"First user: {user.first()}")
        # logger.debug(f"Query: {users.query}")
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




