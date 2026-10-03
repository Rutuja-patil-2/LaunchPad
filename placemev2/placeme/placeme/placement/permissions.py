# placement/permissions.py

from rest_framework.permissions import BasePermission

class IsTPO(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "tpo"
        )