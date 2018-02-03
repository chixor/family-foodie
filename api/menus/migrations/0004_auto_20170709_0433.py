# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0003_auto_20170709_0319'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='cookTime',
            field=models.SmallIntegerField(),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='recipe',
            name='prepTime',
            field=models.SmallIntegerField(),
            preserve_default=True,
        ),
    ]
