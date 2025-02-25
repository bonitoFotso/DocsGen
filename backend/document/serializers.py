from rest_framework import serializers
from .models import (
    Entity, Client, Site, Category, Product, Offre, Proforma, 
    Affaire, Facture, Rapport, Formation, Participant, AttestationFormation
)

# Entity Serializers
class EntityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = ['id', 'code', 'name']

class EntityDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = '__all__'

# Client Serializers
class ClientListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'nom', 'email']

class ClientDetailSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Client
        fields = '__all__'

# Site Serializers
class SiteListSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    clientId = serializers.IntegerField(source='client.id', read_only=True)
    
    class Meta:
        model = Site
        fields = ['id', 'nom', 'client_nom', 'localisation', 'clientId']

class SiteDetailSerializer(serializers.ModelSerializer):
    client = ClientListSerializer(read_only=True)
    class Meta:
        model = Site
        fields = '__all__'

class SiteEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = '__all__'

# Category Serializers
class CategoryListSerializer(serializers.ModelSerializer):
    entity_name = serializers.CharField(source='entity.name', read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'code', 'name', 'entity_name']

class CategoryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# Product Serializers
class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    categoryId = serializers.IntegerField(source='category.id', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'code', 'name', 'category_name', 'categoryId']

class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

# Offre Serializers
class OffreListSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    entity_code = serializers.CharField(source='entity.code', read_only=True)
    
    class Meta:
        model = Offre
        fields = ['id', 'reference', 'client_nom', 'entity_code', 'statut', 'date_creation']

class OffreDetailSerializer(serializers.ModelSerializer):
    entity = EntityDetailSerializer(read_only=True)
    client = ClientDetailSerializer(read_only=True)
    # sites = SiteListSerializer(many=True, read_only=True)
    produits = ProductListSerializer(many=True, read_only=True)
    produit = EntityDetailSerializer(read_only=True)
    class Meta:
        model = Offre
        fields = '__all__'

class OffreEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offre
        fields = ['client', 'entity', 'statut','produit', 'produits','doc_type']

# Proforma Serializers
class ProformaListSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    offre_reference = serializers.CharField(source='offre.reference', read_only=True)
    
    class Meta:
        model = Proforma
        fields = ['id', 'reference', 'client_nom', 'offre_reference', 'statut', 'date_creation']

class ProformaDetailSerializer(serializers.ModelSerializer):
    offre = OffreListSerializer(read_only=True)
    entity = EntityDetailSerializer(read_only=True)
    client = ClientDetailSerializer(read_only=True)
    fichier = serializers.FileField(read_only=True)
    
    class Meta:
        model = Proforma
        fields = '__all__'

# Affaire Serializers
class AffaireListSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    offre_reference = serializers.CharField(source='offre.reference', read_only=True)
    
    class Meta:
        model = Affaire
        fields = ['id', 'reference', 'client_nom', 'offre_reference', 'statut', 'date_debut', 'date_fin_prevue']

class AffaireDetailSerializer(serializers.ModelSerializer):
    offre = OffreDetailSerializer(read_only=True)
    rapports = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    formations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    client = ClientDetailSerializer(read_only=True)
    
    class Meta:
        model = Affaire
        fields = '__all__'

# Facture Serializers
class FactureListSerializer(serializers.ModelSerializer):
    client = ClientListSerializer(read_only=True)
    affaire = AffaireListSerializer(read_only=True)
    
    class Meta:
        model = Facture
        fields = ['id', 'reference', 'client', 'affaire', 'statut', 'date_creation']

class FactureDetailSerializer(serializers.ModelSerializer):
    affaire = AffaireListSerializer(read_only=True)
    
    class Meta:
        model = Facture
        fields = '__all__'

