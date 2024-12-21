from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from two_factor.urls import urlpatterns as tf_urls
from myapp.views import TOTPVerifyView,TOTPSetupView, TOTPDisableView, TOTStatusView, CustomLoginView, AchievementsView, ChangePasswordView, UsersView, UnblockUserView, BlockUserView, FriendRequestsView, \
                    MarkAllAsReadView, NotificationListView, UnreadNotificationView, NotificationViewSet, UploadImageView, FriendshipStatusView, RemoveFriendshipView, FriendsView, LoginView42, LoginCallbackView, LogoutView, ListUsers, UserRetrieveAPIView, UserUpdateAPIView, RegisterView, RefreshTokenView, UserProfileView

urlpatterns = [
    path('login42/', LoginView42.as_view(), name='42login'),
    path('api/accounts/42/login/callback', LoginCallbackView.as_view(), name='login_callback'),
    # path('api/profile/', ProfileView.as_view(), name='profile'),
    # path('api/manage_profile/', ManageProfileView.as_view(), name='manage_profile'),
    path('api/user/', ListUsers.as_view(), name='user-list'),
    path('api/users/<int:id>/', UserRetrieveAPIView.as_view(), name='user-detail'),
    path('api/update_user/<int:id>/', UserUpdateAPIView.as_view(), name='update_user'),
    path('api/accounts/logout/', LogoutView.as_view(), name='logout'),
    path('api/accounts/register/', RegisterView.as_view(), name='register_page'),
    path('api/user_profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/achievements/', AchievementsView.as_view(), name='achievements'),
    path('api/change_password/', ChangePasswordView.as_view(), name='edit_pass'),
    path('api/friends/', FriendsView.as_view(), name='users'),
    path('api/users/', UsersView.as_view(), name='users'),
    path('api/friends/friendship_status/<int:id>/', FriendshipStatusView.as_view(), name='friendship_status'),
    path('api/friends/friend_requests/', FriendRequestsView.as_view(), name='friend_requests'),
    path('api/friends/block_user/<int:id>/', BlockUserView.as_view(), name='block_user'),
    path('api/friends/unblock_user/<int:id>/', UnblockUserView.as_view(), name='unblock_user'),
    path('api/friends/remove_friendship/<int:id>/', RemoveFriendshipView.as_view(), name='remove_friendship'),
    path('api/notifications/<int:pk>/mark-read/', NotificationViewSet.as_view({'post': 'mark_read'}), name='mark_read'),
    path('api/notifications/unread/', UnreadNotificationView.as_view(), name='unread_notifications'),
    path('api/notifications/mark-all-read/', MarkAllAsReadView.as_view(), name='mark_all_read'),
    path('api/notifications/', NotificationListView.as_view(), name='notifications'),
    path('api/2fa/setup/', TOTPSetupView.as_view(), name='2fa-setup'),
    path('api/2fa/disable/', TOTPDisableView.as_view(), name='2fa-disable'),
    path('api/2fa/status/', TOTStatusView.as_view(), name='2fa-status'),
    path('api/accounts/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/2fa/verify_otp/', TOTPVerifyView.as_view(), name='verify_otp'),
    path('api/accounts/refresh/', RefreshTokenView.as_view(), name='refresh_token'),
    path('api/upload-image/', UploadImageView.as_view(), name='upload-image'),
]