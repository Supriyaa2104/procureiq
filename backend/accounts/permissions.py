from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "ADMIN"
        )


class IsProcurementStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "PROCUREMENT_STAFF"
        )


class IsCashier(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "CASHIER"
        )


class IsProcurementOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ["ADMIN", "PROCUREMENT_STAFF"]
        )


class IsCashierOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ["ADMIN", "CASHIER", "OWNER"]
        )

class IsOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ["ADMIN", "OWNER"]
        )

class IsAuthenticatedReadOnly(BasePermission):
    """Any logged-in user can VIEW (GET); only specific roles can edit — checked separately per view."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)