from rest_framework import serializers
from .models import Categorie, Pays, Region, Ville, Client, Site, Contact

class PaysListSerializer(serializers.ModelSerializer):
    nombre_de_regions = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Pays
        fields = ['id', 'nom', 'code_iso', 'nombre_de_regions']

class PaysDetailSerializer(serializers.ModelSerializer):
    nombre_de_regions = serializers.IntegerField(read_only=True)
    regions = serializers.SerializerMethodField()
    
    class Meta:
        model = Pays
        fields = ['id', 'nom', 'code_iso', 'nombre_de_regions', 'regions']
    
    def get_regions(self, obj):
        return RegionListSerializer(obj.regions.all(), many=True).data

class PaysEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pays
        fields = ['nom', 'code_iso']

class RegionListSerializer(serializers.ModelSerializer):
    pays_nom = serializers.CharField(source='pays.nom', read_only=True)
    nombre_de_villes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Region
        fields = ['id', 'nom', 'pays_nom', 'nombre_de_villes']

class RegionDetailSerializer(serializers.ModelSerializer):
    pays_details = PaysListSerializer(source='pays', read_only=True)
    villes = serializers.SerializerMethodField()
    nombre_de_villes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Region
        fields = ['id', 'nom', 'pays', 'pays_details', 'nombre_de_villes', 'villes']
    
    def get_villes(self, obj):
        return VilleListSerializer(obj.villes.all(), many=True).data

class RegionEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['nom', 'pays']

class VilleListSerializer(serializers.ModelSerializer):
    region_nom = serializers.CharField(source='region.nom', read_only=True)
    pays_nom = serializers.CharField(source='region.pays.nom', read_only=True)
    
    class Meta:
        model = Ville
        fields = ['id', 'nom', 'region_nom', 'pays_nom']

class VilleDetailSerializer(serializers.ModelSerializer):
    region_details = RegionListSerializer(source='region', read_only=True)
    
    class Meta:
        model = Ville
        fields = ['id', 'nom', 'region', 'region_details']

class VilleEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ville
        fields = ['nom', 'region']

class ContactListSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    
    class Meta:
        model = Contact
        fields = ['id', 'nom', 'prenom', 'email', 'telephone', 'client_nom', 'poste']

class ContactDetailSerializer(serializers.ModelSerializer):
    client_details = serializers.SerializerMethodField()
    ville_details = VilleListSerializer(source='ville', read_only=True)
    
    class Meta:
        model = Contact
        fields = '__all__'
    
    def get_client_details(self, obj):
        if obj.client:
            return ClientListSerializer(obj.client).data
        return None

class ContactEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        exclude = ['created_at', 'updated_at']

class SiteListSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    ville_nom = serializers.CharField(source='ville.nom', read_only=True)
    
    class Meta:
        model = Site
        fields = ['id', 's_num', 'nom', 'client_nom', 'ville_nom', 'localisation']
        read_only_fields = ['s_num']


class SiteEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['nom', 'client', 'localisation', 'description', 'ville']

class ClientListSerializer(serializers.ModelSerializer):
    ville_nom = serializers.CharField(source='ville.nom', read_only=True)
    contacts_count = serializers.IntegerField(source='contacts.count', read_only=True)
    
    class Meta:
        model = Client
        fields = [
            'id', 'c_num', 'nom', 'email', 'telephone',
            'ville_nom', 'secteur_activite', 'agreer',
            'agreement_fournisseur', 'contacts_count'
        ]
        read_only_fields = ['c_num']

class SiteDetailSerializer(serializers.ModelSerializer):
    client_details = ClientListSerializer(source='client', read_only=True)
    ville_details = VilleListSerializer(source='ville', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    
    class Meta:
        model = Site
        fields = '__all__'
        read_only_fields = ['s_num', 'created_at', 'updated_at', 'created_by', 'updated_by']


class ClientDetailSerializer(serializers.ModelSerializer):
    ville_details = VilleListSerializer(source='ville', read_only=True)
    contacts = ContactListSerializer(many=True, read_only=True)
    sites = SiteListSerializer(many=True, read_only=True, source='site_set')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['c_num', 'created_at', 'updated_at', 'created_by', 'updated_by']

class ClientEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        exclude = ['c_num', 'created_at', 'updated_at', 'created_by', 'updated_by']
        
        
class ContactDetailedSerializer(serializers.ModelSerializer):
   ville_nom = serializers.CharField(source='ville.nom', default='N/A')
   region = serializers.CharField(source='ville.region.nom', default='N/A')
   entreprise = serializers.CharField(source='client.nom', default='N/A')
   secteur = serializers.CharField(source='client.secteur_activite', default='N/A')
   agrement = serializers.BooleanField(source='client.agreer', default=False)
   status = serializers.SerializerMethodField()
   categorie = serializers.CharField(source='client.categorie', default='N/A')

   def get_status(self, obj):
       return 'Actif' if obj.relance else 'Inactif'

   class Meta:
       model = Contact
       fields = [
           'id', 'region', 'ville_nom', 'entreprise', 'secteur','categorie',
           'prenom', 'nom', 'poste', 'service', 'role_achat',
           'telephone', 'email', 'status', 'agrement'
       ]

class CategoryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'nom']

class ContactSerializer(serializers.ModelSerializer):
    site = SiteListSerializer(read_only=True)
    class Meta:
        model = Contact
        fields = ['id', 'nom', 'prenom', 'email', 'telephone', 'poste', 'service', 
                 'role_achat', 'source', 'valide', 'date_envoi', 'relance','site']
class ClientWithContactsListSerializer(serializers.ModelSerializer):
    contacts_count = serializers.IntegerField(source='contacts.count', read_only=True)
    contacts = ContactSerializer(many=True, read_only=True)
    ville = VilleListSerializer(read_only=True)
    categorie = CategoryListSerializer(read_only=True)

    class Meta:
        model = Client
        fields = ['id', 'nom', 'c_num', 'email', 'telephone', 'matricule', 'categorie',
                 'ville', 'agreer', 'agreement_fournisseur', 'secteur_activite',
                 'contacts_count', 'contacts', 'entite']

class ClientWithContactsDetailSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True, read_only=True)
    contacts_count = serializers.IntegerField(source='contacts.count', read_only=True)

    class Meta:
        model = Client
        fields = '__all__'