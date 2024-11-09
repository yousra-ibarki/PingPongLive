# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Copy requirements.txt to the container
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
# RUN python manage.py migrate 
# RUN python manage.py makemigrations 


# Copy the current directory contents into the container at /app
COPY . /app

# Make script.sh executable
# RUN chmod +x /app/script.sh

# Expose the port Django will run on
EXPOSE 8000

# Run Django's development server
# CMD ["sh", "script.sh"]

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "myproject.asgi:application"]
