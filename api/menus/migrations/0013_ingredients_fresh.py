# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0012_auto_20170715_1054'),
    ]

    operations = [
        migrations.AddField(
            model_name='ingredients',
            name='fresh',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
