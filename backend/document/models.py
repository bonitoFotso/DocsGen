from django.db import models, transaction
from django.core.validators import RegexValidator
from django.db.models import Max
from django.utils.timezone import now
from django_fsm import FSMField, transition
from django.conf import settings
from django.contrib.contenttypes.models import ContentType 
class AuditableMixin(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="%(class)s_created"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="%(class)s_updated"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
class Entity(AuditableMixin, models.Model):
    code = models.CharField(
        max_length=3,
        unique=True,
        validators=[RegexValidator(regex='^[A-Z]{3}$')]
    )
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Client(AuditableMixin, models.Model):
    nom = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    telephone = models.CharField(max_length=15, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nom


class Site(AuditableMixin, models.Model):
    nom = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    localisation = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nom


class Category(AuditableMixin, models.Model):
    code = models.CharField(
        max_length=3,
        validators=[RegexValidator(regex='^[A-Z]{3}$')]
    )  # INS, FOR, QHS, etc.
    name = models.CharField(max_length=50)
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="categoris")

    def __str__(self):
        return self.name


class Product(AuditableMixin, models.Model):
    code = models.CharField(
        max_length=4,
        validators=[RegexValidator(regex='^(VTE|EC)\d+$')]
    )
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="produits")

    def __str__(self):
        return self.name


