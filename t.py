from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.contrib.auth import logout
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.core.cache import cache
from django.db.models import Q
from .CustomJWTAuthentication import CustomJWTAuthentication
from .models import User, Friendship, Block, Notification

class DeleteAccountView(APIView):
    """
    View for handling user account deletion with proper cleanup
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def delete(self, request):
        user = request.user
        
        try:
            with transaction.atomic():
                # 1. Clean up authentication related data
                tokens = OutstandingToken.objects.filter(user=user)
                for token in tokens:
                    BlacklistedToken.objects.get_or_create(token=token)
                
                # 2. Clean up social connections
                Friendship.objects.filter(
                    Q(from_user=user) | Q(to_user=user)
                ).delete()
                
                Block.objects.filter(
                    Q(blocker=user) | Q(blocked=user)
                ).delete()
                
                # 3. Clean up notifications
                Notification.objects.filter(
                    Q(recipient=user) | Q(sender=user)
                ).delete()
                
                # 4. Clean up game stats
                user.wins = 0
                user.losses = 0
                user.level = 0
                user.winrate = 0
                user.leaderboard_rank = 0
                user.is_online = False
                user.is_2fa_enabled = False
                user.save()
                
                # 5. Remove achievements
                user.achievements.clear()
                
                # 6. Delete user
                user.delete()
                
                # 7. Clear cache
                cache.delete(f'user_{user.id}_data')
                
                response = Response(
                    {'message': 'Account deleted successfully'},
                    status=status.HTTP_204_NO_CONTENT
                )
                
                # Clear auth cookies
                response.delete_cookie('access_token', path='/')
                response.delete_cookie('refresh_token', path='/')
                response.delete_cookie('logged_in', path='/')
                
                return response
                
        except Exception as e:
            print(f"Error deleting account: {str(e)}")
            return Response(
                {
                    'error': 'Failed to delete account',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



            