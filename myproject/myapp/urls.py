from django.urls import path, include
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from two_factor.urls import urlpatterns as tf_urls
from .views import RefreshTokenView, TOTPVerifyView, UserUpdateAPIView, UserProfileView, ChangePasswordView, LoginView42, LoginCallbackView, LogoutView, RegisterView, RefreshTokenView, CustomLoginView,  TOTPSetupView, TOTPDisableView, TOTStatusView
# from . import views

urlpatterns = [
    # path('api/accounts/login/', LoginView.as_view(), name='login_page'),
    path('login42/', LoginView42.as_view(), name='42login'),
    path('accounts/42/login/callback', LoginCallbackView.as_view(), name='login_callback'),
    # path('api/refresh-token/', RefreshTokenView.as_view(), name='refresh_token'),
    # path('api/profile/', ProfileView.as_view(), name='profile'),
    # path('api/manage_profile/', ManageProfileView.as_view(), name='manage_profile'),
    # path('api/user/', ListUsers.as_view(), name='user-list'),
    # path('api/user/<int:id>/', UserRetrieveAPIView.as_view(), name='user-detail'),
    path('api/update_user/<int:id>/', UserUpdateAPIView.as_view(), name='update_user'),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/accounts/logout/', LogoutView.as_view(), name='logout'),
    # path('api/accounts/profile/', ProfileAccountView.as_view(), name='profile_account'),    
    path('api/accounts/register/', RegisterView.as_view(), name='register_page'),
    path('api/user_profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/change_password/', ChangePasswordView.as_view(), name='edit_pass'),
    path('api/2fa/setup/', TOTPSetupView.as_view(), name='2fa-setup'),
    path('api/2fa/disable/', TOTPDisableView.as_view(), name='2fa-disable'),
    path('api/2fa/status/', TOTStatusView.as_view(), name='2fa-status'),
    path('api/accounts/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/2fa/verify_otp/', TOTPVerifyView.as_view(), name='verify_otp'),
    path('api/accounts/refresh/', RefreshTokenView.as_view(), name='refresh_token'),
]