# Rapport Serializers
class RapportListSerializer(serializers.ModelSerializer):
    affaire = AffaireListSerializer(read_only=True)
    site = SiteListSerializer(read_only=True)
    produit = ProductListSerializer(read_only=True)    
    class Meta:
        model = Rapport
        fields = ['id', 'reference', 'site', 'produit', 'statut', 'date_creation', 'affaire']

class RapportDetailSerializer(serializers.ModelSerializer):
    affaire = AffaireListSerializer(read_only=True)
    site = SiteDetailSerializer(read_only=True)
    produit = ProductDetailSerializer(read_only=True)
    
    class Meta:
        model = Rapport
        fields = '__all__'

# Formation Serializers
class FormationListSerializer(serializers.ModelSerializer):
    client = ClientListSerializer(read_only=True)
    affaire = AffaireListSerializer(read_only=True)
    
    class Meta:
        model = Formation
        fields = ['id', 'titre', 'client', 'affaire', 'date_debut', 'date_fin']

class FormationDetailSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    attestations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = Formation
        fields = '__all__'

# Participant Serializers
class ParticipantListSerializer(serializers.ModelSerializer):
    formation_titre = serializers.CharField(source='formation.titre', read_only=True)
    
    class Meta:
        model = Participant
        fields = ['id', 'nom', 'prenom', 'email', 'formation_titre']

class ParticipantDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'

# AttestationFormation Serializers
class AttestationFormationListSerializer(serializers.ModelSerializer):
    participant_nom = serializers.SerializerMethodField()
    formation_titre = serializers.CharField(source='formation.titre', read_only=True)
    
    class Meta:
        model = AttestationFormation
        fields = ['id', 'reference', 'participant_nom', 'formation_titre', 'date_creation']
    
    def get_participant_nom(self, obj):
        return f"{obj.participant.nom} {obj.participant.prenom}"

class AttestationFormationDetailSerializer(serializers.ModelSerializer):
    participant = ParticipantDetailSerializer(read_only=True)
    formation = FormationListSerializer(read_only=True)
    affaire = AffaireListSerializer(read_only=True)
    
    class Meta:
        model = AttestationFormation
        fields = '__all__'

# Entity Edit Serializer
class EntityEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = '__all__'

# Client Edit Serializer
class ClientEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

# Category Edit Serializer
class CategoryEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# Product Edit Serializer
class ProductEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

# Proforma Edit Serializer
class ProformaEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proforma
        fields = ['offre', 'entity', 'client', 'statut']

# Affaire Edit Serializer
class AffaireEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Affaire
        fields = ['offre', 'statut', 'date_debut', 'date_fin_prevue']

# Facture Edit Serializer
class FactureEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = ['affaire', 'client', 'statut', 'montant', 'date_echeance']

# Rapport Edit Serializer
class RapportEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rapport
        fields = ['affaire', 'site', 'produit', 'statut',]

# Formation Edit Serializer
class FormationEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = ['affaire', 'client', 'titre', 'description', 'date_debut', 'date_fin','rapport']

# Participant Edit Serializer
class ParticipantEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'

# AttestationFormation Edit Serializer
class AttestationFormationEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttestationFormation
        fields = ['participant', 'formation', 'affaire', 'contenu']
        
        
from rest_framework import serializers
from .models import Opportunite, Product, Client, Contact, Entity


class OpportuniteListSerializer(serializers.ModelSerializer):
    """
    Sérialiseur allégé pour la liste des opportunités
    """
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    produit_principal_nom = serializers.CharField(source='produit_principal.name', read_only=True)
    entity_code = serializers.CharField(source='entity.code', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Opportunite
        fields = [
            'id', 'reference', 'client', 'client_nom', 'produit_principal', 
            'produit_principal_nom', 'entity', 'entity_code', 'statut', 
            'statut_display', 'date_creation', 'date_modification', 'date_cloture',
            'montant_estime', 'probabilite', 'created_by', 'created_by_name',
            'relance', 'necessite_relance'
        ]
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.username}".strip() or obj.created_by.username
        return None


class OpportuniteDetailSerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet pour les détails d'une opportunité
    """
    client_details = serializers.SerializerMethodField()
    contact_details = serializers.SerializerMethodField()
    entity_details = serializers.SerializerMethodField()
    produit_principal_details = serializers.SerializerMethodField()
    produits_details = serializers.SerializerMethodField()
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    transitions_possibles = serializers.SerializerMethodField()
    
    class Meta:
        model = Opportunite
        fields = [
            'id', 'reference', 'client', 'client_details', 'contact', 'contact_details',
            'entity', 'entity_details', 'produit_principal', 'produit_principal_details',
            'produits', 'produits_details', 'statut', 'statut_display', 
            'date_creation', 'date_modification', 'date_cloture', 'montant_estime', 
            'probabilite', 'description', 'besoins_client', 'created_by', 
            'created_by_name', 'relance', 'necessite_relance', 'transitions_possibles'
        ]
        read_only_fields = ['reference', 'date_creation', 'date_modification', 'created_by', 'probabilite']
    
    def get_client_details(self, obj):
        return {
            'id': obj.client.id,
            'nom': obj.client.nom,
            'c_num': obj.client.c_num
        } if obj.client else None
    
    def get_contact_details(self, obj):
        return {
            'id': obj.contact.id,
            'nom': obj.contact.nom,
            'prenom': obj.contact.prenom,
            'email': obj.contact.email,
            'telephone': obj.contact.telephone
        } if obj.contact else None
    
    def get_entity_details(self, obj):
        return {
            'id': obj.entity.id,
            'code': obj.entity.code,
            'name': obj.entity.name
        } if obj.entity else None
    
    def get_produit_principal_details(self, obj):
        return {
            'id': obj.produit_principal.id,
            'code': obj.produit_principal.code,
            'name': obj.produit_principal.name,
            'category': {
                'id': obj.produit_principal.category.id,
                'code': obj.produit_principal.category.code,
                'name': obj.produit_principal.category.name
            }
        } if obj.produit_principal else None
    
    def get_produits_details(self, obj):
        return [
            {
                'id': produit.id,
                'code': produit.code,
                'name': produit.name,
                'category': {
                    'id': produit.category.id,
                    'code': produit.category.code,
                    'name': produit.category.name
                }
            } 
            for produit in obj.produits.all()
        ]
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.username}".strip() or obj.created_by.username
        return None
    
    def get_transitions_possibles(self, obj):
        """
        Retourne la liste des transitions possibles pour l'état actuel
        """
        transitions = []
        
        # Vérification des transitions possibles
        if hasattr(obj, 'can_qualifier') and obj.can_qualifier():
            transitions.append('qualifier')
        if hasattr(obj, 'can_proposer') and obj.can_proposer():
            transitions.append('proposer')
        if hasattr(obj, 'can_negocier') and obj.can_negocier():
            transitions.append('negocier')
        if hasattr(obj, 'can_gagner') and obj.can_gagner():
            transitions.append('gagner')
        if hasattr(obj, 'can_perdre') and obj.can_perdre():
            transitions.append('perdre')
            
        # Vérifier si on peut créer une offre
        if obj.statut in ['QUALIFICATION', 'PROPOSITION', 'NEGOCIATION', 'GAGNEE']:
            transitions.append('creer_offre')
            
        return transitions


class OpportuniteSerializer(serializers.ModelSerializer):
    """
    Sérialiseur de base pour les opérations CRUD
    """
    class Meta:
        model = Opportunite
        fields = [
            'id', 'reference', 'client', 'contact', 'entity', 'produit_principal',
            'produits', 'statut', 'date_creation', 'date_modification', 'date_cloture',
            'montant_estime', 'probabilite', 'description', 'besoins_client', 
            'created_by', 'relance'
        ]
        read_only_fields = ['reference', 'date_creation', 'date_modification', 'created_by', 'probabilite']