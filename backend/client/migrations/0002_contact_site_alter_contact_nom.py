# Generated by Django 5.1.4 on 2025-02-06 07:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('client', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='contact',
            name='site',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='contacts', to='client.site', verbose_name='Site associé'),
        ),
        migrations.AlterField(
            model_name='contact',
            name='nom',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Nom'),
        ),
    ]
