# Generated by Django 2.1.3 on 2018-11-19 02:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0040_accountingredient_category'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='accountingredient',
            name='category',
        ),
    ]