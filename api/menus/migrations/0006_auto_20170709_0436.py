# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0005_auto_20170709_0434'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='back',
            field=models.CharField(max_length=64, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='recipe',
            name='front',
            field=models.CharField(max_length=64, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='recipe',
            name='prepTime',
            field=models.SmallIntegerField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
