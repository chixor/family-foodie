from django.contrib import admin

from .models import *

# Register your models here.

admin.site.register(Account)
admin.site.register(AccountUser)
admin.site.register(AccountRecipe)
admin.site.register(Recipe)
admin.site.register(Ingredient)
admin.site.register(Preperation)
admin.site.register(RecipeIngredient)
admin.site.register(RecipeWeek)
admin.site.register(Measure)
admin.site.register(SupermarketCategory)
admin.site.register(Season)
admin.site.register(PrimaryType)
admin.site.register(SecondaryType)
