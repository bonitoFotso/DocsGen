from datetime import timedelta
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from django.utils.timezone import now

from .models import Opportunite
from .serializers import OpportuniteSerializer, OpportuniteListSerializer, OpportuniteDetailSerializer
from .permissions import OpportunitePermission


class OpportuniteViewSet(viewsets.ModelViewSet):
    """
    Viewset pour gérer les opportunités commerciales
    """
    queryset = Opportunite.objects.all().order_by('-date_creation')
    serializer_class = OpportuniteSerializer
    permission_classes = [IsAuthenticated, OpportunitePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['statut', 'client', 'entity', 'produit_principal', 'created_by']
    search_fields = ['reference', 'client__nom', 'description', 'besoins_client']
    ordering_fields = ['date_creation', 'date_modification', 'date_cloture', 'montant_estime', 'probabilite']

    def get_serializer_class(self):
        """
        Retourne le sérialiseur approprié en fonction de l'action.
        """
        if self.action == 'list':
            return OpportuniteListSerializer
        elif self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return OpportuniteDetailSerializer
        return self.serializer_class

    def perform_create(self, serializer):
        """
        Ajoute l'utilisateur actuel comme créateur lors de la création.
        """
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def qualifier(self, request, pk=None):
        """
        Transition: passe l'opportunité à l'état Qualification.
        """
        opportunite = self.get_object()
        try:
            opportunite.qualifier(user=request.user)
            opportunite.save()
            return Response({'status': 'opportunité qualifiée'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def proposer(self, request, pk=None):
        """
        Transition: passe l'opportunité à l'état Proposition.
        """
        opportunite = self.get_object()
        try:
            opportunite.proposer(user=request.user)
            opportunite.save()
            return Response({'status': 'proposition envoyée'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def negocier(self, request, pk=None):
        """
        Transition: passe l'opportunité à l'état Négociation.
        """
        opportunite = self.get_object()
        try:
            opportunite.negocier(user=request.user)
            opportunite.save()
            return Response({'status': 'négociation en cours'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def gagner(self, request, pk=None):
        """
        Transition: marque l'opportunité comme gagnée.
        """
        opportunite = self.get_object()
        try:
            opportunite.gagner(user=request.user)
            opportunite.save()
            return Response({'status': 'opportunité gagnée'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def perdre(self, request, pk=None):
        """
        Transition: marque l'opportunité comme perdue.
        """
        opportunite = self.get_object()
        raison = request.data.get('raison', None)
        try:
            opportunite.perdre(user=request.user, raison=raison)
            opportunite.save()
            return Response({'status': 'opportunité perdue'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def creer_offre(self, request, pk=None):
        """
        Crée une offre à partir de l'opportunité.
        """
        opportunite = self.get_object()
        try:
            offre = opportunite.creer_offre()
            return Response({
                'status': 'offre créée',
                'offre_id': offre.id,
                'offre_reference': offre.reference
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def a_relancer(self, request):
        """
        Renvoie les opportunités qui nécessitent une relance.
        """
        opportunites = Opportunite.objects.filter(
            relance__lte=now(),
            statut__in=['PROSPECT', 'QUALIFICATION', 'PROPOSITION', 'NEGOCIATION']
        ).order_by('relance')
        
        page = self.paginate_queryset(opportunites)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(opportunites, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """
        Renvoie des statistiques sur les opportunités.
        """
        # Période de filtrage (par défaut: 30 derniers jours)
        days = int(request.query_params.get('days', 30))
        start_date = now() - timedelta(days=days)
        
        # Filtre de base
        base_filter = Q(date_creation__gte=start_date)
        
        # Statistiques globales
        total_opportunites = Opportunite.objects.filter(base_filter).count()
        montant_total = Opportunite.objects.filter(base_filter).aggregate(total=Sum('montant_estime'))['total'] or 0
        
        # Par statut
        par_statut = Opportunite.objects.filter(base_filter).values('statut').annotate(
            count=Count('id'),
            montant=Sum('montant_estime')
        ).order_by('statut')
        
        # Taux de conversion
        opportunites_gagnees = Opportunite.objects.filter(
            base_filter,
            statut='GAGNEE'
        ).count()
        
        opportunites_terminees = Opportunite.objects.filter(
            base_filter,
            statut__in=['GAGNEE', 'PERDUE']
        ).count()
        
        taux_conversion = 0
        if opportunites_terminees > 0:
            taux_conversion = (opportunites_gagnees / opportunites_terminees) * 100
        
        return Response({
            'total_opportunites': total_opportunites,
            'montant_total': montant_total,
            'par_statut': par_statut,
            'taux_conversion': round(taux_conversion, 2),
            'periode_jours': days
        })