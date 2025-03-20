from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils.timezone import now
from django.db.models import Max
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from factures_app.models import Facture

class Affaire(models.Model):
    """
    Représente un projet contractualisé issu d'une offre acceptée par un client.
    Une affaire gère le cycle de vie complet du projet, incluant les rapports,
    les formations éventuelles et la facturation.
    """
    # Relation avec l'offre d'origine
    offre = models.OneToOneField(
        'offres_app.Offre',
        on_delete=models.CASCADE,
        related_name="affaire",
        help_text="Offre acceptée qui a généré cette affaire"
    )
    
    # Informations d'identification
    reference = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        help_text="Référence unique de l'affaire (générée automatiquement)"
    )
    sequence_number = models.PositiveIntegerField(
        default=0,
        editable=False,
        help_text="Numéro de séquence pour la génération de référence"
    )
    doc_type = models.CharField(
        max_length=3,
        default='AFF',
        editable=False,
        help_text="Type de document (AFF pour Affaire)"
    )
    
    # Dates et durée
    date_debut = models.DateTimeField(
        verbose_name="Date de début",
        help_text="Date de début de l'affaire",
        default=now
    )
    date_fin_prevue = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de fin prévue",
        help_text="Date de fin prévue pour l'affaire"
    )
    date_fin_reelle = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de fin réelle",
        help_text="Date de fin réelle de l'affaire (renseignée à la clôture)"
    )
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création",
        help_text="Date de création de l'enregistrement"
    )
    date_modification = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification",
        help_text="Date de dernière modification de l'enregistrement"
    )
    
    # Utilisateur responsable
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='affaires_creees',
        verbose_name="Créé par",
        help_text="Utilisateur ayant créé l'affaire"
    )
    responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='affaires_gerees',
        verbose_name="Responsable",
        help_text="Utilisateur responsable de l'affaire"
    )
    
    # Statut et suivi
    STATUT_CHOICES = [
        ('BROUILLON', 'Brouillon'),
        ('VALIDE', 'Validée'),
        ('EN_COURS', 'En cours'),
        ('EN_PAUSE', 'En pause'),
        ('TERMINEE', 'Terminée'),
        ('ANNULEE', 'Annulée'),
    ]
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='BROUILLON',
        verbose_name="Statut",
        help_text="État actuel de l'affaire"
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name="Notes",
        help_text="Notes internes concernant l'affaire"
    )
    
    # Champs pour le suivi financier
    montant_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0'),
        verbose_name="Montant total",
        help_text="Montant total de l'affaire (HT)"
    )
    montant_facture = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0'),
        verbose_name="Montant facturé",
        help_text="Montant total facturé (HT)"
    )
    montant_paye = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0'),
        verbose_name="Montant payé",
        help_text="Montant total payé (HT)"
    )
    
    class Meta:
        verbose_name = "Affaire"
        verbose_name_plural = "Affaires"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['statut']),
            models.Index(fields=['date_creation']),
        ]
    
    def __str__(self):
        return f"Affaire {self.reference} - {self.offre.client.nom}"
    
    def clean(self):
        """Validation des données avant sauvegarde"""
        if self.date_fin_prevue and self.date_fin_prevue < self.date_debut:
            raise ValidationError({
                'date_fin_prevue': "La date de fin prévue ne peut pas être antérieure à la date de début."
            })
        
        if self.date_fin_reelle and self.date_fin_reelle < self.date_debut:
            raise ValidationError({
                'date_fin_reelle': "La date de fin réelle ne peut pas être antérieure à la date de début."
            })
        
        if self.statut == 'TERMINEE' and not self.date_fin_reelle:
            raise ValidationError({
                'date_fin_reelle': "Une date de fin réelle est requise pour une affaire terminée."
            })
    
    def generate_reference(self):
        """Génère une référence unique pour l'affaire"""
        date = self.date_creation or now()
        
        # Format: AFF + année (2 chiffres) + mois + ID client + ID offre + séquence
        if not self.sequence_number:
            # Récupère le dernier numéro de séquence pour le mois en cours
            last_sequence = Affaire.objects.filter(
                doc_type='AFF',
                date_creation__year=date.year,
                date_creation__month=date.month
            ).aggregate(Max('sequence_number'))['sequence_number__max'] or 0
            
            self.sequence_number = last_sequence + 1
        
        client_id = str(self.offre.client.pk)
        offre_id = str(self.offre.pk)
        sequence = str(self.sequence_number).zfill(3)
        
        return f"AFF{date.year % 100:02d}{date.month:02d}{client_id}{offre_id}{sequence}"
    
    def save(self, *args, **kwargs):
        """Sauvegarde de base - la logique métier est déplacée dans les signaux"""
        creating = not self.pk
        
        # Avant la première sauvegarde
        if creating:
            # Génère la référence si elle n'existe pas encore
            if not self.reference:
                self.reference = self.generate_reference()
            
            # Initialise le montant total depuis l'offre
            if hasattr(self.offre, 'montant_total') and self.montant_total == 0:
                self.montant_total = self.offre.montant_total
        
        # Validation manuelle
        self.full_clean()
        
        # Sauvegarde l'objet
        super().save(*args, **kwargs)
        
        
    @transaction.atomic
    def initialiser_projet(self):
        """Initialise tous les éléments du projet après validation"""
        self.cree_rapports()
        self.cree_facture_initiale()
        
        # Événement de journal
        #self.log_event("Affaire initialisée", "Création des rapports et de la facture initiale")
    
    def cree_rapports(self):
        """Crée les rapports pour chaque produit de l'offre"""
        from document.models import Rapport
        import logging

        logger = logging.getLogger(__name__)
        logger.info(f"Création des rapports pour l'affaire {self.reference}")

        with transaction.atomic():
            # Récupération des rapports existants pour ne pas les recréer
            existing_reports = {
                rapport.produit: rapport 
                for rapport in Rapport.objects.filter(affaire=self)
            }

            rapports_crees = []
            produits_traites = set()

            # Traiter chaque produit individuellement
            for produit in self.offre.produits.all():
                # Éviter les doublons de produits
                if produit.id in produits_traites:
                    logger.warning(f"Produit {produit.id} déjà traité pour l'affaire {self.reference}")
                    continue

                produits_traites.add(produit.id)

                # Vérifier si ce rapport existe déjà
                if produit.id in existing_reports:
                    rapport = existing_reports[produit.id]
                    logger.info(f"Rapport déjà existant pour produit {produit.id} dans l'affaire {self.reference}")
                else:
                    # Créer un nouveau rapport avec get_or_create pour éviter les conflits
                    rapport, created = Rapport.objects.get_or_create(
                        affaire=self,
                        produit=produit,
                        defaults={
                            "client": self.offre.client,
                            "entity": self.offre.entity,
                            "sequence_number": self.sequence_number,
                            "statut": 'BROUILLON'
                        }
                    )

                    if created:
                        logger.info(f"Nouveau rapport créé pour produit {produit.id} dans l'affaire {self.reference}")
                    else:
                        logger.info(f"Rapport existant trouvé pour produit {produit.id} dans l'affaire {self.reference}")

                rapports_crees.append(rapport)

                # Traiter immédiatement si c'est une formation
                if produit.category.code == 'FOR':
                    try:
                        self.cree_formation(produit, rapport)
                        logger.info(f"Formation créée pour rapport {rapport.pk}")
                    except Exception as e:
                        logger.error(f"Erreur lors de la création de formation pour rapport {rapport.pk}: {str(e)}")

            return rapports_crees
    
    def cree_formation(self, produit, rapport=None):
        """Crée une formation pour le produit spécifié"""
        from document.models import Formation, Rapport
        
        # Si le rapport n'est pas fourni, essaie de le récupérer
        if not rapport:
            try:
                rapport = Rapport.objects.get(affaire=self, produit=produit)
            except Rapport.DoesNotExist:
                return None
        
        # Crée la formation
        formation = Formation.objects.get_or_create(
            titre=f"Formation {produit.name}",
            client=self.offre.client,
            affaire=self,
            rapport=rapport,
            date_debut=self.date_debut,
            date_fin=self.date_fin_prevue,
            description=f"Formation {produit.name} pour {self.offre.client.nom}"
        )
        
        return formation
    
    def cree_facture_initiale(self):
        """Crée la facture initiale pour l'affaire"""
       
        
        # Vérifie si une facture existe déjà
        if Facture.objects.filter(affaire=self).exists():
            return None
        
        # Crée la facture
        facture = Facture.objects.get_or_create(
            affaire=self,
            statut='BROUILLON',
            sequence_number = self.sequence_number,
            #montant_ht=self.montant_total
        )
        
        return facture
    

    
    def mettre_a_jour_statut(self, nouveau_statut, utilisateur=None, commentaire=""):
        """Met à jour le statut de l'affaire avec traçabilité"""
        ancien_statut = self.statut
        self.statut = nouveau_statut
        
        # Gestion des dates automatiques selon le statut
        if nouveau_statut == 'TERMINEE' and not self.date_fin_reelle:
            self.date_fin_reelle = now()
        
        self.save()
        

        
        return True
    
    def get_progression(self):
        """Calcule le pourcentage de progression de l'affaire"""
        from document.models import Rapport
        
        rapports = Rapport.objects.filter(affaire=self)
        total_rapports = rapports.count()
        
        if total_rapports == 0:
            return 0
        
        rapports_termines = rapports.filter(statut__in=['VALIDE', 'TERMINE']).count()
        return int((rapports_termines / total_rapports) * 100)
    
    def get_montant_restant_a_facturer(self):
        """Calcule le montant restant à facturer"""
        return self.montant_total - self.montant_facture
    
    def get_montant_restant_a_payer(self):
        """Calcule le montant restant à payer"""
        return self.montant_facture - self.montant_paye
    
    
