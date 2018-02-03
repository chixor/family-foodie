# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0011_recipe_duplicate'),
    ]

    operations = [
        migrations.CreateModel(
            name='Measure',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=20)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='recipeingredients',
            name='quantity4',
            field=models.CharField(max_length=16, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='recipeingredients',
            name='quantityMeasure',
            field=models.ForeignKey(to='menus.Measure', null=True, on_delete=models.PROTECT),
            preserve_default=True,
        ),
    ]
