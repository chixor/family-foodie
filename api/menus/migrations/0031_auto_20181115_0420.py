# Generated by Django 2.1.3 on 2018-11-15 04:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0030_auto_20181115_0317'),
    ]

    operations = [
        migrations.CreateModel(
            name='AccountIngredient',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fresh', models.BooleanField(default=False)),
                ('stockcode', models.IntegerField(null=True)),
                ('cost', models.FloatField(null=True)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='menus.Account')),
                ('ingredient', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='menus.Ingredient')),
            ],
        ),
        migrations.CreateModel(
            name='AccountRecipe',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='menus.Account')),
            ],
        ),
        migrations.AddField(
            model_name='recipe',
            name='public',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='recipeweek',
            name='account',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='menus.Account'),
        ),
        migrations.AddField(
            model_name='shoppinglist',
            name='account',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='menus.Account'),
        ),
        migrations.AddField(
            model_name='accountrecipe',
            name='recipe',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='menus.Recipe'),
        ),
    ]
