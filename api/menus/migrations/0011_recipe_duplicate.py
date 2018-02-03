# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0010_auto_20170713_1223'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='duplicate',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
