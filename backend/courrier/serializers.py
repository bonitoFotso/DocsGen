from rest_framework import serializers
from .models import Courrier

class CourrierListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des courriers avec des champs limités
    """
    created_by = serializers.StringRelatedField(read_only=True)
    client = serializers.StringRelatedField(read_only=True)
    entite = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Courrier
        fields = ['id', 'reference', 'doc_type', 'date_creation', 'client', 'entite', 'created_by']


class CourrierDetailSerializer(serializers.ModelSerializer):
    """
    Serializer pour les détails d'un courrier avec tous les champs
    """
    created_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Courrier
        fields = '__all__'
        read_only_fields = ['reference', 'created_by']


class CourrierEditSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'édition d'un courrier avec validation personnalisée
    """
    class Meta:
        model = Courrier
        fields = ['entite', 'doc_type', 'client', 'notes']
        
    def validate_doc_type(self, value):
        """
        Validation personnalisée pour le type de document
        """
        if value not in dict(Courrier.DOC_TYPES):
            raise serializers.ValidationError("Type de document invalide")
        return value