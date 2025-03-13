from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Affaire
from document.models import Rapport, Formation, Facture


class RapportInline(admin.TabularInline):
    """Affichage inline des rapports associés à une affaire."""
    model = Rapport
    extra = 0
    fields = ('produit', 'statut', 'date_creation')
    readonly_fields = ('date_creation',)
    can_delete = False
    show_change_link = True


class FactureInline(admin.TabularInline):
    """Affichage inline des factures associées à une affaire."""
    model = Facture
    extra = 0
    fields = ('reference', 'montant_ht', 'statut', 'date_creation')
    readonly_fields = ('reference', 'date_creation')
    can_delete = False
    show_change_link = True


@admin.register(Affaire)
class AffaireAdmin(admin.ModelAdmin):
    """Configuration de l'interface d'administration pour les affaires."""
    list_display = ('reference', 'client_link', 'statut_display', 'date_debut', 
                   'date_fin_prevue', 'montant_total', 'progression_display', 'created_by')
    list_filter = ('statut', 'date_creation', 'date_debut')
    search_fields = ('reference', 'offre__client__nom')
    readonly_fields = ('reference', 'date_creation', 'date_modification', 'created_by', 
                       'montant_restant_facture', 'montant_restant_paye', 'progression')
    fieldsets = (
        ('Identification', {
            'fields': ('reference', 'offre', 'statut', 'responsable')
        }),
        ('Dates', {
            'fields': ('date_debut', 'date_fin_prevue', 'date_fin_reelle', 
                       'date_creation', 'date_modification')
        }),
        ('Finances', {
            'fields': ('montant_total', 'montant_facture', 'montant_paye', 
                       'montant_restant_facture', 'montant_restant_paye')
        }),
        ('Progression', {
            'fields': ('progression', 'notes')
        }),
        ('Métadonnées', {
            'fields': ('created_by',)
        }),
    )
    inlines = [RapportInline, FactureInline]
    actions = ['marquer_en_cours', 'marquer_termine']
    
    def client_link(self, obj):
        """Lien vers le client associé à l'affaire."""
        client = obj.offre.client
        url = reverse('admin:clients_client_change', args=[client.pk])
        return format_html('<a href="{}">{}</a>', url, client.nom)
    client_link.short_description = 'Client'
    
    def statut_display(self, obj):
        """Affichage coloré du statut."""
        colors = {
            'BROUILLON': 'gray',
            'VALIDE': 'blue',
            'EN_COURS': 'green',
            'EN_PAUSE': 'orange',
            'TERMINEE': 'purple',
            'ANNULEE': 'red'
        }
        return format_html(
            '<span style="color:white; background-color:{}; padding:3px 6px; border-radius:3px;">{}</span>',
            colors.get(obj.statut, 'black'),
            obj.get_statut_display()
        )
    statut_display.short_description = 'Statut'
    
    def progression_display(self, obj):
        """Affichage de la progression sous forme de barre."""
        progression = obj.get_progression()
        return format_html(
            '<div style="width:100px; background-color:#f8f8f8; border:1px solid #ddd;">'
            '<div style="width:{}px; height:15px; background-color:#2196F3;"></div>'
            '</div> {}%',
            progression,
            progression
        )
    progression_display.short_description = 'Progression'
    
    def montant_restant_facture(self, obj):
        """Calcul du montant restant à facturer."""
        return obj.get_montant_restant_a_facturer()
    montant_restant_facture.short_description = 'Reste à facturer'
    
    def montant_restant_paye(self, obj):
        """Calcul du montant restant à payer."""
        return obj.get_montant_restant_a_payer()
    montant_restant_paye.short_description = 'Reste à payer'
    
    def progression(self, obj):
        """Affichage de la progression en pourcentage."""
        return f"{obj.get_progression()}%"
    progression.short_description = 'Progression'
    
    def save_model(self, request, obj, form, change):
        """Enregistre l'utilisateur courant comme créateur lors de la création."""
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    def marquer_en_cours(self, request, queryset):
        """Action pour marquer plusieurs affaires comme en cours."""
        for affaire in queryset:
            if affaire.statut in ['BROUILLON', 'VALIDE', 'EN_PAUSE']:
                affaire.mettre_a_jour_statut('EN_COURS', request.user, 'Action en masse')
        self.message_user(request, f"{queryset.count()} affaire(s) marquée(s) comme en cours.")
    marquer_en_cours.short_description = "Marquer comme en cours"
    
    def marquer_termine(self, request, queryset):
        """Action pour marquer plusieurs affaires comme terminées."""
        for affaire in queryset:
            if affaire.statut in ['EN_COURS', 'EN_PAUSE']:
                affaire.mettre_a_jour_statut('TERMINEE', request.user, 'Action en masse')
                if not affaire.date_fin_reelle:
                    from django.utils.timezone import now
                    affaire.date_fin_reelle = now()
                    affaire.save()
        self.message_user(request, f"{queryset.count()} affaire(s) marquée(s) comme terminée(s).")
    marquer_termine.short_description = "Marquer comme terminée"