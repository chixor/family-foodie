# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0004_auto_20170709_0433'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='prepTime',
            field=models.SmallIntegerField(null=True),
            preserve_default=True,
        ),
    ]
