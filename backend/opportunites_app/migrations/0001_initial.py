# Generated by Django 5.1.4 on 2025-04-03 08:28

import django.db.models.deletion
import django_fsm
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('client', '0011_alter_client_created_by_alter_client_updated_by_and_more'),
        ('document', '0026_delete_opportunite'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Opportunite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reference', models.CharField(blank=True, max_length=255, unique=True, verbose_name='Référence')),
                ('sequence_number', models.IntegerField(blank=True, null=True, verbose_name='Numéro de séquence')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Description')),
                ('besoins_client', models.TextField(blank=True, null=True, verbose_name='Besoins du client')),
                ('montant', models.DecimalField(decimal_places=2, max_digits=15, verbose_name='Montant')),
                ('montant_estime', models.DecimalField(decimal_places=2, max_digits=15, verbose_name='Montant estimé')),
                ('probabilite', models.IntegerField(default=0, help_text='Probabilité de conversion en %', verbose_name='Probabilité')),
                ('statut', django_fsm.FSMField(choices=[('PROSPECT', 'Prospect'), ('QUALIFICATION', 'Qualification'), ('PROPOSITION', 'Proposition'), ('NEGOCIATION', 'Négociation'), ('GAGNEE', 'Gagnée'), ('PERDUE', 'Perdue')], default='PROSPECT', max_length=20, verbose_name='Statut')),
                ('date_creation', models.DateTimeField(auto_now_add=True, verbose_name='Date de création')),
                ('date_detection', models.DateTimeField(auto_now_add=True, verbose_name='Date de détection')),
                ('date_modification', models.DateTimeField(auto_now=True, verbose_name='Date de modification')),
                ('date_cloture', models.DateTimeField(blank=True, null=True, verbose_name='Date de clôture')),
                ('relance', models.DateTimeField(blank=True, help_text='Date de la prochaine relance', null=True, verbose_name='Date de relance')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='opportunites', to='client.client', verbose_name='Client')),
                ('contact', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='opportunites', to='client.contact', verbose_name='Contact principal')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='opportunites_crees', to=settings.AUTH_USER_MODEL, verbose_name='Créé par')),
                ('entity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='opportunites', to='document.entity', verbose_name='Entité')),
                ('produit_principal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='opportunites_principales', to='document.product', verbose_name='Produit principal')),
                ('produits', models.ManyToManyField(related_name='opportunites', to='document.product', verbose_name='Produits')),
            ],
            options={
                'verbose_name': 'Opportunité',
                'verbose_name_plural': 'Opportunités',
                'ordering': ['-date_creation'],
                'indexes': [models.Index(fields=['statut'], name='opportunite_statut_0b59c8_idx'), models.Index(fields=['client'], name='opportunite_client__481dd4_idx'), models.Index(fields=['entity'], name='opportunite_entity__e70276_idx'), models.Index(fields=['date_creation'], name='opportunite_date_cr_dc9172_idx'), models.Index(fields=['relance'], name='opportunite_relance_afd625_idx')],
            },
        ),
    ]
