# Generated by Django 5.2.1 on 2025-05-30 09:42

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_child'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='child',
            name='group',
        ),
        migrations.AddField(
            model_name='child',
            name='group_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='child',
            name='full_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='child',
            name='parent',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='children', to='main.parentprofile'),
        ),
        migrations.AlterField(
            model_name='child',
            name='teacher_info',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
