from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from two_factor.urls import urlpatterns as tf_urls
from myapp.views import TOTPVerifyView,TOTPSetupView, TOTPDisableView, TOTStatusView, CustomLoginView, AchievementsView, ChangePasswordView, UsersView, UnblockUserView, BlockUserView, FriendRequestsView, FirstNameUpdateView, \
                    UserProfileView1, DeleteAccountView, DeleteNotificationsView, HealthView, UpdateUserLastActiveView, BlockedUsersView, BlockedByUsersView, MarkAllAsReadView, NotificationListView, RegisterStepOneView, RegisterCompleteView,\
                    BlockCheckView, UnreadNotificationView, NotificationView, UploadImageView, FriendshipStatusView, RemoveFriendshipView, FriendsView, LoginView42, LoginCallbackView, LogoutView, ListUsers, UserRetrieveAPIView, RefreshTokenView, UserProfileView, EmailChangeView, ProfilePictureUpdateView,\
                    UserAchievementsView, UserImageView
    

urlpatterns = [
    path('login42/', LoginView42.as_view(), name='42login'),
    path('api/accounts/42/login/callback', LoginCallbackView.as_view(), name='login_callback'),
    path('api/users_list/', ListUsers.as_view(), name='user-list'),
    path('api/users/<int:id>/', UserRetrieveAPIView.as_view(), name='user-detail'),
    path('api/accounts/logout/', LogoutView.as_view(), name='logout'),
    path('api/accounts/register/stepone/', RegisterStepOneView.as_view(), name='register_page'),
    path('api/accounts/register/steptwo/', RegisterCompleteView.as_view(), name='register_page'),
    path('api/user_profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/user/profile/', UserProfileView1.as_view(), name='profile_user'),
    path('api/achievements/', AchievementsView.as_view(), name='achievements'),
    path('api/change_password/', ChangePasswordView.as_view(), name='edit_pass'),
    path('api/friends/', FriendsView.as_view(), name='users'),
    path('api/users/', UsersView.as_view(), name='users'),
    path('api/friends/friendship_status/<int:id>/', FriendshipStatusView.as_view(), name='friendship_status'),
    path('api/friends/friend_requests/', FriendRequestsView.as_view(), name='friend_requests'),
    path('api/friends/block_user/<int:id>/', BlockUserView.as_view(), name='block_user'),
    path('api/friends/unblock_user/<int:id>/', UnblockUserView.as_view(), name='unblock_user'),
    path('api/friends/blocked_users/', BlockedUsersView.as_view(), name='blocked_users'),
    path('api/friends/blocked_by_users/', BlockedByUsersView.as_view(), name='blocked_by_users'),
    path('api/friends/remove_friendship/<int:id>/', RemoveFriendshipView.as_view(), name='remove_friendship'),
    path('api/notifications/<int:notification_id>/mark-read/', NotificationView.as_view(), name='mark_read'),
    path('api/notifications/unread/', UnreadNotificationView.as_view(), name='unread_notifications'),
    path('api/notifications/delete/', DeleteNotificationsView.as_view(), name='delete_notifications'),
    path('api/notifications/mark-all-read/', MarkAllAsReadView.as_view(), name='mark_all_read'),
    path('api/notifications/', NotificationListView.as_view(), name='notifications'),
    path('api/2fa/setup/', TOTPSetupView.as_view(), name='2fa-setup'),
    path('api/2fa/disable/', TOTPDisableView.as_view(), name='2fa-disable'),
    path('api/2fa/status/', TOTStatusView.as_view(), name='2fa-status'),
    path('api/accounts/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/2fa/verify_otp/', TOTPVerifyView.as_view(), name='verify_otp'),
    path('api/accounts/refresh/', RefreshTokenView.as_view(), name='refresh_token'),
    path('api/upload-image/', UploadImageView.as_view(), name='upload-image'),
    path('api/update_user_last_active/', UpdateUserLastActiveView.as_view(), name='update_user_last_active'),
    path('api/health/', HealthView.as_view(), name='health'),
    path('api/delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    path('api/change-email/', EmailChangeView.as_view(), name='change_email'),
    path('api/update_profile_picture/', ProfilePictureUpdateView.as_view(), name='update_profile_picture'),
    path('api/friends/block_check/<int:id>/', BlockCheckView.as_view(), name='ho_block_user'),
    path('api/users/<int:user_id>/', UserAchievementsView.as_view(), name='user-achievements'),
    path('api/update_first_name/', FirstNameUpdateView.as_view(), name='update_first_name'),
    path('api/user_image/<str:username>/', UserImageView.as_view(), name='notifications'),
]
