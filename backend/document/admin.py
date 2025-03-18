# Description: Fichier de configuration de l'interface d'administration de l'application document
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from api.user.models import User
from .models import (
    ContentType, Entity, Category, Product, 
    Facture, Rapport, Formation, Participant, AttestationFormation,
     AuditLog
)

from django.contrib import admin

@admin.register(ContentType)
class ContentTypeAdmin(admin.ModelAdmin):
   list_display = ['app_label', 'model']
   list_filter = ['app_label']
   search_fields = ['app_label', 'model']
   ordering = ['app_label', 'model']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
   list_display = ['timestamp', 'user', 'action', 'content_type', 'object_repr']
   list_filter = ['action', 'content_type', 'user']
   search_fields = ['user__username', 'object_repr']
   readonly_fields = ['timestamp', 'user', 'action', 'content_type', 'object_id', 'object_repr', 'changes']
   date_hierarchy = 'timestamp'

   def has_add_permission(self, request):
       return False
       
   def has_change_permission(self, request, obj=None):
       return False
       
   def has_delete_permission(self, request, obj=None):
       return False

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'departement', 'is_staff', 'is_active')
    list_filter = ('departement', 'is_active', 'is_staff')
    search_fields = ('username', 'email')
    ordering = ('username',)



class BaseModelAdmin(admin.ModelAdmin):
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

@admin.register(Entity)
class EntityAdmin(BaseModelAdmin):
    list_display = ('code', 'name')
    search_fields = ('code', 'name')


@admin.register(Category)
class CategoryAdmin(BaseModelAdmin):
    list_display = ('code', 'name', 'entity')
    list_filter = ('entity',)
    search_fields = ('code', 'name')

@admin.register(Product)
class ProductAdmin(BaseModelAdmin):
    list_display = ('code', 'name', 'category')
    list_filter = ('category',)
    search_fields = ('code', 'name')




@admin.register(Rapport)
class RapportAdmin(BaseModelAdmin):
    list_display = ('reference', 'affaire', 'produit', 'statut')
    list_filter = ('statut', 'entity', )
    search_fields = ('reference', 'affaire__reference')
    readonly_fields = ('reference',)

@admin.register(Formation)
class FormationAdmin(BaseModelAdmin):
    list_display = ('titre', 'client', 'affaire', 'date_debut', 'date_fin')
    list_filter = ('client',)
    search_fields = ('titre', 'client__nom')

@admin.register(Participant)
class ParticipantAdmin(BaseModelAdmin):
    list_display = ('nom', 'prenom', 'email', 'formation')
    list_filter = ('formation',)
    search_fields = ('nom', 'prenom', 'email')


@admin.register(AttestationFormation)
class AttestationFormationAdmin(admin.ModelAdmin):
   list_display = ('reference', 'affaire', 'formation', 'participant', 'date_creation')
   list_filter = ('formation', 'participant', 'affaire')
   search_fields = ('reference', 'participant__nom', 'formation__titre')
   readonly_fields = ('reference',)
   
   fieldsets = (
       ('Informations générales', {
           'fields': ('affaire', 'formation', 'participant')
       }),
       ('Détails', {
           'fields': ('details_formation', 'reference')
       })
   )

@admin.register(Facture)
class FactureAdmin(BaseModelAdmin):
    list_display = ('reference', 'client', 'statut', 'date_creation')
    list_filter = ('statut', 'entity')
    search_fields = ('reference', 'client__nom')
    readonly_fields = ('reference',)



from django.contrib import admin
from django.utils.html import format_html
from django.utils.timezone import now
from .models import Opportunite

