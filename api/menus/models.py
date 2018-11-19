from django.db import models
from django.contrib.auth.models import User
import datetime
from datetime import date

class Season(models.Model):
	name = models.CharField(max_length=20, unique=True)

	def __str__(self):
		return str(self.id) + "-" + self.name

class PrimaryType(models.Model):
	name = models.CharField(max_length=120, unique=True)

	def __str__(self):
		return str(self.id) + "-" + self.name

class SecondaryType(models.Model):
	name = models.CharField(max_length=120, unique=True)

	def __str__(self):
		return str(self.id) + "-" + self.name

class Account(models.Model):
	name = models.CharField(max_length=150,unique=False)

	def __str__(self):
		return str(self.id) + " - " + self.name

class AccountUser(models.Model):
	account = models.ForeignKey(Account, blank=False, null=False, on_delete=models.PROTECT)
	user = models.OneToOneField(User, on_delete=models.CASCADE)

	def __str__(self):
		return str(self.account.name) + " - " + self.user.username

class Recipe(models.Model):
	name = models.CharField(max_length=64,blank=False,null=False)
	prepTime = models.SmallIntegerField(blank=True, null=True)
	cookTime = models.SmallIntegerField()
	filename = models.CharField(max_length=64, blank=False, null=True)
	description = models.TextField(blank=True, null=True)
	duplicate = models.BooleanField(default=False)
	season = models.ForeignKey(Season, blank=True, null=True, on_delete=models.PROTECT)
	primaryType = models.ForeignKey(PrimaryType, blank=True, null=True, on_delete=models.PROTECT)
	secondaryType = models.ForeignKey(SecondaryType, blank=True, null=True, on_delete=models.PROTECT)
	public = models.BooleanField(default=False, null=False)

	def __str__(self):
		return str(self.id) + " - " + self.name

class SupermarketCategory(models.Model):
	name = models.CharField(max_length=20, unique=True)

	def __str__(self):
		return self.name

class Ingredient(models.Model):
	name = models.CharField(max_length=64,unique=True)
	category = models.ForeignKey(SupermarketCategory, blank=False, default=8, on_delete=models.PROTECT)
	fresh = models.BooleanField(default=False)
	stockcode = models.IntegerField(null=True)
	cost = models.FloatField(null=True)
	public = models.BooleanField(default=False, null=False)

	def __str__(self):
		return self.name

class AccountRecipe(models.Model):
	account = models.ForeignKey(Account, blank=False, null=False, on_delete=models.PROTECT)
	recipe = models.ForeignKey(Recipe, blank=False, null=False, on_delete=models.PROTECT)
	archive = models.BooleanField(default=False)

class AccountIngredient(models.Model):
	account = models.ForeignKey(Account, blank=False, null=False, on_delete=models.PROTECT)
	ingredient = models.ForeignKey(Ingredient, blank=False, null=False, on_delete=models.PROTECT)
	category = models.ForeignKey(SupermarketCategory, blank=False, default=8, on_delete=models.PROTECT)
	fresh = models.BooleanField(default=False)
	stockcode = models.IntegerField(null=True)
	cost = models.FloatField(null=True)

class Preperation(models.Model):
	name = models.CharField(max_length=20,unique=True)

	def __str__(self):
		return self.name

class Measure(models.Model):
	name = models.CharField(max_length=20,unique=True)

	def __str__(self):
		return self.name

class RecipeIngredient(models.Model):
	recipe = models.ForeignKey(Recipe, blank=False, on_delete=models.PROTECT)
	ingredient = models.ForeignKey(Ingredient, blank=False, on_delete=models.PROTECT)
	preperation = models.ForeignKey(Preperation, blank=True, null=True, on_delete=models.PROTECT)

	quantity = models.CharField(max_length=16, unique=False)
	quantity4 = models.CharField(max_length=16, unique=False, blank=True)
	quantityMeasure = models.ForeignKey(Measure, unique=False, null=True, on_delete=models.PROTECT)

	primaryIngredient = models.BooleanField(default=False)

	def __str__(self):
		return self.recipe.name + " - " + self.ingredient.name

class RecipeWeek(models.Model):
	account = models.ForeignKey(Account, blank=False, null=False, on_delete=models.PROTECT)
	recipe = models.ForeignKey(Recipe, blank=False, on_delete=models.PROTECT)
	week = models.SmallIntegerField(blank=False, default=date.today().isocalendar()[1])
	year = models.SmallIntegerField(blank=False, default=datetime.datetime.now().year)

	def __str__(self):
		return str(self.year) + " - Week " + str(self.week) + " - " + self.recipe.name

class ShoppingList(models.Model):
	account = models.ForeignKey(Account, blank=False, null=False, on_delete=models.PROTECT)
	week = models.SmallIntegerField(blank=False, default=date.today().isocalendar()[1])
	year = models.SmallIntegerField(blank=False, default=datetime.datetime.now().year)
	fresh = models.BooleanField(default=False)
	recipeIngredient = models.ForeignKey(RecipeIngredient, blank=True, null=True, on_delete=models.PROTECT)
	name = models.CharField(max_length=40, blank=True)
	sort = models.SmallIntegerField(blank=False, default=0)
	cost = models.FloatField(blank=True, null=True)
	purchased = models.BooleanField(default=False)
