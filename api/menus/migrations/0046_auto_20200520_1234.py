# Generated by Django 2.1.3 on 2020-05-20 12:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0045_auto_20200520_1206'),
    ]

    operations = [
        migrations.AddField(
            model_name='shoppinglist',
            name='supermarketCategory',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='menus.SupermarketCategory'),
        ),
    ]