class AuditLog(models.Model):
    ACTION_TYPES = [
        ('CREATE', 'Création'),
        ('UPDATE', 'Modification'),
        ('DELETE', 'Suppression'),
        ('VALIDATE', 'Validation'),
        ('REFUSE', 'Refus'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=100)
    object_repr = models.CharField(max_length=200)
    changes = models.JSONField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']



class Document(models.Model):
    STATUTS = [
        ('BROUILLON', 'Brouillon'),
        ('ENVOYE', 'Envoyé'),
        ('VALIDE', 'Validé'),
        ('REFUSE', 'Refusé'),
    ]
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE)
    reference = models.CharField(max_length=50, unique=True, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(choices=STATUTS, default='BROUILLON', max_length=20)
    doc_type = models.CharField(
        max_length=3,
        validators=[RegexValidator(regex='^[A-Z]{3}$')]
    )  # PRF, FAC, etc.
    sequence_number = models.IntegerField()

    def log_action(self, action, user, changes=None):
        AuditLog.objects.create(
            user=user,
            action=action,
            content_type=ContentType.objects.get_for_model(self),
            object_id=str(self.pk),
            object_repr=str(self),
            changes=changes
        )

    class Meta:
        abstract = True

    @transition(field=statut, source='BROUILLON', target='ENVOYE')
    def envoyer(self, user):
        self.log_action('VALIDATE', user)
    @transition(field=statut, source='ENVOYE', target='VALIDE') 
    def valider(self, user):
        self.date_validation = now()
        self.log_action('VALIDATE', user)
    @transition(field=statut, source=['ENVOYE', 'BROUILLON'], target='REFUSE')
    def refuser(self, user):
        self.log_action('REFUSE', user)

    def __str__(self):
        return self.reference





class Offre(Document):
    produit = models.ManyToManyField(Product)
    date_modification = models.DateTimeField(auto_now=True)
    date_validation = models.DateTimeField(blank=True, null=True)  # Date d'acceptation
    sites = models.ManyToManyField(Site)


    def save(self, *args, **kwargs):
        if not self.reference:
            if not self.sequence_number:
                last_sequence = Offre.objects.filter(
                    entity=self.entity,
                    client=self.client,
                    date_creation__year=now().year,
                    date_creation__month=now().month
                ).aggregate(Max('sequence_number'))['sequence_number__max']
                self.sequence_number = (last_sequence or 0) + 1
                print(self.sequence_number, last_sequence)
            total_offres_client = Offre.objects.filter(client=self.client).count() + 1
            date = self.date_creation or now()
            self.reference = f"{self.entity.code}/OFF/{str(date.year)[-2:]}{date.month:02d}/{self.client.id}/{total_offres_client}/{self.sequence_number:04d}"

        if self.statut == 'VALIDE' and not self.date_validation:
            self.date_validation = now() 
            self.creer_affaire()
        elif self.statut == 'VALIDE' and self.date_validation:
            self.date_validation = now()
            self.creer_affaire()

        print(self.reference)
        super().save(*args, **kwargs)
    @transaction.atomic
    def creer_affaire(self):
        """
        Crée l'affaire et le proforma associés à l'offre.
        Cette méthode est appelée automatiquement quand le statut passe à 'VALIDE'.
        """
        if self.statut != 'VALIDE':
            raise ValueError("L'offre doit être en statut 'VALIDE' pour créer une affaire.")

        if hasattr(self, 'proforma'):
            raise ValueError("Une affaire existe déjà pour cette proforma.")

        if not self.date_validation:
            raise ValueError("L'offre n'a pas de date de validation.")



        # Créer le proforma
        proforma = Proforma.objects.create(
            offre=self,
            client=self.client,
            entity=self.entity,
            doc_type='PRO',
        )

        return proforma



class Proforma(Document):
    offre = models.OneToOneField(Offre, on_delete=models.CASCADE, related_name="proforma")

    def save(self, *args, **kwargs):
        if not self.reference:
            if not self.sequence_number:
                last_sequence = Proforma.objects.filter(
                    entity=self.entity,
                    doc_type='PRO',
                    date_creation__year=now().year,
                    date_creation__month=now().month
                ).aggregate(Max('sequence_number'))['sequence_number__max']
                self.sequence_number = (last_sequence or 0) + 1
            total_proformas_client = Proforma.objects.filter(client=self.client).count() + 1
            date = self.date_creation or now()
            self.reference = f"{self.entity.code}/PRO/{self.offre.id}/{str(date.year)[-2:]}{date.month:02d}/{self.client.id}/{total_proformas_client}/{self.sequence_number:04d}"
        if self.statut == 'VALIDE':
            self.date_validation = now()
            self.creer_affaire()

        super().save(*args, **kwargs)

    def creer_affaire(self):
            """
            Crée l'affaire et le proforma associés à l'offre.
            Cette méthode est appelée automatiquement quand le statut passe à 'VALIDE'.
            """
            if self.statut != 'VALIDE':
                raise ValueError("L'offre doit être en statut 'VALIDE' pour créer une affaire.")

            if hasattr(self, 'affaire'):
                raise ValueError("Une affaire existe déjà pour cette offre.")

            if not self.date_validation:
                raise ValueError("L'offre n'a pas de date de validation.")

            # Créer l'affaire
            affaire = Affaire.objects.create(
                offre=self.offre,
                client=self.client,
                entity=self.entity,
                doc_type='AFF',
            )



            return affaire

class Affaire(Document):
    offre = models.OneToOneField(Offre, on_delete=models.CASCADE, related_name="affaire")
    date_debut = models.DateTimeField(auto_now_add=True)
    date_fin_prevue = models.DateTimeField(null=True, blank=True)
    statut = models.CharField(
        max_length=20,
        choices=[
            ('EN_COURS', 'En cours'),
            ('TERMINEE', 'Terminée'),
            ('ANNULEE', 'Annulée'),
        ],
        default='EN_COURS'
    )

    def sync_with_offre(self):
        """Synchronise les champs de l'Affaire avec ceux de l'Offre"""
        self.client = self.offre.client
        self.entity = self.offre.entity

    def cree_rapports(self):
        """Crée les rapports pour chaque combinaison site-produit"""
        
        # Supprime les rapports existants
        Rapport.objects.filter(affaire=self).delete()
        
        # Crée un rapport pour chaque combinaison site-produit
        for site in self.offre.sites.all():
            for produit in self.offre.produit.all():
                Rapport.objects.create(
                    affaire=self,
                    site=site,
                    produit=produit,
                    client=self.client,
                    entity=self.entity,
                    doc_type='RAP',
                    statut='BROUILLON'
                )
                if produit.category.code == 'FOR':
                    self.cree_formation(site, produit)

    def cree_formation(self, site, produit):
        """Crée une formation pour le site et le produit donnés"""
        from .models import Formation
        formation = Formation.objects.create(
            titre=f"Formation {produit.name}",
            client=self.client,
            affaire=self,
            rapport=Rapport.objects.get(affaire=self, site=site, produit=produit),
            date_debut=self.date_debut,
            date_fin=self.date_fin_prevue,
            description=f"Formation {produit.name} pour le site {self.client.nom}"
        )
        return formation
    



    def save(self, *args, **kwargs):
        creating = not self.pk  # Vérifie si c'est une création
        
        if creating:
            # Synchronise avec l'offre lors de la création
            self.sync_with_offre()
            
            # Génère la référence
            if not self.reference:
                if not self.sequence_number:
                    last_sequence = Affaire.objects.filter(
                        entity=self.entity,
                        doc_type='AFF',
                        date_creation__year=now().year,
                        date_creation__month=now().month
                    ).aggregate(Max('sequence_number'))['sequence_number__max']
                    self.sequence_number = (last_sequence or 0) + 1

                total_affaires_client = Affaire.objects.filter(client=self.client).count() + 1
                date = self.date_creation or now()
                self.reference = f"{self.entity.code}/AFF/{self.offre.id}/{str(date.year)[-2:]}{date.month:02d}/{self.client.id}/{total_affaires_client}/{self.sequence_number:04d}"

        super().save(*args, **kwargs)

        if creating:
            # Crée les rapports après la sauvegarde initiale
            self.cree_rapports()

    def __str__(self):
        return f"Affaire {self.reference} - {self.offre.client.nom}"

class Facture(Document):
    affaire = models.OneToOneField(Affaire, on_delete=models.CASCADE, related_name="facture")

    def save(self, *args, **kwargs):
        if not self.reference:
            if not self.sequence_number:
                last_sequence = Facture.objects.filter(
                    entity=self.entity,
                    doc_type='FAC',
                    date_creation__year=now().year,
                    date_creation__month=now().month
                ).aggregate(Max('sequence_number'))['sequence_number__max']
                self.sequence_number = (last_sequence or 0) + 1
            total_factures_client = Facture.objects.filter(client=self.affaire.client).count() + 1
            date = self.date_creation or now()
            self.reference = f"{self.entity.code}/FAC/{self.affaire.id}/{self.affaire.offre.id}/{str(date.year)[-2:]}{date.month:02d}/{self.client.id}/{total_factures_client}/{self.sequence_number:04d}"
        super().save(*args, **kwargs)


class Rapport(Document):
    affaire = models.ForeignKey(Affaire, on_delete=models.CASCADE, related_name="rapports")
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    produit = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="rapports")


    def save(self, *args, **kwargs):
        if not self.reference:
            if not self.sequence_number:
                last_sequence = Rapport.objects.filter(
                    entity=self.entity,
                    doc_type='RAP',
                    date_creation__year=now().year,
                    date_creation__month=now().month
                ).aggregate(Max('sequence_number'))['sequence_number__max']
                self.sequence_number = (last_sequence or 0) + 1
            total_rapports_client = Rapport.objects.filter(client=self.affaire.client).count() + 1
            total_category_rapports = Rapport.objects.filter(client=self.affaire.client,produit__category=self.produit.category).count() + 1
            date = self.date_creation or now()
            self.reference = f"{self.entity.code}/RAP/{self.affaire.id}/{self.affaire.offre.id}/{str(date.year)[-2:]}{date.month:02d}/{self.client.id}/{self.produit.category.code}/{total_category_rapports}/{self.produit.code}/{total_rapports_client}/{self.sequence_number:04d}"
        super().save(*args, **kwargs)


