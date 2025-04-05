# Generated by Django 5.1.4 on 2025-03-27 04:41

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('affaires_app', '0002_alter_affaire_date_debut'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='affaire',
            name='created_by',
        ),
        migrations.AddField(
            model_name='affaire',
            name='createur',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_crees', to=settings.AUTH_USER_MODEL, verbose_name='Créé par'),
        ),
        migrations.AddField(
            model_name='affaire',
            name='dates_statuts',
            field=models.JSONField(blank=True, default=dict, verbose_name='Dates des statuts'),
        ),
        migrations.AddField(
            model_name='affaire',
            name='modificateur',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_modifies', to=settings.AUTH_USER_MODEL, verbose_name='Modifié par'),
        ),
        migrations.AlterField(
            model_name='affaire',
            name='date_creation',
            field=models.DateTimeField(auto_now_add=True, verbose_name='Date de création'),
        ),
        migrations.AlterField(
            model_name='affaire',
            name='date_modification',
            field=models.DateTimeField(auto_now=True, verbose_name='Dernière modification'),
        ),
        migrations.AlterField(
            model_name='affaire',
            name='statut',
            field=models.CharField(choices=[('BROUILLON', 'Brouillon'), ('VALIDE', 'Validée'), ('EN_COURS', 'En cours'), ('EN_PAUSE', 'En pause'), ('TERMINEE', 'Terminée'), ('ANNULEE', 'Annulée')], default='BROUILLON', help_text="État actuel de l'affaire", max_length=30, verbose_name='Statut'),
        ),
    ]
