# Generated by Django 5.1.4 on 2025-03-17 18:44

from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('offres_app', '0007_remove_offreproduit_prix_unitaire_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='offre',
            name='montant',
            field=models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=15, verbose_name='Montant'),
        ),
    ]
