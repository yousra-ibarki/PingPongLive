from django.apps import AppConfig

class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'

    def ready(self):
        try:
            import myapp.signals
            print("Signals imported successfully!")
        except Exception as e:
            print(f"Error importing signals: {e}")