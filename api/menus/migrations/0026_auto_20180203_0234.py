# Generated by Django 2.0.1 on 2018-02-03 02:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('menus', '0025_auto_20180203_0224'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shoppinglist',
            name='recipeIngredient',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='menus.RecipeIngredients'),
        ),
    ]
