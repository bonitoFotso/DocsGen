from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend


from .models import Pays, Region, Ville, Client, Site, Contact
from rest_framework import viewsets
from rest_framework.decorators import action

from .serializers import (
    ClientWithContactsDetailSerializer, ClientWithContactsListSerializer, ContactDetailedSerializer, PaysListSerializer, PaysDetailSerializer, PaysEditSerializer,
    RegionListSerializer, RegionDetailSerializer, RegionEditSerializer,
    VilleListSerializer, VilleDetailSerializer, VilleEditSerializer,
    ClientListSerializer, ClientDetailSerializer, ClientEditSerializer,
    SiteListSerializer, SiteDetailSerializer, SiteEditSerializer,
    ContactListSerializer, ContactDetailSerializer, ContactEditSerializer
)

class PaysViewSet(viewsets.ModelViewSet):
    queryset = Pays.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'code_iso']
    ordering_fields = ['nom', 'code_iso']

    def get_serializer_class(self):
        if self.action == 'list':
            return PaysListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PaysEditSerializer
        return PaysDetailSerializer

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pays']
    search_fields = ['nom', 'pays__nom']
    ordering_fields = ['nom', 'pays__nom']

    def get_serializer_class(self):
        if self.action == 'list':
            return RegionListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RegionEditSerializer
        return RegionDetailSerializer

class VilleViewSet(viewsets.ModelViewSet):
    queryset = Ville.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['region', 'region__pays']
    search_fields = ['nom', 'region__nom', 'region__pays__nom']
    ordering_fields = ['nom', 'region__nom']

    def get_serializer_class(self):
        if self.action == 'list':
            return VilleListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return VilleEditSerializer
        return VilleDetailSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.filter(is_client=True)
    filterset_fields = ['ville', 'agreer', 'agreement_fournisseur', 'secteur_activite']
    search_fields = ['nom', 'c_num', 'email', 'telephone', 'matricule']
    ordering_fields = ['nom', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ClientListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ClientEditSerializer
        return ClientDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        
        if date_debut:
            queryset = queryset.filter(created_at__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(created_at__lte=date_fin)
            
        return queryset

class SiteViewSet(viewsets.ModelViewSet):
    queryset = Site.objects.all()
    filterset_fields = ['client', 'ville']
    search_fields = ['nom', 's_num', 'client__nom', 'localisation']
    ordering_fields = ['nom', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return SiteListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SiteEditSerializer
        return SiteDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        
        if date_debut:
            queryset = queryset.filter(created_at__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(created_at__lte=date_fin)
            
        return queryset

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    filterset_fields = ['client', 'service', 'relance', 'ville']
    search_fields = ['nom', 'prenom', 'email', 'telephone', 'mobile', 'client__nom']
    ordering_fields = ['nom', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ContactListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ContactEditSerializer
        return ContactDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        
        if date_debut:
            queryset = queryset.filter(created_at__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(created_at__lte=date_fin)
            
        return queryset
    
class ContactDetailedViewSet(viewsets.ReadOnlyModelViewSet):
   serializer_class = ContactDetailedSerializer
   filter_backends = [DjangoFilterBackend, filters.SearchFilter]
   
   filterset_fields = {
       'ville__region': ['exact'],
       'ville': ['exact'],
       'client__secteur_activite': ['exact'],
       'client__agreer': ['exact'],
       'relance': ['exact']
   }
   search_fields = ['nom', 'prenom', 'client__nom', 'service']

   def get_queryset(self):
       return Contact.objects.all()
   
class ClientWithContactsViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.prefetch_related('contacts').all()
    filterset_fields = ['ville', 'agreer', 'agreement_fournisseur', 'secteur_activite']
    search_fields = ['nom', 'c_num', 'email', 'telephone', 'matricule']
    ordering_fields = ['nom', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ClientWithContactsListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ClientEditSerializer
        return ClientWithContactsDetailSerializer

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        client = self.get_object()
        contacts = client.contacts.all()
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtres existants
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        
        if date_debut:
            queryset = queryset.filter(created_at__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(created_at__lte=date_fin)

        # Filtres sur les contacts
        contact_service = self.request.query_params.get('contact_service')
        contact_poste = self.request.query_params.get('contact_poste')

        if contact_service:
            queryset = queryset.filter(contacts__service__icontains=contact_service)
        if contact_poste:
            queryset = queryset.filter(contacts__poste__icontains=contact_poste)

        return queryset.distinct()