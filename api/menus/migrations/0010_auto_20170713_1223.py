# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0009_auto_20170713_1213'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recipehistory',
            name='recipe',
        ),
        migrations.DeleteModel(
            name='RecipeHistory',
        ),
    ]
