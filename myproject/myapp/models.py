from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

class Profile(AbstractUser):
    # other fields
    # image = models.ImageField(upload_to='media',  null=True, blank=True)
    image = models.URLField(max_length=255, null=True, blank=True)
    matche_history = models.ManyToManyField('MatchHistory', related_name='match_history', blank=True)
    achievements = models.ManyToManyField('Achievement', related_name='achievements', blank=True)


    def __str__(self):
        return self.username

    def win_rate(self):
        total_matches = self.match_history.count()
        if total_matches == 0:
            return 0
        wins = self.match_history.filter(result='Win').count()
        return (wins / total_matches) * 100

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

class MatchHistory(models.Model):
    class ResultChoices(models.TextChoices):
        WIN = 'Win', 'Win'
        LOSS = 'Loss', 'Loss'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    match = models.CharField(max_length=255)
    result = models.CharField(max_length=4, choices=ResultChoices.choices)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.match} - {self.result}"

    class Meta:
        ordering = ['-date']
        unique_together = ['user', 'match']

class Achievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    achievement = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    icon = models.URLField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.achievement} - {self.user.username}"

    class Meta:
        ordering = ['-date']
        unique_together = ['user', 'achievement']

# after making a new model or making changes to a models we use:
# python manage.py makemigrations
# python manage.py migrate