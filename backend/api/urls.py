from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('auth/reset-password/', views.reset_password, name='reset_password'),
    
    # User endpoints
    path('users/public/', views.get_public_user_list, name='get_public_user_list'),
    path('users/public/search/', views.search_users, name='search_users'),
    path('users/me/', views.get_my_profile, name='get_my_profile'),
    path('users/me/dashboard-summary/', views.get_my_dashboard_summary, name='get_my_dashboard_summary'),
    path('users/me/verified-skills/', views.get_my_verified_skills, name='get_my_verified_skills'),
    path('users/me/skill-proofs/', views.get_my_skill_proofs, name='get_my_skill_proofs'),
    path('users/<str:user_id>/', views.get_user_profile_by_id, name='get_user_profile_by_id'),
    
    # Skill endpoints
    path('skills/', views.add_skill, name='add_skill'),
    path('skills/<str:skill_id>/', views.update_skill, name='update_skill'),
    path('skills/<str:skill_id>/delete/', views.delete_skill, name='delete_skill'),
    path('skills/<str:skill_id>/upload-proof/', views.upload_skill_proof_file, name='upload_skill_proof_file'),
    path('skills/<str:skill_id>/mark-verified/', views.mark_skill_verified, name='mark_skill_verified'),
    
    # Swap Request endpoints
    path('swap-requests/', views.create_swap_request, name='create_swap_request'),
    path('swap-requests/sent/', views.get_sent_swap_requests, name='get_sent_swap_requests'),
    path('swap-requests/received/', views.get_received_swap_requests, name='get_received_swap_requests'),
    path('swap-requests/completed/', views.get_my_completed_swaps, name='get_my_completed_swaps'),
    path('swap-requests/<str:swap_id>/accept/', views.accept_swap_request, name='accept_swap_request'),
    path('swap-requests/<str:swap_id>/reject/', views.reject_swap_request, name='reject_swap_request'),
    path('swap-requests/<str:swap_id>/cancel/', views.cancel_swap_request, name='cancel_swap_request'),
    
    # Feedback endpoints
    path('feedback/', views.submit_swap_feedback, name='submit_swap_feedback'),
    
    # System Messages endpoints
    path('system-messages/active/', views.get_active_system_messages, name='get_active_system_messages'),
    
    # Admin endpoints
    path('admin/users/', views.get_all_users_admin, name='get_all_users_admin'),
    path('admin/users/<str:user_id>/ban/', views.ban_user, name='ban_user'),
    path('admin/users/<str:user_id>/unban/', views.unban_user, name='unban_user'),
    path('admin/users/<str:user_id>/', views.delete_user_admin, name='delete_user_admin'),
    path('admin/stats/', views.get_platform_statistics, name='get_platform_statistics'),
    path('admin/swap-requests/', views.get_all_swap_requests_admin, name='get_all_swap_requests_admin'),
    path('admin/system-messages/', views.create_system_message, name='create_system_message'),
    path('admin/system-messages/<str:message_id>/', views.update_system_message_admin, name='update_system_message_admin'),
    path('admin/skills/<str:skill_id>/', views.update_skill_admin, name='update_skill_admin'),
] 