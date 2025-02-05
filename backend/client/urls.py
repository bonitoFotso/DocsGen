from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    ContactDetailedViewSet, PaysViewSet, RegionViewSet, VilleViewSet,
    ClientViewSet, SiteViewSet, ContactViewSet
)

router = DefaultRouter()
router.register(r'pays', PaysViewSet)
router.register(r'regions', RegionViewSet)
router.register(r'villes', VilleViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'sites', SiteViewSet)
router.register(r'contacts', ContactViewSet)
router.register('contacts-detailles', ContactDetailedViewSet, basename='contacts-detailles')

urlpatterns = [
    path('', include(router.urls)),
]