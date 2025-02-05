from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Courrier
from .serializers import CourrierListSerializer, CourrierDetailSerializer, CourrierEditSerializer


class CourrierViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les opérations CRUD sur les courriers
    """
    queryset = Courrier.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Retourne le serializer approprié selon l'action
        """
        if self.action == 'list':
            return CourrierListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CourrierEditSerializer
        return CourrierDetailSerializer
    
    def perform_create(self, serializer):
        """
        Ajoute l'utilisateur courant lors de la création
        """
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        """
        Personnalisation du queryset avec filtres
        """
        queryset = Courrier.objects.all()
        
        # Filtres par paramètres d'URL
        doc_type = self.request.query_params.get('doc_type', None)
        client = self.request.query_params.get('client', None)
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        
        if doc_type:
            queryset = queryset.filter(doc_type=doc_type)
        if client:
            queryset = queryset.filter(client_id=client)
        if date_debut:
            queryset = queryset.filter(date_creation__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date_creation__lte=date_fin)
            
        return queryset.order_by('-date_creation')