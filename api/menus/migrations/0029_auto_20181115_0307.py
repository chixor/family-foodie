# Generated by Django 2.1.3 on 2018-11-15 03:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0028_auto_20181115_0306'),
    ]

    operations = [
        migrations.RenameField(
            model_name='accountuser',
            old_name='accountId',
            new_name='account',
        ),
        migrations.RenameField(
            model_name='accountuser',
            old_name='name',
            new_name='user',
        ),
    ]
