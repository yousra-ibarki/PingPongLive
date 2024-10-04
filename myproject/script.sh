#!/bin/bash

# Make migrations
python manage.py makemigrations
python manage.py migrate

# Optional: Migrate specific apps like django_otp and otp_email if needed
python manage.py makemigrations django_otp otp_email
python manage.py migrate otp_email

# Check if the admin user exists before creating it
echo "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
" | python manage.py shell

# Collect static files without prompting for input
python manage.py collectstatic --noinput

# Run the server
python manage.py runserver 0.0.0.0:8000
