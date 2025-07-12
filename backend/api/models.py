import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError # For potential JSONField validation if needed


# Custom User Manager for handling user creation
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_admin', True) # Custom field for admin role

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


# User Model
class User(AbstractBaseUser, PermissionsMixin):
    # Choices for multi-select fields
    AVAILABILITY_CHOICES = [
        'Weekdays', 'Weekends', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]
    TIMESLOT_CHOICES = [
        'Morning', 'Afternoon', 'Evening', 'Night'
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255) # Stores password hash
    name = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    profile_photo_url = models.URLField(max_length=255, null=True, blank=True)
    is_public = models.BooleanField(default=True)

    # Multi-select Availability and Timeslot fields using JSONField
    # Stored as a list of strings, e.g., ['Weekdays', 'Saturday']
    availability = models.JSONField(null=True, blank=True, default=list)
    timeslot = models.JSONField(null=True, blank=True, default=list)

    # Optional social media/portfolio links
    linkedin = models.URLField(max_length=255, null=True, blank=True, validators=[URLValidator()])
    instagram = models.URLField(max_length=255, null=True, blank=True, validators=[URLValidator()])
    youtube = models.URLField(max_length=255, null=True, blank=True, validators=[URLValidator()])
    facebook = models.URLField(max_length=255, null=True, blank=True, validators=[URLValidator()])
    x = models.URLField(max_length=255, null=True, blank=True, verbose_name='X (Twitter)', validators=[URLValidator()])
    github = models.URLField(max_length=255, null=True, blank=True, validators=[URLValidator()])
    personal_portfolio = models.URLField(max_length=255, null=True, blank=True, validators=[URLValidator()])

    is_active = models.BooleanField(default=True) # For deactivating accounts
    is_banned = models.BooleanField(default=False)
    banned_reason = models.TextField(null=True, blank=True)
    credits = models.IntegerField(default=0)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    # Django specific fields for admin panel and permissions
    is_staff = models.BooleanField(default=False) # Can access Django admin
    is_admin = models.BooleanField(default=False) # Custom field to distinguish admins

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name'] # Adjust as per your requirements

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.name if self.name else self.email

    def get_short_name(self):
        return self.name if self.name else self.email


# Skill Model
class Skill(models.Model):
    SKILL_TYPE_CHOICES = [
        ('Offered', 'Offered'),
        ('Wanted', 'Wanted'),
    ]
    # Updated PROOF_FILE_TYPE_CHOICES
    PROOF_FILE_TYPE_CHOICES = [
        ('Link', 'Link'),
        ('Image', 'Image'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=SKILL_TYPE_CHOICES)
    description = models.TextField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verification_count = models.IntegerField(default=0)
    proof_file_url = models.URLField(max_length=255, null=True, blank=True)
    proof_file_type = models.CharField(
        max_length=10,
        choices=PROOF_FILE_TYPE_CHOICES,
        null=True,
        blank=True
    )
    proof_description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.type}) - {self.user.email}"


# SwapRequest Model
class SwapRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Withdrawn', 'Withdrawn'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_swap_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_swap_requests')
    offered_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='offered_in_swaps')
    requested_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='requested_in_swaps')
    message = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Swap from {self.sender.email} to {self.receiver.email} - Status: {self.status}"


# Feedback Model
class Feedback(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    swap_request = models.OneToOneField(SwapRequest, on_delete=models.CASCADE, related_name='feedback')
    rater = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_feedback')
    rated_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_feedback')
    rating = models.IntegerField()
    comment = models.TextField(null=True, blank=True)
    expectations_matched = models.BooleanField(default=False)
    skill_verified_by_peer = models.BooleanField(null=True, blank=True) # Nullable as it might not always be applicable/checked
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Feedback for {self.rated_user.email} from {self.rater.email} - Rating: {self.rating}"


# SystemMessage Model
class SystemMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


# Session Model (for JWT tokens, often handled by a library like DRF Simple JWT, but included for completeness of schema)
class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    access_token = models.TextField()
    refresh_token = models.TextField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Session for {self.user.email} (Expires: {self.expires_at})"