# Generated by Django 5.1.4 on 2025-02-14 16:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('client', '0002_contact_site_alter_contact_nom'),
        ('document', '0012_participant_photo'),
    ]

    operations = [
        migrations.AddField(
            model_name='offre',
            name='contact',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='offres', to='client.contact'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='offre',
            name='montant',
            field=models.DecimalField(decimal_places=2, default=1, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='offre',
            name='relance',
            field=models.DateTimeField(blank=True, help_text="Date de la prochaine relance si l'offre n'est pas encore gagnée", null=True),
        ),
        migrations.AlterField(
            model_name='offre',
            name='statut',
            field=models.CharField(choices=[('BROUILLON', 'Brouillon'), ('ENVOYE', 'Envoyé'), ('GAGNE', 'Gagné'), ('PERDU', 'Perdu')], default='BROUILLON', max_length=20),
        ),
    ]
