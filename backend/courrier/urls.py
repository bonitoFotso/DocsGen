# urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CourrierViewSet

router = DefaultRouter()
router.register(r'courriers', CourrierViewSet)

urlpatterns = [
    path('', include(router.urls)),
]