class Formation(AuditableMixin, models.Model):
    titre = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="formations")
    affaire = models.ForeignKey(Affaire, on_delete=models.CASCADE, related_name="formations")
    rapport = models.ForeignKey(Rapport, on_delete=models.CASCADE, related_name="formation")
    date_debut = models.DateTimeField(blank=True, null=True)
    date_fin = models.DateTimeField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.titre} - {self.client.nom}"


class Participant(AuditableMixin, models.Model):
    nom = models.CharField(max_length=255)
    prenom = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    telephone = models.CharField(max_length=15, blank=True, null=True)
    fonction = models.CharField(max_length=100, blank=True, null=True)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name="participants")

    def __str__(self):
        return f"{self.nom} {self.prenom}"


class AttestationFormation(Document):
    affaire = models.ForeignKey(Affaire, on_delete=models.CASCADE, related_name="attestations")
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name="attestations")
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name= "attestation")
    details_formation = models.TextField()

    def save(self, *args, **kwargs):
        if not self.reference:
            if not self.sequence_number:
                last_sequence = AttestationFormation.objects.filter(
                    entity=self.entity,
                    client=self.affaire.client,
                    formation=self.formation,
                    doc_type='ATT',
                    date_creation__year=now().year,
                    date_creation__month=now().month
                ).aggregate(Max('sequence_number'))['sequence_number__max']
                self.sequence_number = (last_sequence or 0) + 1
            total_attestations_client = AttestationFormation.objects.filter(client=self.client).count() + 1
            date = self.date_creation or now()
            self.reference = f"{self.entity.code}/ATT/{self.affaire.id}/{str(date.year)[-2:]}{date.month:02d}/{self.client.id}/{total_attestations_client}/{self.formation.id}/{self.participant.id}/{self.sequence_number:04d}"
        super().save(*args, **kwargs)


class DocumentPermission:
    pass
