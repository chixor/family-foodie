from django.contrib import admin

from .models import *

# Register your models here.

admin.site.register(Recipe)
admin.site.register(Ingredients)
admin.site.register(Preperation)
admin.site.register(RecipeIngredients)
admin.site.register(RecipeWeek)
admin.site.register(Feature)
admin.site.register(RecipeFeature)
admin.site.register(Measure)
admin.site.register(Season)
admin.site.register(PrimaryType)
admin.site.register(SecondaryType)
