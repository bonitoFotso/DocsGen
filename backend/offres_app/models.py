# models.py (extrait)
from django.db import models
from django.utils import timezone
from django.db.models import Max
from django.contrib.auth import get_user_model
from datetime import timedelta

from document.models import Affaire, Proforma


User = get_user_model()


class OffreProduit(models.Model):
    """Modèle de relation Many-to-Many entre Offre et Product avec attributs supplémentaires"""
    offre = models.ForeignKey('Offre', on_delete=models.CASCADE)
    produit = models.ForeignKey('document.Product', on_delete=models.CASCADE)
    #quantite = models.PositiveIntegerField(default=1)
    #remise = models.FloatField(default=0)  # En pourcentage (0-100)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        unique_together = ('offre', 'produit')
    
    @property
    def montant(self):
        """Calculer le montant total pour ce produit dans l'offre"""
        return self.prix_unitaire


class Offre(models.Model):
    """Modèle pour les offres commerciales"""
    STATUS_CHOICES = [
        ('BROUILLON', 'Brouillon'),
        ('ENVOYE', 'Envoyé'),
        ('GAGNE', 'Gagné'),
        ('PERDU', 'Perdu'),
    ]
    
    reference = models.CharField(max_length=100, blank=True, unique=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_validation = models.DateTimeField(blank=True, null=True)  # Date d'acceptation
    statut = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='BROUILLON'
    )
    montant = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fichier = models.FileField(upload_to='offres/', blank=True, null=True)
    # Relations
    client = models.ForeignKey('client.Client', on_delete=models.CASCADE, related_name="offres")
    contact = models.ForeignKey('client.Contact', on_delete=models.CASCADE, related_name="offres", blank=True, null=True)
    entity = models.ForeignKey('document.Entity', on_delete=models.CASCADE, related_name="offres")
    produits = models.ManyToManyField('document.Product', through='OffreProduit', related_name="offres")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="offres")
    produit = models.ForeignKey('document.Product', on_delete=models.SET_NULL, null=True, related_name="offres_unique")
    
    # Champs supplémentaires
    notes = models.TextField(blank=True)
    sequence_number = models.PositiveIntegerField(default=1)
    
    # Champ pour la gestion des relances
    relance = models.DateTimeField(
        blank=True, 
        null=True,
        help_text="Date de la prochaine relance si l'offre n'est pas encore gagnée"
    )
    
    DELAIS_RELANCE = {
        'ENVOYE': 7,  # Première relance après 7 jours
        'EN_NEGOCIATION': 5,  # Relance tous les 5 jours pendant la négociation
    }

    def set_relance(self):
        """
        Configure la prochaine date de relance si l'offre n'est pas gagnée/perdue
        """
        if self.statut in ['GAGNE', 'PERDU']:
            self.relance = None
            return

        if self.statut in self.DELAIS_RELANCE:
            # Si une relance existe déjà, on ajoute le délai à la date actuelle
            # Sinon on l'ajoute à la dernière modification
            base_date = timezone.now() if not self.relance else self.relance
            self.relance = base_date + timedelta(days=self.DELAIS_RELANCE[self.statut])

    @property
    def necessite_relance(self):
        """
        Indique si l'offre nécessite une relance maintenant
        """
        return (
            self.relance 
            and self.relance <= timezone.now() 
            and self.statut not in ['GAGNE', 'PERDU']
        )
    
    def save(self, *args, **kwargs):
        # Génération de la référence si elle n'existe pas
        
        if not self.reference:
            print("No reference")
            if not self.sequence_number:
                last_sequence = Offre.objects.filter(
                    entity=self.entity,
                    client=self.client,
                    date_creation__year=timezone.now().year,
                    date_creation__month=timezone.now().month
                ).aggregate(Max('sequence_number'))['sequence_number__max']
                self.sequence_number = (last_sequence or 0) + 1

           
            # Vérifier si l'objet a déjà un ID (évite l'erreur many-to-many)
            if self.pk is not None:
                print("ID exists")
                
            produit_code = self.produit.code
            total_offres_client = Offre.objects.filter(client=self.client).count() + 1
            date = self.date_creation or timezone.now()
            self.reference = f"{self.entity.code}/OFF/{self.client.c_num}/{str(date.year)[-2:]}{date.month:02d}{date.day:02d}/{produit_code}/{total_offres_client}/{self.sequence_number:04d}"

        # Gestion des statuts et relances
        if self.statut == 'GAGNE' and not self.date_validation:
            self.date_validation = timezone.now()
            self.relance = None

        elif self.statut == 'PERDU':
            self.relance = None

        else:
            # Met à jour la date de relance pour les autres statuts
            self.set_relance()

        super().save(*args, **kwargs)
        # Créer une proforma et une affaire si l'offre est gagnée
        if self.statut == 'GAGNE':
            
            # Créer une proforma
            proforma = Proforma.objects.get_or_create(
                offre=self,
                client=self.client,
                #contact=self.contact,
                entity=self.entity,
                created_by=self.user,
                #montant=self.montant
            )
            
            # Créer une affaire
            affaire = Affaire.objects.get_or_create(
                offre=self,
                #proforma=proforma,
                client=self.client,
                #contact=self.contact, 
                entity=self.entity,
                created_by=self.user,
                #montant=self.montant
            )
    
    def __str__(self):
        return f"{self.reference} - {self.client.nom} ({self.get_statut_display()})"