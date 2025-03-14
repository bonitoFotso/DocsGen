# Generated by Django 5.1.4 on 2025-01-31 12:12

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('client', '0001_initial'),
        ('document', '0008_alter_offre_client_alter_attestationformation_client_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Courrier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reference', models.CharField(max_length=50, unique=True, verbose_name='Référence')),
                ('doc_type', models.CharField(choices=[('LTR', 'Lettre'), ('DCE', 'Demande de Certificat'), ('ODV', 'Ordre de Virement'), ('CDV', 'Courrier de Virement'), ('BCM', 'Bon de Commande'), ('DAO', "Demande d'Approvisionnement"), ('ADV', 'Avis de Mission'), ('RPT', 'Rapport'), ('FCT', 'Facture'), ('DVS', 'Devis'), ('BDC', 'Bon de Commande'), ('CND', 'Conduite à Tenir'), ('RCL', 'Recouvrement'), ('RCV', 'Reçu'), ('RGL', 'Règlement')], max_length=3, verbose_name='Type de document')),
                ('date_creation', models.DateField(auto_now_add=True, verbose_name='Date de création')),
                ('notes', models.TextField(blank=True, null=True, verbose_name='Notes')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='client.client', verbose_name='Client')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Créé par')),
                ('entite', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='document.entity', verbose_name='Entité')),
            ],
            options={
                'verbose_name': 'Courrier',
                'verbose_name_plural': 'Courriers',
            },
        ),
    ]
