from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from two_factor.urls import urlpatterns as tf_urls
from myapp.views import UsersView, UnblockUserView, BlockUserView, FriendRequestsView, SendFriendRequestView, FriendshipStatusView, FriendsView, LoginView, ChangePasswordView, TwoFactorLoginView, LoginView42, LoginCallbackView, LogoutView, ProfileView, ManageProfileView, ListUsers, UserRetrieveAPIView, UserUpdateAPIView, ProfileAccountView, RegisterView, RefreshTokenView, UserProfileView

urlpatterns = [
    path('api/accounts/login/', LoginView.as_view(), name='login_page'),
    path('login42/', LoginView42.as_view(), name='42login'),
    path('accounts/42/login/callback', LoginCallbackView.as_view(), name='login_callback'),
    path('api/refresh-token/', RefreshTokenView.as_view(), name='refresh_token'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/manage_profile/', ManageProfileView.as_view(), name='manage_profile'),
    path('api/user/', ListUsers.as_view(), name='user-list'),
    path('api/users/<int:id>/', UserRetrieveAPIView.as_view(), name='user-detail'),
    path('api/update_user/<int:id>/', UserUpdateAPIView.as_view(), name='update_user'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/accounts/logout/', LogoutView.as_view(), name='logout'),
    path('api/2fa/', include(tf_urls, namespace='two_factor')),  # Include 2FA routes for API with namespace
    path('api/accounts/profile/', ProfileAccountView.as_view(), name='profile_account'),    
    path('api/accounts/register/', RegisterView.as_view(), name='register_page'),
    path('api/two_factor/', TwoFactorLoginView.as_view(), name='two_factor_login'),  # Include 2FA login view
    path('api/user_profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/change_password/', ChangePasswordView.as_view(), name='edit_pass'),
    path('api/users/', FriendsView.as_view(), name='users'),
    path('api/users/', UsersView.as_view(), name='users'),
    path('api/friends/send_friend_request/<int:id>/', SendFriendRequestView.as_view(), name='send_friend_request'),
    path('api/friends/friendship_status/<int:id>/', FriendshipStatusView.as_view(), name='friendship_status'),
    path('api/friends/friend_requests/', FriendRequestsView.as_view(), name='friend_requests'),
    path('api/friends/block_user/<int:id>/', BlockUserView.as_view(), name='block_user'),
    path('api/friends/unblock_user/<int:id>/', UnblockUserView.as_view(), name='unblock_user'),
]
