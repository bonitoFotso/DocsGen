# Generated by Django 5.1.4 on 2025-02-18 09:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('client', '0007_alter_client_telephone_alter_contact_telephone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client',
            name='bp',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='Boîte Postale'),
        ),
        migrations.AlterField(
            model_name='contact',
            name='mobile',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='Mobile'),
        ),
    ]
