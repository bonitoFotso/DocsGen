from django.db import models
from django.utils import timezone
from django.conf import settings

def generate_reference(prefix, doc_type, client_ref):
    """
    Génère une référence unique pour un document.
    Format : [PREFIX]-[TYPE]-[DATE]-[CLIENT_REF]-[SEQUENCE]
    """
    date_str = timezone.now().strftime("%y%m%d")  # Date au format YYMMDD
    sequence = 1  # Commence à 1

    # Générer la référence de base
    base_ref = f"{prefix}-{doc_type}-{date_str}-{client_ref}"

    # Trouver la dernière référence pour ce type de document et ce client
    last_ref = Courrier.objects.filter(reference__startswith=base_ref).order_by('-reference').first()

    if last_ref:
        # Extraire le numéro de séquence et l'incrémenter
        last_sequence = int(last_ref.reference.split('-')[-1])
        sequence = last_sequence + 1

    # Formater le numéro de séquence avec des zéros à gauche
    sequence_str = f"{sequence:03d}"

    # Retourner la référence complète
    return f"{base_ref}-{sequence_str}"

class Courrier(models.Model):
    DOC_TYPES = [
        ('LTR', 'Lettre'),
        ('DCE', 'Demande de Certificat'),
        ('ODV', 'Ordre de Virement'),
        ('CDV', 'Courrier de Virement'),
        ('BCM', 'Bon de Commande'),
        ('DAO', 'Demande d\'Approvisionnement'),
        ('ADV', 'Avis de Mission'),
        ('RPT', 'Rapport'),
        ('FCT', 'Facture'),
        ('DVS', 'Devis'),
        ('BDC', 'Bon de Commande'),
        ('CND', 'Conduite à Tenir'),
        ('RCL', 'Recouvrement'),
        ('RCV', 'Reçu'),
        ('RGL', 'Règlement'),

    ]

    reference = models.CharField(max_length=50, unique=True, verbose_name="Référence")
    entite = models.ForeignKey('document.Entity', on_delete=models.CASCADE, verbose_name="Entité")
    doc_type = models.CharField(max_length=3, choices=DOC_TYPES, verbose_name="Type de document")
    client = models.ForeignKey('client.Client', on_delete=models.CASCADE, verbose_name="Client")
    date_creation = models.DateField(auto_now_add=True, verbose_name="Date de création")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name="Créé par")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    fichier = models.FileField(upload_to='courriers/', blank=True, null=True, verbose_name="Fichier")

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = generate_reference(self.entite, self.doc_type, self.client.reference)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.reference

    class Meta:
        verbose_name = "Courrier"
        verbose_name_plural = "Courriers"