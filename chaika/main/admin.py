from django.contrib import admin
from .models import ParentProfile, Child, Request

# Register your models here.
admin.site.register(ParentProfile)
admin.site.register(Child)
admin.site.register(Request)