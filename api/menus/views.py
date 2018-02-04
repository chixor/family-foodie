from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from .models import Recipe, RecipeIngredients, Measure, Ingredients, RecipeWeek, ShoppingList
from django.http import HttpResponse
from django.template import loader
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.contrib.auth.models import User
import json


def return_403(func):
    def _dec(*args, **kwargs):
        if not args[0].user.is_authenticated:
            return HttpResponseForbidden()
        else:
            return func(*args, **kwargs)
    return _dec

# Create your views here.

@login_required
def Index(request):
    template = loader.get_template('index.html')
    return HttpResponse(template.render({}, request))

@return_403
def RecipeList(request):
    recipes = Recipe.objects.filter(duplicate=False).values('id','name','front','description','season','primaryType','secondaryType','prepTime','cookTime').order_by('name')
    for recipe in recipes:
        recipe['ingredients'] = ''
        ingredients = RecipeIngredients.objects.filter(recipe=recipe['id']).values('ingredient')
        for ingredient in ingredients:
            ingname = Ingredients.objects.get(id=ingredient['ingredient']).name
            recipe['ingredients'] = recipe['ingredients'] + ingname + ', '

    return JsonResponse(dict(result=list(recipes)))

@return_403
def MeasureList(request):
    return JsonResponse(dict(result=list(Measure.objects.values('name').order_by('name'))))

@return_403
def IngredientList(request):
    return JsonResponse(dict(result=list(Ingredients.objects.values('id','name','category__id','category__name','cost','stockcode').order_by('category__id','name'))))

@return_403
def RecipeDetail(request,pk):
    recipes = Recipe.objects.filter(duplicate=False).values('id','name','front','back','description','season','primaryType','secondaryType','prepTime','cookTime').filter(id=pk)

    return JsonResponse(dict(result=list(recipes)))

@return_403
def RecipeIngredientsList(request,pk):
    if request.method=='GET':
        ingredients = RecipeIngredients.objects.filter(recipe=pk).values('recipe','ingredient','quantity','quantity4','quantityMeasure')
        for ing in ingredients:
            ing['quantityMeasure'] = Measure.objects.get(id=ing['quantityMeasure']).name
            ingobj = Ingredients.objects.get(id=ing['ingredient'])
            ing['ingredient'] = ingobj.name
            ing['fresh'] = ingobj.fresh

        return JsonResponse(dict(result=list(ingredients)))

    if request.method=='PUT':
        RecipeIngredients.objects.filter(recipe=pk).delete()
        body = json.loads(request.body)
        for ingredient in body['data']['ingredients']:
            rea = Recipe.objects.get(id=pk)
            try:
                ing = Ingredients.objects.get(name=ingredient['ingredient'])
                ing.fresh = ingredient['fresh']
                ing.save()
            except ObjectDoesNotExist:
                ing = Ingredients.objects.create(name=ingredient['ingredient'],fresh=ingredient['fresh'])
            mea = Measure.objects.get(name=ingredient['measurement'])
            RecipeIngredients.objects.create(recipe=rea,quantity=ingredient['two'],quantity4=ingredient['four'],quantityMeasure=mea,ingredient=ing)

    if request.method=='DELETE':
        RecipeIngredients.objects.filter(recipe=pk).delete()

    response = HttpResponse()
    response['allow'] = "get, post, put, delete, options"
    return response

@return_403
def RecipeWeekList(request):
    week_ids = RecipeWeek.objects.order_by('-year','-week').values('week','year').distinct()
    for week in week_ids:
        week['cost'] = ShoppingList.objects.filter(week=week['week'],year=week['year'],fresh=True).aggregate(Sum('cost'))['cost__sum']
        recipes = RecipeWeek.objects.values('recipe').filter(week=week['week'],year=week['year'])
        week['recipes'] = list(Recipe.objects.filter(duplicate=False).values('id','name','front','description','season','primaryType','secondaryType','prepTime','cookTime').filter(id__in=recipes))

        for recipe in week['recipes']:
            recipe['cost'] = ShoppingList.objects.filter(week=week['week'],year=week['year'],fresh=True,recipeIngredient__recipe_id=recipe['id']).aggregate(Sum('cost'))['cost__sum']

    return JsonResponse(dict(result=list(week_ids)))

