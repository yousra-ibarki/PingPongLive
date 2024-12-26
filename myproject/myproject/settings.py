from pathlib import Path
import os
from datetime import timedelta

# Security settings
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
SECURE_SSL_REDIRECT = False  # Set to False because nginx handles SSL
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True


# Celery Configuration
CELERY_BROKER_URL = 'redis://redis:6379/0'
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Add this for periodic tasks
CELERY_BEAT_SCHEDULE = {
    'check-inactive-users': {
        'task': 'myapp.tasks.check_inactive_users',
        'schedule': 120.0,  # Run every 2 minutes
    },
}


# Get the host IP from environment variable
HOST_IP = os.environ.get('HOST_IP', '127.0.0.1')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

SECRET_KEY = 'django-insecure--h=cqz(qkelnee=8**6s22ry0hz75*t36-mwtu&j&p)$=17r&$'
DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'backend', 'backend:8000', HOST_IP]

SITE_ID = 1

AUTH_USER_MODEL = 'myapp.User'

ASGI_APPLICATION = 'myproject.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('redis', 6379)],  # 'redis' is the name of the Redis service in Docker Compose
            'capacity': 1000,
        },
    },
}


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.messages',
    'django.contrib.sessions',
    'livereload', # remove this line if you don't want to use livereload
    'django.contrib.staticfiles',
    'rest_framework',
    'myapp',
    # 'myapp.apps.MyappConfig',
    'chat',
    'game',
    'rest_framework_simplejwt',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'channels',
    'channels_redis',
    'corsheaders',
    'rest_framework.authtoken', 
    'django_prometheus',
    'rest_framework_simplejwt.token_blacklist',
]


CORS_ALLOWED_ORIGINS = [
    f"http://{HOST_IP}:8001",
    "http://127.0.0.1:8001",
]

# CSRF_COOKIE_HTTPONLY = False  # This should be False so that frontend can access it

# CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1:8001", "http://localhost:8001"]  # Add frontend origin here

# CORS_ALLOW_CREDENTIALS = True # This should be True so that frontend can access the CSRF cookie. CORS policy should allow the frontend origin 

# CORS_ORIGIN_ALLOW_ALL = True  # Turn off allowing all origins for security

# For development only
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True


AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'myapp.CustomJWTAuthentication.CustomJWTAuthentication',
    ],
}

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_otp.middleware.OTPMiddleware',
    'livereload.middleware.LiveReloadScript',
    'myapp.middleware.auth.RefreshTokenMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]

ROOT_URLCONF = 'myproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'myproject.wsgi.application'

DATABASES = {
    'default': {

        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ["POSTGRES_DB"],
        'USER': os.environ["POSTGRES_USER"],
        'PASSWORD': os.environ["POSTGRES_PASSWORD"],
        'HOST': 'myproject_db',
        'PORT': '5432',
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Add this to specify where Django should look for static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}


STATE42 = 'ajghfkhsfkhsfshg'