#!/bin/bash
export DJANGO_SETTINGS_MODULE=KES_DocGen.settings
python manage.py migrate
python manage.py seed_docs  # Use fixtures instead of seed script
exec python manage.py runserver 0.0.0.0:8000