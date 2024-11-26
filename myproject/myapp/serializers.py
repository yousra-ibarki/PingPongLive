from rest_framework import serializers
from .models import User, Achievement, Friend, FriendRequest, BlockedUser
from game.serializers import GameResultSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth.hashers import make_password


User = get_user_model()  # This gets your custom user model

class TOTPSetupSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

class TOTPVerifySerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    session_id = serializers.CharField(required=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        return user

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user', 'friend', 'date']

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'from_user', 'to_user', 'date']

class BlockedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user', 'blocked_user', 'date']

class AchievementsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match")
        return data

    def validate_new_password(self, value):
        validate_password(value)  # Apply Django's password validators
        return value



class ProfileSerializer(serializers.ModelSerializer):
    achievements = AchievementsSerializer(many=True, read_only=True)
    match_history = GameResultSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'image', 'achievements', 'wins', 'losses', 'level', 'winrate', 'rank', 'total_goals_scored', 'match_history']


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        # Check if passwords match
        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })
        return data

    def validate_email(self, value):
        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_username(self, value):
        # Check if username already exists
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        # Remove password2 from the data
        validated_data.pop('password2', None)
        # Hash the password
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


# class RegistrationSerializer(serializers.ModelSerializer):
#     password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

#     class Meta:
#         model = Profile
#         fields = ['username', 'email', 'password', 'password2']
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }

#     def save(self):
#         user = Profile(
#             username=self.validated_data['username'],
#             email=self.validated_data['email']
#         )
#         password = self.validated_data['password']
#         password2 = self.validated_data['password2']

#         if password != password2:
#             raise serializers.ValidationError({'password': 'Passwords must match.'})

#         user.set_password(password)
#         user.save()
#         return user

# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
#     def validate(self, attrs):
#         data = super().validate(attrs)  # Get the token data
#         user = self.user  # Get the user
        
#         # Add user-specific information
#         data['id'] = user.id
#         data['username'] = user.username
#         data['email'] = user.email
#         data['first_name'] = user.first_name
#         data['last_name'] = user.last_name
#         data['profile_image'] = user.image.url  # If you want to include the profile image

#         return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Get the tokens from parent class
        data = super().validate(attrs)
        
        # Get the user
        user = self.user
        
        # Create refresh and access tokens
        refresh = self.get_token(user)
        access_token = str(refresh.access_token)
        
        # Remove the tokens from response data since we'll send them in cookies
        if 'access' in data:
            del data['access']
        if 'refresh' in data:
            del data['refresh']
            
        return {
            'user': user,
            'refresh': refresh,
            'access_token': access_token,
            **data
        }
