# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0007_auto_20170709_0709'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='description',
            field=models.TextField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='recipeweek',
            name='week',
            field=models.SmallIntegerField(default=27),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='recipeweek',
            name='year',
            field=models.SmallIntegerField(default=2017),
            preserve_default=True,
        ),
    ]
