from functools import wraps
from django.http import JsonResponse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
import json

User = get_user_model()


def jwt_required(view_func):
    """Decorator to require JWT authentication"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return JsonResponse(
                {'error': 'Authorization header required'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Extract token from "Bearer <token>"
            token_type, token = auth_header.split(' ')
            if token_type.lower() != 'bearer':
                return JsonResponse(
                    {'error': 'Invalid token type'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Validate token
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            
            if not user.is_active:
                return JsonResponse(
                    {'error': 'User account is disabled'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if user.is_banned:
                return JsonResponse(
                    {'error': 'User account is banned'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            request.user = user
            return view_func(request, *args, **kwargs)
            
        except (ValueError, IndexError):
            return JsonResponse(
                {'error': 'Invalid authorization header format'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except (InvalidToken, TokenError):
            return JsonResponse(
                {'error': 'Invalid or expired token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except ObjectDoesNotExist:
            return JsonResponse(
                {'error': 'User not found'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    return wrapper


def admin_required(view_func):
    """Decorator to require admin permissions"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return JsonResponse(
                {'error': 'Authentication required'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not request.user.is_admin:
            return JsonResponse(
                {'error': 'Admin permissions required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def validate_json(view_func):
    """Decorator to validate JSON request body"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if request.content_type and 'application/json' in request.content_type:
                    # DRF already handles JSON parsing, so we just validate it's valid JSON
                    if request.body:
                        json.loads(request.body)
                else:
                    return JsonResponse(
                        {'error': 'Content-Type must be application/json'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except json.JSONDecodeError:
                return JsonResponse(
                    {'error': 'Invalid JSON format'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def handle_exceptions(view_func):
    """Decorator to handle common exceptions"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except ObjectDoesNotExist as e:
            return JsonResponse(
                {'error': 'Resource not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return JsonResponse(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return wrapper


def paginate_response(view_func):
    """Decorator to add pagination to responses"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        response = view_func(request, *args, **kwargs)
        
        # If response is already a JsonResponse, return it as is
        if isinstance(response, JsonResponse):
            return response
        
        # Add pagination if response is a list
        if isinstance(response, list):
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 10))
            
            start = (page - 1) * limit
            end = start + limit
            
            paginated_data = response[start:end]
            
            return JsonResponse({
                'results': paginated_data,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': len(response),
                    'has_next': end < len(response),
                    'has_previous': page > 1
                }
            })
        
        return response
    
    return wrapper 