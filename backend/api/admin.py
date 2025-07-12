from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Skill, SwapRequest, Feedback, SystemMessage, Session

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'name', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_admin', 'date_joined')
    search_fields = ('email', 'name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'location', 'profile_photo_url', 'is_public', 'availability', 'timeslot')}),
        ('Social Links', {'fields': ('linkedin', 'instagram', 'youtube', 'facebook', 'x', 'github', 'personal_portfolio')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_admin', 'is_banned', 'banned_reason', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2'),
        }),
    )

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'type', 'is_verified', 'created_at')
    list_filter = ('type', 'is_verified', 'created_at')
    search_fields = ('name', 'user__email', 'user__name')

@admin.register(SwapRequest)
class SwapRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'offered_skill', 'requested_skill', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('sender__email', 'receiver__email', 'offered_skill__name', 'requested_skill__name')

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('rater', 'rated_user', 'rating', 'expectations_matched', 'created_at')
    list_filter = ('rating', 'expectations_matched', 'created_at')
    search_fields = ('rater__email', 'rated_user__email')

@admin.register(SystemMessage)
class SystemMessageAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'content')

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'expires_at', 'created_at')
    list_filter = ('expires_at', 'created_at')
    search_fields = ('user__email',)
