from django.db import models
import datetime
from datetime import date

# Create your models here.
# These models are taken from our menus.

class Season(models.Model):
	name = models.CharField(max_length=20, unique=True)

	def __str__(self):
		return str(self.id) + "-" + self.name

class PrimaryType(models.Model):
	name = models.CharField(max_length=20, unique=True)

	def __str__(self):
                return str(self.id) + "-" + self.name

class SecondaryType(models.Model):
        name = models.CharField(max_length=20, unique=True)

        def __str__(self):
                return str(self.id) + "-" + self.name


class Recipe(models.Model):
	name = models.CharField(max_length=64,unique=True)
	prepTime = models.SmallIntegerField(blank=True, null=True)
	cookTime = models.SmallIntegerField()
	front = models.CharField(max_length=64, blank=True, null=True)
	back = models.CharField(max_length=64, blank=True, null=True)
	description = models.TextField(blank=True, null=True)
	duplicate = models.BooleanField(default=False)
	season = models.ForeignKey(Season, blank=True, null=True, on_delete=models.PROTECT)
	primaryType = models.ForeignKey(PrimaryType, blank=True, null=True, on_delete=models.PROTECT)
	secondaryType = models.ForeignKey(SecondaryType, blank=True, null=True, on_delete=models.PROTECT)

	def __str__(self):
		return str(self.id) + " - " + self.name

class Feature(models.Model):
	name = models.CharField(max_length=20, unique=True)

	def __str__(self):
		return self.name

class RecipeFeature(models.Model):
	recipe = models.ForeignKey(Recipe, blank=False, on_delete=models.PROTECT)
	feature = models.ForeignKey(Feature, blank=False, on_delete=models.PROTECT)

	def __str__(self):
		return self.recipe.name + " - " + self.feature.name

class SupermarketCategory(models.Model):
	name = models.CharField(max_length=20, unique=True)

	def __str__(self):
		return self.name

class Ingredients(models.Model):
	name = models.CharField(max_length=64,unique=True)
	fresh = models.BooleanField(default=False)
	category = models.ForeignKey(SupermarketCategory, blank=False, default=8, on_delete=models.PROTECT)
	stockcode = models.IntegerField(null=True)
	cost = models.FloatField(null=True)

	def __str__(self):
		return self.name

class Preperation(models.Model):
	name = models.CharField(max_length=20,unique=True)

	def __str__(self):
		return self.name

class Measure(models.Model):
	name = models.CharField(max_length=20,unique=True)

	def __str__(self):
		return self.name

class RecipeIngredients(models.Model):
	recipe = models.ForeignKey(Recipe, blank=False, on_delete=models.PROTECT)
	ingredient = models.ForeignKey(Ingredients, blank=False, on_delete=models.PROTECT)
	preperation = models.ForeignKey(Preperation, blank=True, null=True, on_delete=models.PROTECT)

	quantity = models.CharField(max_length=16, unique=False)
	quantity4 = models.CharField(max_length=16, unique=False, blank=True)
	quantityMeasure = models.ForeignKey(Measure, unique=False, null=True, on_delete=models.PROTECT)

	primaryIngredient = models.BooleanField(default=False)

	def __str__(self):
		return self.recipe.name + " - " + self.ingredient.name

class RecipeWeek(models.Model):
	recipe = models.ForeignKey(Recipe, blank=False, on_delete=models.PROTECT)
	week = models.SmallIntegerField(blank=False, default=date.today().isocalendar()[1])
	year = models.SmallIntegerField(blank=False, default=datetime.datetime.now().year)

	def __str__(self):
		return str(self.year) + " - Week " + str(self.week) + " - " + self.recipe.name

class ShoppingList(models.Model):
	week = models.SmallIntegerField(blank=False, default=date.today().isocalendar()[1])
	year = models.SmallIntegerField(blank=False, default=datetime.datetime.now().year)
	fresh = models.BooleanField(default=False)
	recipeIngredient = models.ForeignKey(RecipeIngredients, blank=True, null=True, on_delete=models.PROTECT)
	name = models.CharField(max_length=40, blank=True)
	sort = models.SmallIntegerField(blank=False, default=0)
	cost = models.FloatField(blank=True, null=True)
	purchased = models.BooleanField(default=False)
