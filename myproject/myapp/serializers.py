from rest_framework import serializers
from .models import User, Achievement
from game.serializers import GameResultSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Friendship, Block
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth.hashers import make_password
from .models import Notification
from django.core.exceptions import ValidationError
import re


User = get_user_model()  # This gets your custom user model

class EmailChangeSerializer(serializers.Serializer):
    old_email = serializers.EmailField(required=True)
    new_email = serializers.EmailField(required=True)
    confirm_email = serializers.EmailField(required=True)

    def validate(self, data):
        user = self.context['request'].user
        
        # Check if old email matches current user's email
        if data['old_email'] != user.email:
            raise ValidationError({'old_email': 'Current email is incorrect'})

        # Check if new emails match
        if data['new_email'] != data['confirm_email']:
            raise ValidationError({'confirm_email': 'New emails do not match'})

        # Check if new email is different from old email
        if data['new_email'] == data['old_email']:
            raise ValidationError({'new_email': 'New email must be different from current email'})

        # Check if new email is already in use
        if User.objects.filter(email=data['new_email']).exists():
            raise ValidationError({'new_email': 'This email is already in use'})

        return data

    def update(self, instance, validated_data):
        instance.email = validated_data['new_email']
        instance.save()
        return instance

class TOTPSetupSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

class TOTPVerifySerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    user_id = serializers.IntegerField(required=True)

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'first_name', 'last_name', 'image', 'is_online']  # Include the image field

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'image', 'is_online', 'rank', 'level', 'wins', 'losses', 'winrate', 'total_goals_scored', 'is_2fa_enabled', 'language']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        return user

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class BlockedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

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
        fields = ['first_name', 'last_name', 'email', 'username', 'image', 'achievements', 'wins', 'losses', 'level', 'winrate', 'rank', 'is_online', 'id', 'match_history', 'is_2fa_enabled', 'language', 'total_goals_scored']  # Include the image field

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = ProfileSerializer(read_only=True)
    to_user = ProfileSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']

class RegisterStepTwoSerializer(serializers.ModelSerializer):
    image = serializers.URLField(required=True)
    language = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['image', 'language']


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    # image = serializers.URLField(required=True)
    # language = serializers.CharField(required=True)

    FORBIDDEN_USERNAME_WORDS = {
        'admin', 'root', 'superuser', 'sys', 'system', 
        'mod', 'staff', 'owner', 'master', 'support',
        'help', 'info', 'administrator', 'sudo'
    }
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password2', 'first_name', 'language', 'image']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_password(self, value):
        """
        Validate password strength
        """
        # Check minimum length
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )

        # Check for at least one uppercase letter
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )

        # Check for at least one lowercase letter
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter."
            )

        # Check for at least one digit
        if not re.search(r'\d', value):
            raise serializers.ValidationError(
                "Password must contain at least one number."
            )

        # Check for at least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError(
                "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)."
            )

        # Check for common words
        common_words = ['admin', 'password', '123456', 'qwerty', 'letmein', 
                       'welcome', 'monkey', 'dragon', 'baseball', 'football', 
                       'master', 'test', 'user']
        
        value_lower = value.lower()
        for word in common_words:
            if word in value_lower:
                raise serializers.ValidationError(
                    f"Password cannot contain common words like '{word}'."
                )

        # Check for sequential characters
        if any(str(i) + str(i + 1) + str(i + 2) in value for i in range(8)):
            raise serializers.ValidationError(
                "Password cannot contain sequential numbers (e.g., '123', '456')."
            )

        if any(chr(i) + chr(i + 1) + chr(i + 2) in value.lower() for i in range(ord('a'), ord('x'))):
            raise serializers.ValidationError(
                "Password cannot contain sequential letters (e.g., 'abc', 'def')."
            )

        return value

    def validate(self, data):
        # Check if passwords match
        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })
        
        # Validate username is not in password
        if data['username'].lower() in data['password'].lower():
            raise serializers.ValidationError({
                "password": "Password cannot contain your username."
            })

        # Validate email is not in password
        email_parts = data['email'].split('@')[0].lower()
        if email_parts in data['password'].lower():
            raise serializers.ValidationError({
                "password": "Password cannot contain your email address."
            })

        return data

    def validate_email(self, value):
        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_username(self, value):
        # Convert to lowercase for validation
        username_lower = value.lower()

        # Check username length (3-7 characters)
        if len(value) < 3 or len(value) > 7:
            raise serializers.ValidationError(
                "Username must be between 3 and 7 characters long"
            )
        
        # Check if username already exists
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists"
            )
        
        # Check for valid characters (letters, numbers, underscores only)
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, and underscores"
            )

        # Check for forbidden words
        for forbidden_word in self.FORBIDDEN_USERNAME_WORDS:
            if forbidden_word in username_lower:
                raise serializers.ValidationError(
                    f"Username cannot contain the word '{forbidden_word}'"
                )

        # Check if username starts with a number
        if value[0].isdigit():
            raise serializers.ValidationError(
                "Username cannot start with a number"
            )

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

class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'message', 'created_at', 'is_read', 'sender']
        
    def get_sender(self, obj):
        if obj.sender:
            return obj.sender.username
        return None
    
class BlockSerializer(serializers.ModelSerializer):
    blocker = serializers.SerializerMethodField()
    blocked = serializers.SerializerMethodField()
    
    class Meta:
        model = Block
        fields = ['id', 'blocker', 'blocked', 'created_at']
    def get_blocker(self, obj):
        return {
            'id': obj.blocker.id,
            'username': obj.blocker.username,
        }

    def get_blocked(self, obj):
        return {
            'id': obj.blocked.id,
            'username': obj.blocked.username,
        }
