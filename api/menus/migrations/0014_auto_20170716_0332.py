# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0013_ingredients_fresh'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredients',
            name='name',
            field=models.CharField(unique=True, max_length=64),
            preserve_default=True,
        ),
    ]
