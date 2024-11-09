
# #!/bin/bash

# # Apply migrations
# python manage.py migrate   # Migrate specific apps if needed

# # Create migrations for django_otp and otp_email if they have changes
# python manage.py makemigrations 

# # Run collectstatic to gather static files
# # python manage.py collectstatic --noinput



# # Start Daphne ASGI server
# daphne -b 0.0.0.0 -p 8000 myproject.asgi:application
