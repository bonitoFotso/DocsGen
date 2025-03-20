from datetime import timedelta
from django.db import models, transaction
from django.core.validators import RegexValidator
from django.db.models import Max
from django.utils.timezone import now
from django_fsm import FSMField, transition
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from client.models import AuditableMixin, Client, Contact
class Entity(AuditableMixin, models.Model):
    code = models.CharField(
        max_length=3,
        unique=True,
        validators=[RegexValidator(regex='^[A-Z]{3}$')]
    )
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name




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
        validators=[RegexValidator(regex=r'^(VTE|EC)\d+$')]
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
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='%(class)ss')
    reference = models.CharField(max_length=50, unique=True, editable=False)
    client = models.ForeignKey(
        Client, 
        on_delete=models.CASCADE,
        related_name='%(class)ss'   # Cela créera automatiquement des related_names uniques
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(choices=STATUTS, default='BROUILLON', max_length=20)
    doc_type = models.CharField(
        max_length=3,
        validators=[RegexValidator(regex='^[A-Z]{3}$')]
    )  # PRF, FAC, etc.
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True, related_name='%(class)ss'
    )
    sequence_number = models.IntegerField()
    fichier = models.FileField(upload_to='documents/', blank=True, null=True)

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




class Rapport(Document):
    affaire = models.ForeignKey('affaires_app.Affaire', on_delete=models.CASCADE, related_name="rapports")
    #site = models.ForeignKey(Site, on_delete=models.CASCADE)
    produit = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="rapports")
    numero = models.CharField(max_length=10, blank=True, null=True)


    def save(self, *args, **kwargs):
        if not self.numero:
            self.numero = f"RAP{self.affaire.offre.client.c_num}/{self.produit.code}/{self.pk}"
        if not self.reference:
            if not self.sequence_number:
                last_sequence = Rapport.objects.filter(
                    entity=self.entity,
                    doc_type='RAP',
                    date_creation__year=now().year,
                    date_creation__month=now().month
                ).aggregate(Max('sequence_number'))['sequence_number__max']
                self.sequence_number = (last_sequence or 0) + 1
            total_rapports_client = Rapport.objects.filter(client=self.affaire.offre.client).count() + 1
            total_category_rapports = Rapport.objects.filter(client=self.affaire.offre.client,produit__category=self.produit.category).count() + 1
            date = self.date_creation or now()
            self.reference = f"{self.entity.code}/RAP/{self.client.c_num}/{self.affaire.reference}/{total_category_rapports}/{self.produit.code}/{total_rapports_client}/{self.sequence_number:04d}"
        super().save(*args, **kwargs)


class Formation(AuditableMixin, models.Model):
    titre = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="formations")
    affaire = models.ForeignKey('affaires_app.Affaire', on_delete=models.CASCADE, related_name="formations")
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
    photo = models.ImageField(upload_to='participants/', blank=True, null=True)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name="participants")

    def __str__(self):
        return f"{self.nom} {self.prenom}"


class AttestationFormation(Document):
    affaire = models.ForeignKey('affaires_app.Affaire', on_delete=models.CASCADE, related_name="attestations")
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name="attestations")
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name= "attestation")
    details_formation = models.TextField()
    rapport = models.ForeignKey(Rapport, on_delete=models.CASCADE, related_name="attestations")

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
            self.reference = f"{self.entity.code}/ATT/{self.client.c_num}/{str(date.year)[-2:]}{date.month:02d}{date.day:02d}/{self.affaire.reference}/{total_attestations_client}/{self.formation.pk}/{self.participant.pk}/{self.sequence_number:04d}"
        super().save(*args, **kwargs)


class DocumentPermission:
    pass