@return_403
def ShoppingLister(request, year, week):
    def getList(fresh):
        shoppinglist = list(ShoppingList.objects.filter(week=week,year=year,fresh=fresh).order_by('sort').values('id', 'cost', 'fresh', 'name', 'recipeIngredient_id', 'purchased'))
        for ing in shoppinglist:
            if ing['recipeIngredient_id'] is not None:
                recipe = RecipeIngredients.objects.get(id=ing['recipeIngredient_id'])
                ing['category'] = recipe.ingredient.category.name
                ing['ingredient'] = recipe.ingredient.name
                ing['quantityMeasure'] = recipe.quantityMeasure.name
                ing['quantity'] = recipe.quantity
                ing['quantity4'] = recipe.quantity4
                ing['stockcode'] = recipe.ingredient.stockcode
            else:
                ing['ingredient'] = ing['name']

        return shoppinglist


    if request.method=='GET':
        shoppinglistcount = ShoppingList.objects.filter(week=week,year=year).count()

        # load from ingredients and recipes tables
        if shoppinglistcount == 0:
            generateShoppingList(week,year)

        return JsonResponse(dict(result={'fresh': getList(True), 'pantry': getList(False)}))

    if request.method=='PUT':
        body = json.loads(request.body)
        sort = 0;
        if 'ingredients' in body['data']:
            for ingredient in body['data']['ingredients']:
                if 'recipeIngredient_id' in ingredient and ingredient['recipeIngredient_id'] is not None:
                    ShoppingList.objects.filter(pk=ingredient['id']).update(fresh=ingredient['fresh'], cost=ingredient['cost'], sort=sort)
                else:
                    ShoppingList.objects.filter(pk=ingredient['id']).update(fresh=ingredient['fresh'], sort=sort)
                sort = sort + 1
        elif 'purchased' in body['data']:
            ShoppingList.objects.filter(pk=body['data']['id']).update(purchased=body['data']['purchased'])

    if request.method=='POST':
        body = json.loads(request.body)
        result = ShoppingList.objects.create(week=week, year=year, fresh=True, name=body['data']['name'], sort=body['data']['sort'], purchased=False)
        return JsonResponse(dict(id=result.id))

    if request.method=='DELETE':
        body = json.loads(request.body)
        if 'id' in body:
            ShoppingList.objects.get(pk=body['id']).delete()
        elif 'reset' in body:
            ShoppingList.objects.filter(week=week,year=year).delete()

    response = HttpResponse()
    response['allow'] = "get, put, delete, post, options"
    return response

def generateShoppingList(week, year):
    recipes = RecipeWeek.objects.filter(week=week,year=year).values('recipe').order_by('id')
    allIngredients = list()
    for recipe in recipes:
        ingredients = RecipeIngredients.objects.filter(recipe=recipe['recipe']).values('id','recipe','ingredient','quantity','quantity4','quantityMeasure')
        for ing in ingredients:
            ingobj = Ingredients.objects.get(id=ing['ingredient'])
            ing['name'] = ingobj.name
            ing['fresh'] = ingobj.fresh
            ing['cost'] = ingobj.cost
            ing['category'] = ingobj.category.id

        allIngredients = allIngredients + list(ingredients)

    allIngredients.sort(key=lambda x: (x['fresh'], x['category'], x['name']))
    sort = 0
    for ingredient in allIngredients:
        ing = ShoppingList.objects.create(week=week, year=year, fresh=ingredient['fresh'], recipeIngredient=RecipeIngredients.objects.get(id=ingredient['id']), cost=ingredient['cost'], sort=sort)
        sort = sort + 1

@return_403
def RecipeWeekDetail(request, year, week):
    if request.method=='GET':
        weeks_list = RecipeWeek.objects.filter(week=week,year=year).values('recipe').order_by('id')
        recipes = Recipe.objects.filter(duplicate=False,id__in=weeks_list)

        return JsonResponse(dict(result=list(recipes.values('id','name','front','description','season','primaryType','secondaryType','prepTime','cookTime'))))

    if request.method=='PUT':
        RecipeWeek.objects.filter(week=week,year=year).delete()
        body = json.loads(request.body)
        for recipe in body['data']['recipes']:
            RecipeWeek.objects.create(week=week,year=year,recipe_id=recipe['id'])

        ShoppingList.objects.filter(week=week,year=year).delete()
        generateShoppingList(week,year)

    if request.method=='DELETE':
        RecipeWeek.objects.filter(week=week,year=year).delete()

    response = HttpResponse()
    response['allow'] = "get, post, put, delete, options"
    return response

@return_403
def RecipeWeekListTest(request):
	try:
		rw = RecipeWeek.objects.get(week=request.GET.get('week', False))
	except ObjectDoesNotExist:
		rw = RecipeWeek.objects

	r = rw.recipe.name
	w = rw.week
	y = rw.year

	return JsonResponse(dict(result=list(rw)))