@admin.register(Opportunite)
class OpportuniteAdmin(BaseModelAdmin):
    list_display = [
        'reference', 
        'client', 
        'entity',
        'produit_principal', 
        'statut_colored', 
        'montant_estime', 
        'probabilite_percentage', 
        'date_detection', 
        'date_modification',
        'relance_status'
    ]
    
    list_filter = [
        'statut', 
        'entity',
        'produit_principal', 
        'client', 
        'date_detection', 
        'date_modification'
    ]
    
    search_fields = [
        'reference', 
        'entity'
        'client__nom', 
        'produit_principal__nom', 
        'description',
        'besoins_client'
    ]
    
    readonly_fields = [
        'reference', 
        'date_detection', 
        'date_modification', 
        'date_cloture', 
        'necessite_relance'
    ]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('reference', 'client', 'entity','contact', 'statut', 'montant_estime', 'probabilite')
        }),
        ('Produits', {
            'fields': ('produit_principal', 'produits')
        }),
        ('Détails', {
            'fields': ('description', 'besoins_client')
        }),
        ('Dates importantes', {
            'fields': ('date_detection', 'date_modification', 'date_cloture', 'relance')
        }),
    )
    
    filter_horizontal = ['produits']
    
    actions = ['qualifier_opportunities', 'proposer_opportunities', 'negocier_opportunities', 
               'gagner_opportunities', 'perdre_opportunities', 'reset_relance']
    
    def statut_colored(self, obj):
        colors = {
            'PROSPECT': '#6c757d',  # Gris
            'QUALIFICATION': '#17a2b8',  # Bleu clair
            'PROPOSITION': '#007bff',  # Bleu
            'NEGOCIATION': '#ffc107',  # Jaune
            'GAGNEE': '#28a745',  # Vert
            'PERDUE': '#dc3545',  # Rouge
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 7px; border-radius: 3px;">{}</span>',
            colors.get(obj.statut, '#6c757d'),
            obj.get_statut_display()
        )
    statut_colored.short_description = 'Statut'
    
    def probabilite_percentage(self, obj):
        color = '#28a745' if obj.probabilite >= 75 else '#ffc107' if obj.probabilite >= 30 else '#dc3545'
        return format_html('<span style="color: {};">{} %</span>', color, obj.probabilite)
    probabilite_percentage.short_description = 'Probabilité'
    
    def relance_status(self, obj):
        if obj.statut in ['GAGNEE', 'PERDUE']:
            return '-'
        elif obj.necessite_relance:
            return format_html('<span style="color: red; font-weight: bold;">Relance requise</span>')
        elif obj.relance:
            days_left = (obj.relance - now()).days
            if days_left <= 2:
                return format_html('<span style="color: orange;">Relance dans {} jour(s)</span>', days_left)
            else:
                return format_html('<span style="color: green;">Relance dans {} jours</span>', days_left)
        return '-'
    relance_status.short_description = 'Relance'
    
    def qualifier_opportunities(self, request, queryset):
        for opp in queryset.filter(statut='PROSPECT'):
            try:
                opp.qualifier(request.user)
                opp.save()
            except Exception as e:
                self.message_user(request, f"Erreur sur {opp.reference}: {str(e)}", level='ERROR')
        self.message_user(request, f"{queryset.filter(statut='PROSPECT').count()} opportunité(s) qualifiée(s)")
    qualifier_opportunities.short_description = "Qualifier les opportunités sélectionnées"
    
    def proposer_opportunities(self, request, queryset):
        for opp in queryset.filter(statut='QUALIFICATION'):
            try:
                opp.proposer(request.user)
                opp.save()
            except Exception as e:
                self.message_user(request, f"Erreur sur {opp.reference}: {str(e)}", level='ERROR')
        self.message_user(request, f"{queryset.filter(statut='QUALIFICATION').count()} opportunité(s) passée(s) en proposition")
    proposer_opportunities.short_description = "Passer en proposition les opportunités sélectionnées"
    
    def negocier_opportunities(self, request, queryset):
        for opp in queryset.filter(statut='PROPOSITION'):
            try:
                opp.negocier(request.user)
                opp.save()
            except Exception as e:
                self.message_user(request, f"Erreur sur {opp.reference}: {str(e)}", level='ERROR')
        self.message_user(request, f"{queryset.filter(statut='PROPOSITION').count()} opportunité(s) passée(s) en négociation")
    negocier_opportunities.short_description = "Passer en négociation les opportunités sélectionnées"
    
    def gagner_opportunities(self, request, queryset):
        for opp in queryset.filter(statut__in=['QUALIFICATION', 'PROPOSITION', 'NEGOCIATION']):
            try:
                opp.gagner(request.user)
                opp.save()
            except Exception as e:
                self.message_user(request, f"Erreur sur {opp.reference}: {str(e)}", level='ERROR')
        self.message_user(request, f"{queryset.filter(statut__in=['QUALIFICATION', 'PROPOSITION', 'NEGOCIATION']).count()} opportunité(s) gagnée(s)")
    gagner_opportunities.short_description = "Marquer comme gagnées les opportunités sélectionnées"
    
    def perdre_opportunities(self, request, queryset):
        for opp in queryset.filter(statut__in=['PROSPECT', 'QUALIFICATION', 'PROPOSITION', 'NEGOCIATION']):
            try:
                opp.perdre(request.user, raison="Action en masse depuis l'administration")
                opp.save()
            except Exception as e:
                self.message_user(request, f"Erreur sur {opp.reference}: {str(e)}", level='ERROR')
        self.message_user(request, f"{queryset.filter(statut__in=['PROSPECT', 'QUALIFICATION', 'PROPOSITION', 'NEGOCIATION']).count()} opportunité(s) perdue(s)")
    perdre_opportunities.short_description = "Marquer comme perdues les opportunités sélectionnées"
    
    def reset_relance(self, request, queryset):
        count = 0
        for opp in queryset:
            if opp.statut not in ['GAGNEE', 'PERDUE']:
                opp.set_relance()
                opp.save()
                count += 1
        self.message_user(request, f"{count} date(s) de relance recalculée(s)")
    reset_relance.short_description = "Recalculer les dates de relance"
    
    def save_model(self, request, obj, form, change):
        if not change:  # Si c'est une nouvelle opportunité
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

# Personnalisation de l'interface d'administration
admin.site.site_header = "Gestion des Documents"
admin.site.site_title = "Administration des Documents"
admin.site.index_title = "Tableau de bord"