class Opportunite(Document):
    STATUS_CHOICES = [
        ('PROSPECT', 'Prospect'),
        ('QUALIFICATION', 'Qualification'),
        ('PROPOSITION', 'Proposition'),
        ('NEGOCIATION', 'Négociation'),
        ('GAGNEE', 'Gagnée'),
        ('PERDUE', 'Perdue'),
    ]
    #entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='opportunites')

    produits = models.ManyToManyField(Product, related_name="opportunites")
    produit_principal = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="opportunites_principales")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="opportunites")
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="opportunites")
    
    date_detection = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_cloture = models.DateTimeField(blank=True, null=True)
    
    statut = FSMField(
    max_length=20,
    choices=STATUS_CHOICES,
    default='PROSPECT'
)
    
    montant_estime = models.DecimalField(max_digits=10, decimal_places=2)
    probabilite = models.IntegerField(default=0, help_text="Probabilité de conversion en %")
    
    description = models.TextField(blank=True, null=True)
    besoins_client = models.TextField(blank=True, null=True)
    
    relance = models.DateTimeField(
        blank=True, 
        null=True,
        help_text="Date de la prochaine relance"
    )
    
    DELAIS_RELANCE = {
        'PROSPECT': 14,       # Relance après 14 jours pour les prospects
        'QUALIFICATION': 10,  # Relance après 10 jours pour les qualifications
        'PROPOSITION': 7,     # Relance après 7 jours pour les propositions
        'NEGOCIATION': 5,     # Relance après 5 jours pour les négociations
    }
    
    def set_relance(self):
        """
        Configure la prochaine date de relance si l'opportunité n'est pas gagnée/perdue
        """
        if self.statut in ['GAGNEE', 'PERDUE']:
            self.relance = None
            return

        if self.statut in self.DELAIS_RELANCE:
            base_date = now() if not self.relance else self.relance
            self.relance = base_date + timedelta(days=self.DELAIS_RELANCE[self.statut])
    
    @property
    def necessite_relance(self):
        """
        Indique si l'opportunité nécessite une relance maintenant
        """
        return (
            self.relance 
            and self.relance <= now() 
            and self.statut not in ['GAGNEE', 'PERDUE']
        )
    
    @transition(field=statut, source='PROSPECT', target='QUALIFICATION')
    def qualifier(self, user):
        self.log_action('UPDATE', user, {'statut': 'QUALIFICATION'})
        self.set_relance()
    
    @transition(field=statut, source='QUALIFICATION', target='PROPOSITION')
    def proposer(self, user):
        self.log_action('UPDATE', user, {'statut': 'PROPOSITION'})
        self.set_relance()
    
    @transition(field=statut, source='PROPOSITION', target='NEGOCIATION')
    def negocier(self, user):
        self.log_action('UPDATE', user, {'statut': 'NEGOCIATION'})
        self.set_relance()
    
    @transition(field=statut, source='*', target='GAGNEE')
    def gagner(self, user):
        self.date_cloture = now()
        self.relance = None
        self.log_action('UPDATE', user, {'statut': 'GAGNEE'})
        # On pourrait créer une offre automatiquement ici
    
    @transition(field=statut, source='*', target='PERDUE')
    def perdre(self, user, raison=None):
        self.date_cloture = now()
        self.relance = None
        changes = {'statut': 'PERDUE'}
        if raison:
            if self.description:
                self.description += f"\n\nRaison de perte: {raison}"
            else:
                self.description = f"Raison de perte: {raison}"
            changes['raison'] = raison
        self.log_action('UPDATE', user, changes)
    
    @transaction.atomic
    def creer_offre(self):
        """
        Crée une offre basée sur cette opportunité
        """
        if self.statut not in ['QUALIFICATION', 'PROPOSITION', 'NEGOCIATION', 'GAGNEE']:
            raise ValueError("L'opportunité doit être au moins qualifiée pour créer une offre.")
        
        #offre = Offre.objects.create(
        #    client=self.client,
        #    entity=self.entity,
        #    produit=self.produit_principal,
        #    contact=self.contact,
        #    montant=self.montant_estime,
        #    doc_type='OFF',
        #    created_by=self.created_by,
        #)
        #
        ## Ajouter tous les produits
        #for produit in self.produits.all():
        #    offre.produits.add(produit)
        #
        #return offre
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        # Mise à jour de la probabilité en fonction du statut
        probabilities = {
            'PROSPECT': 10,
            'QUALIFICATION': 30,
            'PROPOSITION': 50,
            'NEGOCIATION': 75,
            'GAGNEE': 100,
            'PERDUE': 0,
        }
        
        if self.statut in probabilities:
            self.probabilite = probabilities[self.statut]
        
        # Gestion des dates de clôture
        if self.statut in ['GAGNEE', 'PERDUE'] and not self.date_cloture:
            self.date_cloture = now()
            self.relance = None
        elif self.statut not in ['GAGNEE', 'PERDUE']:
            self.date_cloture = None
            self.set_relance()
        
        # Génération de la référence
        if not self.reference:
            if not self.sequence_number:
                last_sequence = Opportunite.objects.filter(
                    entity=self.entity,
                    client=self.client,
                    date_creation__year=now().year,
                    date_creation__month=now().month
                ).aggregate(Max('sequence_number'))['sequence_number__max']
                self.sequence_number = (last_sequence or 0) + 1
            
            total_opportunites_client = Opportunite.objects.filter(client=self.client).count() + 1
            date = self.date_creation or now()
            self.reference = f"{self.entity.code}/OPP/{self.client.c_num}/{str(date.year)[-2:]}{date.month:02d}{date.day:02d}/{self.produit_principal.code}/{total_opportunites_client}/{self.sequence_number:04d}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Opportunité {self.reference} - {self.client.nom} - {self.statut}"

