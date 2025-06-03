import re
from django.db import models
from django.contrib.auth.models import User
from django.forms import ValidationError

class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    class Meta:
        verbose_name = 'Родитель'
        verbose_name_plural = 'Родители'

    def clean(self):
        # Валидация номера телефона
        if self.phone_number and not re.match(r'^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$', self.phone_number):
            raise ValidationError({'phone_number': _('Формат телефона: +7(XXX)XXX-XX-XX')})

    def __str__(self):
        return f"Профиль родителя: {self.user.username}"


class Child(models.Model):
    parent = models.ForeignKey(ParentProfile, on_delete=models.CASCADE, related_name='children')
    full_name = models.CharField(max_length=255, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    group_name = models.CharField(max_length=255, blank=True)
    teacher_info = models.CharField(max_length=255, blank=True)
    
    class Meta:
        verbose_name = 'Ребёнок'
        verbose_name_plural = 'Дети'

    def clean(self):
        # Валидация номера телефона
        if self.phone_number and not re.match(r'^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$', self.phone_number):
            raise ValidationError({'phone_number': _('Формат телефона: +7(XXX)XXX-XX-XX')})

    def __str__(self):
        return f"{self.full_name} ({self.parent.user.username})"

class Request(models.Model):
    STATUS_CHOICES = [
        ('new', 'новая'),
        ('in_progress', 'в обработке'),
        ('completed', 'выполнена'),
        ('rejected', 'закрыта'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    text = models.TextField('Текст заявки')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='new')
    admin_comment = models.TextField('Комментарий администратора', blank=True, null=True)
    
    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Заявка #{self.id} от {self.user.username}"