# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0014_auto_20170716_0332'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipeweek',
            name='cost',
            field=models.FloatField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
