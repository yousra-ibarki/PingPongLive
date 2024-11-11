
#!/bin/bash
# Create migrations for django_otp and otp_email if they have changes
python manage.py makemigrations 

# Apply migrations
python manage.py migrate   # Migrate specific apps if needed
# pip install gunicorn uvicorn 

pip install "uvicorn[standard]"
pip install --upgrade uvicorn


# Run collectstatic to gather static files
# python manage.py collectstatic --noinput



# Start Daphne ASGI server
# daphne -b 0.0.0.0 -p 8000 myproject.asgi:application





# python manage.py runserver 0.0.0.0:8000
uvicorn myproject.asgi:application --host 0.0.0.0 --port 8000 --reload
# watchgod gunicorn -w 4 -k uvicorn.workers.UvicornWorker myproject.asgi:application -b 0.0.0.0:8000
# watchmedo auto-restart --patterns="*.py" --recursive -- gunicorn -w 4 -k uvicorn.workers.UvicornWorker myproject.asgi:application -b 0.0.0.0:8000


