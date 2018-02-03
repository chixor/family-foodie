# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0006_auto_20170709_0436'),
    ]

    operations = [
        migrations.CreateModel(
            name='RecipeWeek',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('week', models.SmallIntegerField()),
                ('year', models.SmallIntegerField()),
                ('recipe', models.ForeignKey(to='menus.Recipe', on_delete=models.PROTECT)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='recipehistory',
            name='date',
            field=models.DateField(),
            preserve_default=True,
        ),
    ]
