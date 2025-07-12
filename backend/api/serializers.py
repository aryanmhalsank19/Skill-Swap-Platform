from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from .models import User, Skill, SwapRequest, Feedback, SystemMessage, Session


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'name', 'location', 
            'profile_photo_url', 'is_public', 'availability', 'timeslot',
            'linkedin', 'instagram', 'youtube', 'facebook', 'x', 'github', 'personal_portfolio'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True}
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                if user.is_banned:
                    raise serializers.ValidationError("User account is banned.")
                data['user'] = user
                return data
            else:
                raise serializers.ValidationError("Invalid email or password.")
        else:
            raise serializers.ValidationError("Must include email and password.")


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'location', 'profile_photo_url', 'is_public',
            'availability', 'timeslot', 'linkedin', 'instagram', 'youtube', 
            'facebook', 'x', 'github', 'personal_portfolio', 'credits', 
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'email', 'credits', 'date_joined', 'last_login']


class PublicUserSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'location', 'profile_photo_url', 'availability', 
            'timeslot', 'linkedin', 'instagram', 'youtube', 'facebook', 'x', 
            'github', 'personal_portfolio', 'skills', 'average_rating'
        ]
    
    def get_skills(self, obj):
        skills = Skill.objects.filter(user=obj, type='Offered', is_verified=True)
        return SkillSerializer(skills, many=True).data
    
    def get_average_rating(self, obj):
        feedbacks = Feedback.objects.filter(rated_user=obj)
        if feedbacks.exists():
            return sum(f.rating for f in feedbacks) / feedbacks.count()
        return 0


class SkillSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Skill
        fields = [
            'id', 'user', 'name', 'type', 'description', 'is_verified',
            'verification_count', 'proof_file_url', 'proof_file_type',
            'proof_description', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'verification_count', 'created_at']


class SkillCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = [
            'name', 'type', 'description', 'is_verified', 'proof_file_url',
            'proof_file_type', 'proof_description'
        ]
    
    def validate_type(self, value):
        if value not in ['Offered', 'Wanted']:
            raise serializers.ValidationError("Type must be either 'Offered' or 'Wanted'.")
        return value
    
    def validate_proof_file_type(self, value):
        if value and value not in ['Link', 'Image']:
            raise serializers.ValidationError("Proof file type must be either 'Link' or 'Image'.")
        return value


class SwapRequestSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    receiver = UserProfileSerializer(read_only=True)
    offered_skill = SkillSerializer(read_only=True)
    requested_skill = SkillSerializer(read_only=True)
    
    class Meta:
        model = SwapRequest
        fields = [
            'id', 'sender', 'receiver', 'offered_skill', 'requested_skill',
            'message', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sender', 'status', 'created_at', 'updated_at']


class SwapRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SwapRequest
        fields = ['receiver_id', 'offered_skill_id', 'requested_skill_id', 'message']
    
    def validate(self, data):
        user = self.context['request'].user
        
        # Check if receiver exists
        try:
            receiver = User.objects.get(id=data['receiver_id'])
            if receiver == user:
                raise serializers.ValidationError("Cannot send swap request to yourself.")
        except User.DoesNotExist:
            raise serializers.ValidationError("Receiver not found.")
        
        # Check if offered skill belongs to sender
        try:
            offered_skill = Skill.objects.get(id=data['offered_skill_id'], user=user)
            if offered_skill.type != 'Offered':
                raise serializers.ValidationError("Offered skill must be of type 'Offered'.")
        except Skill.DoesNotExist:
            raise serializers.ValidationError("Offered skill not found or doesn't belong to you.")
        
        # Check if requested skill belongs to receiver
        try:
            requested_skill = Skill.objects.get(id=data['requested_skill_id'], user=receiver)
            if requested_skill.type != 'Offered':
                raise serializers.ValidationError("Requested skill must be of type 'Offered'.")
        except Skill.DoesNotExist:
            raise serializers.ValidationError("Requested skill not found or doesn't belong to receiver.")
        
        return data


class FeedbackSerializer(serializers.ModelSerializer):
    rater = UserProfileSerializer(read_only=True)
    rated_user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'swap_request', 'rater', 'rated_user', 'rating', 'comment',
            'expectations_matched', 'skill_verified_by_peer', 'created_at'
        ]
        read_only_fields = ['id', 'rater', 'rated_user', 'created_at']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['swap_request_id', 'rating', 'comment', 'expectations_matched', 'skill_verified_by_peer']
    
    def validate(self, data):
        user = self.context['request'].user
        
        # Check if swap request exists and user is involved
        try:
            swap_request = SwapRequest.objects.get(id=data['swap_request_id'])
            if swap_request.sender != user and swap_request.receiver != user:
                raise serializers.ValidationError("You can only provide feedback for swaps you're involved in.")
            if swap_request.status != 'Completed':
                raise serializers.ValidationError("Can only provide feedback for completed swaps.")
        except SwapRequest.DoesNotExist:
            raise serializers.ValidationError("Swap request not found.")
        
        return data


class SystemMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemMessage
        fields = ['id', 'title', 'content', 'created_at', 'is_active']
        read_only_fields = ['id', 'created_at']


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value


class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return data


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'location', 'is_public', 'is_active', 
            'is_banned', 'banned_reason', 'credits', 'date_joined', 'last_login'
        ]


class BanUserSerializer(serializers.Serializer):
    banned_reason = serializers.CharField(max_length=500) 