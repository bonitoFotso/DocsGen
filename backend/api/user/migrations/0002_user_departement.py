# Generated by Django 5.1.4 on 2025-01-23 18:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_user', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='departement',
            field=models.CharField(choices=[('IT', 'IT'), ('HR', 'HR'), ('Inspection', 'Inspection'), ('Admin', 'Admin'), ('Formation', 'Formation')], default='IT', max_length=255),
        ),
    ]
