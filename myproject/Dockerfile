# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Create a non-root user for celery
RUN groupadd -g 1000 celeryuser && \
    useradd -m -u 1000 -g celeryuser celeryuser && \
    chown -R celeryuser:celeryuser /app


# Copy requirements.txt to the container
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt


# Copy the current directory contents into the container at /app
COPY . /app

# Expose the port Django will run on
EXPOSE 8000

# Run Django's development server
CMD ["sh", "script.sh"]
