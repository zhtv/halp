from django.db import models
from django.contrib.auth.models import User

class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Профиль родителя: {self.user.username}"