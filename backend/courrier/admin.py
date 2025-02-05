from django.contrib import admin
from .models import Courrier

@admin.register(Courrier)
class CourrierAdmin(admin.ModelAdmin):
    list_display = ('reference', 'entite', 'doc_type', 'client', 'date_creation', 'created_by')
    list_filter = ('doc_type', 'entite', 'client', 'date_creation')
    search_fields = ('reference', 'client__name', 'entite__name')  # Assurez-vous que 'client' et 'entite' ont un champ 'name'
    readonly_fields = ('reference', 'date_creation')  # Empêche la modification de la référence et de la date de création

    # Optionnel: Personnaliser l'affichage des champs dans le formulaire d'édition
    fieldsets = (
        (None, {
            'fields': ('reference', 'entite', 'doc_type', 'client', 'date_creation', 'created_by', 'notes')
        }),
    )

    # Optionnel: Personnaliser l'affichage des champs dans le formulaire d'ajout
    add_fieldsets = (
        (None, {
            'fields': ('entite', 'doc_type', 'client', 'created_by', 'notes')
        }),
    )

    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)