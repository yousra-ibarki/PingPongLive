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
from django.core.validators import MinLengthValidator
from django.utils.html import escape

User = get_user_model()  # This gets your custom user model

class FirstNameUpdateSerializer(serializers.Serializer):
    new_name = serializers.CharField(
        required=True,
        min_length=4,
        max_length=8,
        validators=[MinLengthValidator(2)],
        error_messages={
            'required': 'New name is required.',
            'min_length': 'Name must be at least 4 characters long.',
            'max_length': 'Name cannot exceed 8 characters.',
            'blank': 'Name cannot be blank.'
        }
    )
    confirm_new_name = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Please confirm your new name.',
        }
    )

    def validate_first_name(self, value):
        """
        Validate the first name:
        - Remove extra whitespace
        - Check for valid characters
        - Escape HTML characters
        """
        # Remove leading/trailing whitespace and normalize internal spaces
        value = ' '.join(value.split())
        
        # Check if the name contains only letters, spaces, hyphens, and apostrophes
        if not all(char.isalpha() or char in " -'" for char in value):
            raise serializers.ValidationError(
                "First name can only contain letters, spaces, hyphens, and apostrophes."
            )

        # Escape HTML characters to prevent XSS
        return escape(value)

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
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")  # Format the datetime field

    class Meta:
        model = Achievement
        fields = '__all__'



class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        """
        Validate new password strength
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
        user = self.context['request'].user  # Get the user from context
        new_password = data['new_password']

        # Check if new passwords match
        if new_password != data['new_password2']:
            raise serializers.ValidationError({
                "new_password2": "New passwords do not match."
            })

        # Check if new password is the same as the old password
        if user.check_password(new_password):
            raise serializers.ValidationError({
                "new_password": "New password cannot be the same as the current password."
            })

        # Validate username is not in password
        if user.username.lower() in new_password.lower():
            raise serializers.ValidationError({
                "new_password": "Password cannot contain your username."
            })

        # Validate email is not in password
        email_local_part = user.email.split('@')[0].lower()
        if email_local_part in new_password.lower():
            raise serializers.ValidationError({
                "new_password": "Password cannot contain your email address."
            })

        return data

    def update(self, instance, validated_data):
        # Check old password
        if not instance.check_password(validated_data['old_password']):
            raise serializers.ValidationError({
                "old_password": "Old password is not correct."
            })

        # Set new password
        instance.password = make_password(validated_data['new_password'])
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    achievements = AchievementsSerializer(many=True, read_only=True)
    match_history = GameResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'image', 'achievements', 'is_online', 'rank', 'level', 'wins', 'losses', 'winrate', 'total_goals_scored', 'is_2fa_enabled', 'match_history']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        return user

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

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
        try:
            # Remove password2 from the data
            validated_data.pop('password2', None)
            
            # Hash the password
            validated_data['password'] = make_password(validated_data['password'])
            
            # Create user
            user = User.objects.create(**validated_data)
            
            return user
        except Exception as e:
            raise serializers.ValidationError("Failed to create user")

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