# Signaux pour gérer les actions liées au changement de statut
@receiver(pre_save, sender=Affaire)
def pre_save_affaire(sender, instance, **kwargs):
    """Actions à effectuer avant la sauvegarde d'une affaire"""
    print("Pre-save signal for Affaire")
    if instance.pk:  # Si ce n'est pas une création
        try:
            # Récupérer l'instance avant modification
            old_instance = Affaire.objects.get(pk=instance.pk)
            
            # Stocker l'ancien statut comme attribut temporaire
            instance._old_statut = old_instance.statut
        except Affaire.DoesNotExist:
            # Si pour une raison quelconque l'instance n'existe pas (rare)
            instance._old_statut = None
    else:
        # Nouvelle instance
        instance._old_statut = None


@receiver(post_save, sender=Affaire)
def post_save_affaire(sender, instance, created, **kwargs):
    """Actions à effectuer après la sauvegarde d'une affaire"""
    print("Post-save signal for Affaire")
    # Vérifier si l'affaire vient d'être créée avec statut VALIDE
    if created and instance.statut == 'VALIDE':
        instance.initialiser_projet()
    
    # Vérifier si le statut vient de passer à VALIDE
    elif hasattr(instance, '_old_statut') and instance._old_statut != 'VALIDE' and instance.statut == 'VALIDE':
        instance.initialiser_projet()