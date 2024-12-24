# Redis configuration
REDIS_HOST = 'redis'
REDIS_PORT = 6379

# Celery Configuration
CELERY_BROKER_URL = 'redis://redis:6379/0'  # Using DB 0 for Celery broker
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'  # Using DB 0 for Celery results

# Channel Layers Configuration
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(REDIS_HOST, REDIS_PORT, 2)],  # Using DB 2 for channels
            'capacity': 1000,
        },
    },
}

# Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',  # Using DB 1 for cache
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
            'CONNECTION_POOL_CLASS': 'redis.BlockingConnectionPool',
            'CONNECTION_POOL_CLASS_KWARGS': {
                'max_connections': 50,
                'timeout': 20,
            },
            'SOCKET_CONNECT_TIMEOUT': 5,  # in seconds
            'SOCKET_TIMEOUT': 5,  # in seconds
        },
        'KEY_PREFIX': 'djcache',  # Add a prefix to all keys
    }
}