from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models import Q, Avg, Count
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import User, Skill, SwapRequest, Feedback, SystemMessage
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    PublicUserSerializer, SkillSerializer, SkillCreateSerializer,
    SwapRequestSerializer, SwapRequestCreateSerializer, FeedbackSerializer,
    FeedbackCreateSerializer, SystemMessageSerializer, PasswordResetRequestSerializer,
    PasswordResetSerializer, AdminUserSerializer, BanUserSerializer
)
from .decorators import jwt_required, admin_required, handle_exceptions, paginate_response


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
@handle_exceptions
def register_user(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return JsonResponse({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@handle_exceptions
def login_user(request):
    """Login user and return JWT tokens"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return JsonResponse({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_200_OK)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@handle_exceptions
def request_password_reset(request):
    """Request password reset email"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        # In a real implementation, you would send an email here
        return JsonResponse({
            'message': 'Password reset email sent'
        }, status=status.HTTP_200_OK)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@handle_exceptions
def reset_password(request):
    """Reset password using token"""
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        # In a real implementation, you would validate the token and reset password
        return JsonResponse({
            'message': 'Password has been reset'
        }, status=status.HTTP_200_OK)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


# User Views
@api_view(['GET'])
@jwt_required
@handle_exceptions
@paginate_response
def get_public_user_list(request):
    """Get list of public users with filtering"""
    users = User.objects.filter(is_public=True, is_active=True, is_banned=False)
    
    # Apply filters
    search_skill = request.GET.get('search_skill')
    if search_skill:
        users = users.filter(skills__name__icontains=search_skill, skills__type='Offered')
    
    availability = request.GET.getlist('availability')
    if availability:
        users = users.filter(availability__overlap=availability)
    
    timeslot = request.GET.getlist('timeslot')
    if timeslot:
        users = users.filter(timeslot__overlap=timeslot)
    
    verified_only = request.GET.get('verified_only', 'false').lower() == 'true'
    if verified_only:
        users = users.filter(skills__is_verified=True, skills__type='Offered')
    
    # Remove duplicates and serialize
    users = users.distinct()
    serializer = PublicUserSerializer(users, many=True)
    return serializer.data


@api_view(['GET'])
@jwt_required
@handle_exceptions
@paginate_response
def search_users(request):
    """Search users by skill name"""
    q = request.GET.get('q', '')
    if not q:
        return JsonResponse({'error': 'Search query required'}, status=status.HTTP_400_BAD_REQUEST)
    
    users = User.objects.filter(
        is_public=True, 
        is_active=True, 
        is_banned=False,
        skills__name__icontains=q,
        skills__type='Offered'
    ).distinct()
    
    # Apply additional filters
    availability = request.GET.getlist('availability')
    if availability:
        users = users.filter(availability__overlap=availability)
    
    timeslot = request.GET.getlist('timeslot')
    if timeslot:
        users = users.filter(timeslot__overlap=timeslot)
    
    verified_only = request.GET.get('verified_only', 'false').lower() == 'true'
    if verified_only:
        users = users.filter(skills__is_verified=True)
    
    serializer = PublicUserSerializer(users, many=True)
    return serializer.data


@api_view(['GET'])
@jwt_required
@handle_exceptions
def get_my_profile(request):
    """Get authenticated user's profile"""
    serializer = UserProfileSerializer(request.user)
    return JsonResponse(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@jwt_required
@handle_exceptions
def update_my_profile(request):
    """Update authenticated user's profile"""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@jwt_required
@handle_exceptions
def get_user_profile_by_id(request, user_id):
    """Get user profile by ID"""
    try:
        user = User.objects.get(id=user_id)
        
        # Check if user is public or if requesting user is the same user
        if not user.is_public and user != request.user:
            return JsonResponse({'error': 'Profile not accessible'}, status=status.HTTP_403_FORBIDDEN)
        
        if user == request.user:
            serializer = UserProfileSerializer(user)
        else:
            serializer = PublicUserSerializer(user)
        
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# Skill Views
@api_view(['POST'])
@jwt_required
@handle_exceptions
def add_skill(request):
    """Add a new skill for the authenticated user"""
    serializer = SkillCreateSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.save(user=request.user)
        return JsonResponse(SkillSerializer(skill).data, status=status.HTTP_201_CREATED)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@jwt_required
@handle_exceptions
def update_skill(request, skill_id):
    """Update a skill"""
    try:
        skill = Skill.objects.get(id=skill_id, user=request.user)
        serializer = SkillCreateSerializer(skill, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(SkillSerializer(skill).data, status=status.HTTP_200_OK)
        
        return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@jwt_required
@handle_exceptions
def delete_skill(request, skill_id):
    """Delete a skill"""
    try:
        skill = Skill.objects.get(id=skill_id, user=request.user)
        skill.delete()
        return JsonResponse({}, status=status.HTTP_204_NO_CONTENT)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@jwt_required
@handle_exceptions
def upload_skill_proof_file(request, skill_id):
    """Upload proof file for a skill"""
    try:
        skill = Skill.objects.get(id=skill_id, user=request.user)
        
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'File required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # In a real implementation, you would upload the file to storage
        # and return the URL
        file_url = f"/media/skills/{skill_id}/{request.FILES['file'].name}"
        
        return JsonResponse({'file_url': file_url}, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@jwt_required
@handle_exceptions
def mark_skill_verified(request, skill_id):
    """Mark a skill as verified by peer"""
    try:
        skill = Skill.objects.get(id=skill_id)
        skill.verification_count += 1
        skill.save()
        return JsonResponse(SkillSerializer(skill).data, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)


# Swap Request Views
@api_view(['POST'])
@jwt_required
@handle_exceptions
def create_swap_request(request):
    """Create a new swap request"""
    serializer = SwapRequestCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        # Create the swap request
        swap_request = SwapRequest.objects.create(
            sender=request.user,
            receiver_id=serializer.validated_data['receiver_id'],
            offered_skill_id=serializer.validated_data['offered_skill_id'],
            requested_skill_id=serializer.validated_data['requested_skill_id'],
            message=serializer.validated_data.get('message', '')
        )
        
        return JsonResponse(SwapRequestSerializer(swap_request).data, status=status.HTTP_201_CREATED)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@jwt_required
@handle_exceptions
@paginate_response
def get_sent_swap_requests(request):
    """Get swap requests sent by the authenticated user"""
    swap_requests = SwapRequest.objects.filter(sender=request.user)
    
    status_filter = request.GET.get('status')
    if status_filter:
        swap_requests = swap_requests.filter(status=status_filter)
    
    serializer = SwapRequestSerializer(swap_requests, many=True)
    return serializer.data


@api_view(['GET'])
@jwt_required
@handle_exceptions
@paginate_response
def get_received_swap_requests(request):
    """Get swap requests received by the authenticated user"""
    swap_requests = SwapRequest.objects.filter(receiver=request.user)
    
    status_filter = request.GET.get('status')
    if status_filter:
        swap_requests = swap_requests.filter(status=status_filter)
    
    serializer = SwapRequestSerializer(swap_requests, many=True)
    return serializer.data


@api_view(['PUT'])
@jwt_required
@handle_exceptions
def accept_swap_request(request, swap_id):
    """Accept a swap request"""
    try:
        swap_request = SwapRequest.objects.get(id=swap_id, receiver=request.user)
        if swap_request.status != 'Pending':
            return JsonResponse({'error': 'Can only accept pending requests'}, status=status.HTTP_400_BAD_REQUEST)
        
        swap_request.status = 'Accepted'
        swap_request.save()
        
        return JsonResponse(SwapRequestSerializer(swap_request).data, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Swap request not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@jwt_required
@handle_exceptions
def reject_swap_request(request, swap_id):
    """Reject a swap request"""
    try:
        swap_request = SwapRequest.objects.get(id=swap_id, receiver=request.user)
        if swap_request.status != 'Pending':
            return JsonResponse({'error': 'Can only reject pending requests'}, status=status.HTTP_400_BAD_REQUEST)
        
        swap_request.status = 'Rejected'
        swap_request.save()
        
        return JsonResponse(SwapRequestSerializer(swap_request).data, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Swap request not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@jwt_required
@handle_exceptions
def cancel_swap_request(request, swap_id):
    """Cancel a swap request"""
    try:
        swap_request = SwapRequest.objects.get(id=swap_id, sender=request.user)
        if swap_request.status not in ['Pending', 'Accepted']:
            return JsonResponse({'error': 'Can only cancel pending or accepted requests'}, status=status.HTTP_400_BAD_REQUEST)
        
        if swap_request.status == 'Pending':
            swap_request.status = 'Withdrawn'
        else:
            swap_request.status = 'Cancelled'
        
        swap_request.save()
        
        return JsonResponse(SwapRequestSerializer(swap_request).data, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Swap request not found'}, status=status.HTTP_404_NOT_FOUND)


# Feedback Views
@api_view(['POST'])
@jwt_required
@handle_exceptions
def submit_swap_feedback(request):
    """Submit feedback for a completed swap"""
    serializer = FeedbackCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        swap_request = SwapRequest.objects.get(id=serializer.validated_data['swap_request_id'])
        
        # Determine who is being rated
        rated_user = swap_request.receiver if request.user == swap_request.sender else swap_request.sender
        
        feedback = Feedback.objects.create(
            swap_request=swap_request,
            rater=request.user,
            rated_user=rated_user,
            rating=serializer.validated_data['rating'],
            comment=serializer.validated_data.get('comment', ''),
            expectations_matched=serializer.validated_data['expectations_matched'],
            skill_verified_by_peer=serializer.validated_data.get('skill_verified_by_peer')
        )
        
        return JsonResponse(FeedbackSerializer(feedback).data, status=status.HTTP_201_CREATED)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


# Dashboard Views
@api_view(['GET'])
@jwt_required
@handle_exceptions
def get_my_dashboard_summary(request):
    """Get user's dashboard summary"""
    user = request.user
    
    # Calculate statistics
    completed_swaps = SwapRequest.objects.filter(
        Q(sender=user) | Q(receiver=user),
        status='Completed'
    ).count()
    
    pending_swaps = SwapRequest.objects.filter(
        Q(sender=user) | Q(receiver=user),
        status='Pending'
    ).count()
    
    average_rating = Feedback.objects.filter(rated_user=user).aggregate(
        avg_rating=Avg('rating')
    )['avg_rating'] or 0
    
    return JsonResponse({
        'credits': user.credits,
        'average_rating': round(average_rating, 2),
        'completed_swaps': completed_swaps,
        'pending_swaps': pending_swaps
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@jwt_required
@handle_exceptions
def get_my_completed_swaps(request):
    """Get user's completed swaps"""
    swap_requests = SwapRequest.objects.filter(
        Q(sender=request.user) | Q(receiver=request.user),
        status='Completed'
    )
    
    serializer = SwapRequestSerializer(swap_requests, many=True)
    return JsonResponse(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@jwt_required
@handle_exceptions
def get_my_verified_skills(request):
    """Get user's verified skills"""
    skills = Skill.objects.filter(user=request.user, is_verified=True)
    serializer = SkillSerializer(skills, many=True)
    return JsonResponse(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@jwt_required
@handle_exceptions
def get_my_skill_proofs(request):
    """Get user's skill proofs"""
    skills = Skill.objects.filter(
        user=request.user,
        proof_file_url__isnull=False
    ).exclude(proof_file_url='')
    
    proofs = []
    for skill in skills:
        proofs.append({
            'skill_id': skill.id,
            'skill_name': skill.name,
            'proof_file_url': skill.proof_file_url,
            'proof_file_type': skill.proof_file_type,
            'proof_description': skill.proof_description
        })
    
    return JsonResponse(proofs, status=status.HTTP_200_OK)


# System Messages Views
@api_view(['GET'])
@jwt_required
@handle_exceptions
def get_active_system_messages(request):
    """Get active system messages"""
    messages = SystemMessage.objects.filter(is_active=True)
    serializer = SystemMessageSerializer(messages, many=True)
    return JsonResponse(serializer.data, status=status.HTTP_200_OK)


# Admin Views
@api_view(['GET'])
@jwt_required
@admin_required
@handle_exceptions
@paginate_response
def get_all_users_admin(request):
    """Get all users (admin view)"""
    users = User.objects.all()
    
    search_email = request.GET.get('search_email')
    if search_email:
        users = users.filter(email__icontains=search_email)
    
    is_banned = request.GET.get('is_banned')
    if is_banned is not None:
        users = users.filter(is_banned=is_banned.lower() == 'true')
    
    serializer = AdminUserSerializer(users, many=True)
    return serializer.data


@api_view(['PUT'])
@jwt_required
@admin_required
@handle_exceptions
def ban_user(request, user_id):
    """Ban a user"""
    try:
        user = User.objects.get(id=user_id)
        serializer = BanUserSerializer(data=request.data)
        if serializer.is_valid():
            user.is_banned = True
            user.banned_reason = serializer.validated_data['banned_reason']
            user.save()
            
            return JsonResponse(AdminUserSerializer(user).data, status=status.HTTP_200_OK)
        
        return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@jwt_required
@admin_required
@handle_exceptions
def unban_user(request, user_id):
    """Unban a user"""
    try:
        user = User.objects.get(id=user_id)
        user.is_banned = False
        user.banned_reason = None
        user.save()
        
        return JsonResponse(AdminUserSerializer(user).data, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@jwt_required
@admin_required
@handle_exceptions
def get_platform_statistics(request):
    """Get platform statistics"""
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    total_swaps = SwapRequest.objects.count()
    completed_swaps = SwapRequest.objects.filter(status='Completed').count()
    
    # Skill popularity
    skill_popularity = Skill.objects.filter(type='Offered').values('name').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Feedback statistics
    total_feedback = Feedback.objects.count()
    avg_rating = Feedback.objects.aggregate(avg=Avg('rating'))['avg'] or 0
    
    return JsonResponse({
        'total_users': total_users,
        'active_users': active_users,
        'total_swaps': total_swaps,
        'completed_swaps': completed_swaps,
        'skill_popularity': list(skill_popularity),
        'total_feedback': total_feedback,
        'average_rating': round(avg_rating, 2)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@jwt_required
@admin_required
@handle_exceptions
@paginate_response
def get_all_swap_requests_admin(request):
    """Get all swap requests (admin view)"""
    swap_requests = SwapRequest.objects.all()
    
    status_filter = request.GET.get('status')
    if status_filter:
        swap_requests = swap_requests.filter(status=status_filter)
    
    sender_id = request.GET.get('sender_id')
    if sender_id:
        swap_requests = swap_requests.filter(sender_id=sender_id)
    
    receiver_id = request.GET.get('receiver_id')
    if receiver_id:
        swap_requests = swap_requests.filter(receiver_id=receiver_id)
    
    serializer = SwapRequestSerializer(swap_requests, many=True)
    return serializer.data


@api_view(['POST'])
@jwt_required
@admin_required
@handle_exceptions
def create_system_message(request):
    """Create a system message"""
    serializer = SystemMessageSerializer(data=request.data)
    if serializer.is_valid():
        message = serializer.save()
        return JsonResponse(SystemMessageSerializer(message).data, status=status.HTTP_201_CREATED)
    
    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@jwt_required
@admin_required
@handle_exceptions
def get_all_system_messages_admin(request):
    """Get all system messages (admin view)"""
    messages = SystemMessage.objects.all()
    serializer = SystemMessageSerializer(messages, many=True)
    return JsonResponse(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@jwt_required
@admin_required
@handle_exceptions
def update_system_message_admin(request, message_id):
    """Update a system message"""
    try:
        message = SystemMessage.objects.get(id=message_id)
        serializer = SystemMessageSerializer(message, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(SystemMessageSerializer(message).data, status=status.HTTP_200_OK)
        
        return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'System message not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@jwt_required
@admin_required
@handle_exceptions
def delete_system_message_admin(request, message_id):
    """Delete a system message"""
    try:
        message = SystemMessage.objects.get(id=message_id)
        message.delete()
        return JsonResponse({}, status=status.HTTP_204_NO_CONTENT)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'System message not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@jwt_required
@admin_required
@handle_exceptions
def delete_user_admin(request, user_id):
    """Delete a user (admin)"""
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return JsonResponse({}, status=status.HTTP_204_NO_CONTENT)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@jwt_required
@admin_required
@handle_exceptions
def delete_skill_admin(request, skill_id):
    """Delete a skill (admin)"""
    try:
        skill = Skill.objects.get(id=skill_id)
        skill.delete()
        return JsonResponse({}, status=status.HTTP_204_NO_CONTENT)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@jwt_required
@admin_required
@handle_exceptions
def update_skill_admin(request, skill_id):
    """Update a skill (admin)"""
    try:
        skill = Skill.objects.get(id=skill_id)
        skill.description = request.data.get('description', skill.description)
        skill.save()
        return JsonResponse(SkillSerializer(skill).data, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)
