# Generated by Django 2.0.1 on 2018-02-02 05:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0020_auto_20180202_0513'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredients',
            name='stockcode',
            field=models.IntegerField(null=True),
        ),
    ]
