#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input   # solo si usas el admin con whitenoise
python manage.py migrate
