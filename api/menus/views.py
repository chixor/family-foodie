from django.shortcuts import render, redirect
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from .models import Account, AccountUser, AccountRecipe, AccountIngredient, Recipe, RecipeIngredient, Measure, SupermarketCategory, PantryCategory, Ingredient, RecipeWeek, ShoppingList, Season, PrimaryType, SecondaryType
from .forms import SignUpForm
from django.http import HttpResponse
from django.template import loader
from django.http import HttpResponseForbidden
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q, F, Sum, Count, Min, Max
from datauri import DataURI
from django.conf import settings
import os
import shutil
import json

BASE_DIR = settings.BASE_DIR

def return_403(func):
    def _dec(*args, **kwargs):
        if not args[0].user.is_authenticated:
            return HttpResponseForbidden()
        else:
            return func(*args, **kwargs)
    return _dec

# User authentication and signup

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            # create user
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)

            # create family foodie account and link user, recipes and ingredients
            account_name = form.cleaned_data.get('last_name') + ' Family'
            account = Account.objects.create(name=account_name)
            accUser = AccountUser.objects.create(account=account,user=user)
            publicRecipes = Recipe.objects.filter(public=True, duplicate=False)
            for recipe in publicRecipes:
                AccountRecipe.objects.create(account=account,recipe=recipe);
            publicIngredients = Ingredient.objects.filter(public=True)
            for ingredient in publicIngredients:
                AccountIngredient.objects.create(account=account,ingredient=ingredient,supermarketCategory=ingredient.supermarketCategory,pantryCategory=ingredient.pantryCategory,fresh=ingredient.fresh,stockcode=ingredient.stockcode,cost=ingredient.cost);

            # authenticate and send to account page
            login(request, user)
            return redirect('/')
    else:
        form = SignUpForm()

    return render(request, 'registration/signup.html', {'form': form})

# Core feature set

#@login_required
def Index(request):
    if request.user.is_authenticated:
        template = loader.get_template('index.html')
    else:
        template = loader.get_template('home.html')
    return HttpResponse(template.render({}, request))

@return_403
def User(request):
    account = Account.objects.filter(accountuser__user=request.user).first()
    return JsonResponse(dict(result={ 'account': account.name, 'username': request.user.username }))

@return_403
def MyRecipeList(request):
    account = AccountUser.objects.get(user=request.user).account
    recipes = Recipe.objects.filter(duplicate=False, accountrecipe__account=account, accountrecipe__archive=False).values('id','name','filename','description','season','primaryType','secondaryType','prepTime','cookTime').order_by('name')
    for recipe in recipes:
        recipe['ingredients'] = ''
        ingredients = RecipeIngredient.objects.filter(recipe=recipe['id']).values('ingredient')
        for ingredient in ingredients:
            ingname = Ingredient.objects.get(id=ingredient['ingredient']).name
            recipe['ingredients'] = recipe['ingredients'] + ingname + ', '

    return JsonResponse(dict(result=list(recipes)))

@return_403
def RecipeList(request):
    account = AccountUser.objects.get(user=request.user).account
    myRecipes = Recipe.objects.filter(duplicate=False, accountrecipe__account=account, accountrecipe__archive=False).values('id','name','filename','description','season','primaryType','secondaryType','prepTime','cookTime').order_by('name')
    for recipe in myRecipes:
        weeks = RecipeWeek.objects.filter(account=account,recipe__id=recipe['id']).count()
        recipe['canDelete'] = False
        if weeks == 0:
            recipe['canDelete'] = True

        recipe['ingredients'] = ''
        ingredients = RecipeIngredient.objects.filter(recipe=recipe['id']).values('ingredient')
        for ingredient in ingredients:
            ingname = Ingredient.objects.get(id=ingredient['ingredient']).name
            recipe['ingredients'] = recipe['ingredients'] + ingname + ', '

    archiveRecipes = Recipe.objects.filter(duplicate=False, accountrecipe__account=account, accountrecipe__archive=True).values('id','name','filename','description','season','primaryType','secondaryType','prepTime','cookTime').order_by('name')
    publicRecipes = Recipe.objects.filter(duplicate=False, public=True).values('id','name','filename','description','season','primaryType','secondaryType','prepTime','cookTime').order_by('name')

    return JsonResponse(dict(myRecipes=list(myRecipes), archiveRecipes=list(archiveRecipes), publicRecipes=list(publicRecipes)))

@return_403
def MeasureList(request):
    measureIngredients = list(Measure.objects.values('name').order_by('name'))
    season = list(Season.objects.values('name'))
    primaryType = list(PrimaryType.objects.values('name'))
    secondaryType = list(SecondaryType.objects.values('name'))
    return JsonResponse(dict(result={'measure': measureIngredients, 'season': season, 'primaryType': primaryType, 'secondaryType': secondaryType}))

@return_403
def SupermarketCategoryList(request):
    categories = SupermarketCategory.objects.values('id','name').order_by('id')
    return JsonResponse(dict(result=list(categories)))

@return_403
def PantryCategoryList(request):
    categories = PantryCategory.objects.values('id','name').order_by('id')
    return JsonResponse(dict(result=list(categories)))

@return_403
def IngredientList(request):
    if request.method=='GET':
        return JsonResponse(dict(result=list(AccountIngredient.objects.filter(account__accountuser__user=request.user).values('ingredient_id','ingredient__name','supermarketCategory__id','supermarketCategory__name','pantryCategory__id','pantryCategory__name','pantryCategory__id','pantryCategory__name','fresh','cost','stockcode').order_by('supermarketCategory__id','ingredient__name'))))

    if request.method=='POST':
        account = AccountUser.objects.get(user=request.user).account
        body = json.loads(request.body.decode('utf-8'))
        details = body['data']['ingredient']
        ingredient = Ingredient.objects.create(name=details['name'],fresh=details['fresh'],cost=details['cost'],stockcode=details['stockcode'],supermarketCategory_id=details['supermarketCategory'],pantryCategory_id=details['pantryCategory'],public=False)
        AccountIngredient.objects.create(account=account,ingredient=ingredient,supermarketCategory_id=details['supermarketCategory'],pantryCategory_id=details['pantryCategory'],cost=details['cost'],fresh=details['fresh'],stockcode=details['stockcode'])
        return JsonResponse(dict(result=list(AccountIngredient.objects.filter(account__accountuser__user=request.user,ingredient=ingredient).values('ingredient_id','ingredient__name','supermarketCategory__id','supermarketCategory__name','pantryCategory__id','pantryCategory__name','pantryCategory__id','pantryCategory__name','fresh','cost','stockcode'))))

    response = HttpResponse()
    response['allow'] = "get, post, options"
    return response


@return_403
def IngredientDetail(request,pk):
    if request.method=='PUT':
        body = json.loads(request.body.decode('utf-8'))
        details = body['data']['ingredient']
        save = AccountIngredient.objects.filter(account__accountuser__user=request.user,ingredient_id=pk).update(supermarketCategory=details['supermarketCategory'],pantryCategory=details['pantryCategory'],cost=details['cost'],fresh=details['fresh'],stockcode=details['stockcode'])

    response = HttpResponse()
    response['allow'] = "put, options"
    return response

@return_403
def RecipeDetail(request,pk):
    if request.method=='GET':
        recipe = Recipe.objects.filter(id=pk,duplicate=False,accountrecipe__account__accountuser__user=request.user).values('id','name','filename','description','season__name','primaryType__name','secondaryType__name','prepTime','cookTime')
        return JsonResponse(dict(result=list(recipe)))

    if request.method=='PUT':
        try:
            body = json.loads(request.body.decode('utf-8'))
            details = body['data']['details']
            primaryType = PrimaryType.objects.get(name=details['primaryType'])
            secondaryType = SecondaryType.objects.get(name=details['secondaryType'])
            season = None
            deleteIngredients = body['data']['deleteIngredients']
            if details['season'] :
                season = Season.objects.get(name=season)

            account = AccountUser.objects.get(user=request.user).account
            recipe = Recipe.objects.get(accountrecipe__account=account,id=pk)

            # are we editing a public recipe? If so, make a deep copy
            if recipe.public:
                old_recipe_filename = recipe.filename
                recipe.pk = None
                recipe.public = False
                recipe.save()
                recipe.filename = filename='{0:08d}'.format(recipe.id)
                recipe.save()

                # copy files
                shutil.copy(BASE_DIR+'/build/assets/resources/'+old_recipe_filename+'.jpg',BASE_DIR+'/build/assets/resources/'+recipe.filename+'.jpg')
                shutil.copy(BASE_DIR+'/public/assets/resources/'+old_recipe_filename+'.jpg',BASE_DIR+'/public/assets/resources/'+recipe.filename+'.jpg')
                shutil.copy(BASE_DIR+'/build/assets/resources/'+old_recipe_filename+'.pdf',BASE_DIR+'/build/assets/resources/'+recipe.filename+'.pdf')
                shutil.copy(BASE_DIR+'/public/assets/resources/'+old_recipe_filename+'.pdf',BASE_DIR+'/public/assets/resources/'+recipe.filename+'.pdf')

                # copy ingredients and update shopping lists
                ris = RecipeIngredient.objects.filter(recipe_id=pk)
                deleteIngredients = []
                for ri in ris:
                    old_ri = ri.id
                    ri.pk = None
                    ri.recipe = recipe
                    ri.save()
                    ShoppingList.objects.filter(account=account,recipeIngredient_id=old_ri).update(recipeIngredient=ri)
                    try:
                        index = body['data']['deleteIngredients'].index(old_ri)
                        deleteIngredients.append(ri.id)
                    except:
                        pass

                # update account reference and old plans
                AccountRecipe.objects.filter(account=account,recipe_id=pk).update(recipe=recipe)
                RecipeWeek.objects.filter(account=account,recipe_id=pk).update(recipe=recipe)

            # now we can go ahead and perform the update
            Recipe.objects.filter(id=recipe.id).update(name=details['name'],description=details['description'],prepTime=details['prepTime'],cookTime=details['cookTime'],primaryType=primaryType,secondaryType=secondaryType,season=season)

            # replace the image
            if 'image' in details:
                image = DataURI(details['image'])
                if(len(image.data) <= 1000000):
                    path = '/assets/resources/'+recipe.filename+'.jpg'
                    if os.path.exists(BASE_DIR+'/build'+path):
                        os.remove(BASE_DIR+'/build'+path)
                        os.remove(BASE_DIR+'/public'+path)
                    with open(BASE_DIR+'/build'+path, 'wb+') as file:
                        file.write(image.data)
                    with open(BASE_DIR+'/public'+path, 'wb+') as file:
                        file.write(image.data)

            # replace the pdf
            if 'pdf' in details:
                pdf = DataURI(details['pdf'])
                if(len(pdf.data) <= 1000000):
                    path = '/assets/resources/'+recipe.filename+'.pdf'
                    if os.path.exists(BASE_DIR+'/build'+path):
                        os.remove(BASE_DIR+'/build'+path)
                        os.remove(BASE_DIR+'/public'+path)
                    with open(BASE_DIR+'/build/'+path, 'wb+') as file:
                        file.write(pdf.data)
                    with open(BASE_DIR+'/public/'+path, 'wb+') as file:
                        file.write(pdf.data)

            # update ingredients
            for ingredient in deleteIngredients:
                ing = Ingredient.objects.get(recipeingredient__id=ingredient)
                ShoppingList.objects.filter(account=account,recipeIngredient_id=ingredient).update(name=ing.name,recipeIngredient=None)
                RecipeIngredient.objects.filter(recipe=recipe,id=ingredient).delete()
                # if its not a public ingredient, we haven't added cost or stockcode and it's not used anywhere else, delete it
                otherRecipeIngredients = RecipeIngredient.objects.filter(ingredient=ing).count()
                accountIngredient = AccountIngredient.objects.get(account=account,ingredient=ing)
                if not ing.public and otherRecipeIngredients == 0 and accountIngredient.cost is None and accountIngredient.stockcode is None:
                    AccountIngredient.objects.filter(account=account,ingredient=ing).delete()
                    ing.delete()

            for ingredient in body['data']['ingredients']:
                try:
                    accing = AccountIngredient.objects.get(account=account,ingredient__name=ingredient['ingredient'])
                    accing.fresh = ingredient['fresh']
                    accing.save()
                    ing = Ingredient.objects.get(accountingredient__account=account,name=ingredient['ingredient'])
                except ObjectDoesNotExist:
                    ing,created = Ingredient.objects.get_or_create(name=ingredient['ingredient'])
                    AccountIngredient.objects.create(account=account,ingredient=ing,fresh=ingredient['fresh'],supermarketCategory=ing.supermarketCategory,pantryCategory=ing.pantryCategory,stockcode=ing.stockcode,cost=ing.cost)
                mea = Measure.objects.get(name=ingredient['measurement'])
                if 'recipeIngredientId' in ingredient and ingredient['recipeIngredientId']:
                    RecipeIngredient.objects.filter(recipe=recipe,id=ingredient['recipeIngredientId']).update(quantity=ingredient['two'],quantity4=ingredient['four'],quantityMeasure=mea,ingredient=ing)
                else:
                    RecipeIngredient.objects.create(recipe=recipe,quantity=ingredient['two'],quantity4=ingredient['four'],quantityMeasure=mea,ingredient=ing)

            return JsonResponse(dict(id=recipe.id))
        except Exception as e:
            raise e
            return JsonResponse({'status':'false','message':str(e)}, status=500)

    if request.method=='DELETE':
        account = AccountUser.objects.get(user=request.user).account
        body = json.loads(request.body.decode('utf-8'))
        action = body['action']

        if action == 'archive':
            AccountRecipe.objects.filter(recipe__id=pk,account=account).update(archive=True)
        elif action == 'unarchive':
            AccountRecipe.objects.filter(recipe__id=pk,account=account).update(archive=False)
        elif action == 'delete':
            # we can delete this if it's never been scheduled before
            weeks = RecipeWeek.objects.filter(account=account,recipe__id=pk).count()
            if weeks == 0:
                # delete account reference to this recipe
                AccountRecipe.objects.filter(account=account,recipe_id=pk).delete()
                recipe = Recipe.objects.get(id=pk)

                # if the recipe isn't public, delete it too
                if recipe.public != True:
                    # delete associated files
                    path = '/assets/resources/'+recipe.filename+'.jpg'
                    if os.path.exists(BASE_DIR+'/build'+path):
                        os.remove(BASE_DIR+'/build'+path)
                        os.remove(BASE_DIR+'/public'+path)

                    path = '/assets/resources/'+recipe.filename+'.pdf'
                    if os.path.exists(BASE_DIR+'/build'+path):
                        os.remove(BASE_DIR+'/build'+path)
                        os.remove(BASE_DIR+'/public'+path)

                    ingredients = RecipeIngredient.objects.filter(recipe=recipe)
                    RecipeIngredient.objects.filter(recipe=recipe).delete()
                    Recipe.objects.get(id=pk).delete()

                    # if no other recipe in this account uses these ingredients, delete ingredients too
                    for ingredient in ingredients:
                        ing = Ingredient.objects.get(id=ingredient.ingredient_id)
                        otherRecipeIngredients = RecipeIngredient.objects.filter(recipe__accountrecipe__account=account,ingredient=ing).count()
                        if otherRecipeIngredients == 0:
                            AccountIngredient.objects.filter(account=account,ingredient=ing).delete()
                            if not ing.public:
                                ing.delete()


    response = HttpResponse()
    response['allow'] = "get, put, delete, options"
    return response

@return_403
def RecipeAdd(request):
    if request.method=='POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            details = body['data']['details']
            primaryType = PrimaryType.objects.get(name=details['primaryType'])
            secondaryType = SecondaryType.objects.get(name=details['secondaryType'])
            season = None
            if details['season'] :
                season = Season.objects.get(name=season)

            # create the recipe
            recipe = Recipe.objects.create(name=details['name'],description=details['description'],prepTime=details['prepTime'],cookTime=details['cookTime'],primaryType=primaryType,secondaryType=secondaryType,season=season)
            recipe.filename = '{0:08d}'.format(recipe.id)
            recipe.save()

            # save the image
            if 'pdf' in details:
                image = DataURI(details['image'])
                if(len(image.data) <= 1000000):
                    with open(BASE_DIR+'/build/assets/resources/'+recipe.filename+'.jpg', 'wb+') as file:
                        file.write(image.data)
                    with open(BASE_DIR+'/public/assets/resources/'+recipe.filename+'.jpg', 'wb+') as file:
                        file.write(image.data)

            # save the pdf
            if 'pdf' in details:
                pdf = DataURI(details['pdf'])
                if(len(pdf.data) <= 1000000):
                    with open(BASE_DIR+'/build/assets/resources/'+recipe.filename+'.pdf', 'wb+') as file:
                        file.write(pdf.data)
                    with open(BASE_DIR+'/public/assets/resources/'+recipe.filename+'.pdf', 'wb+') as file:
                        file.write(pdf.data)

            # grant access to this new recipe in this account only
            account = AccountUser.objects.get(user=request.user).account
            AccountRecipe.objects.create(account=account,recipe=recipe)

            # create ingredients
            for ingredient in body['data']['ingredients']:
                try:
                    accing = AccountIngredient.objects.get(account=account,ingredient__name=ingredient['ingredient'])
                    accing.fresh = ingredient['fresh']
                    accing.save()
                    ing = Ingredient.objects.get(accountingredient__account=account,name=ingredient['ingredient'])
                except ObjectDoesNotExist:
                    ing,created = Ingredient.objects.get_or_create(name=ingredient['ingredient'])
                    AccountIngredient.objects.create(account=account,ingredient=ing,fresh=ingredient['fresh'],supermarketCategory=ing.supermarketCategory,pantryCategory=ing.pantryCategory,stockcode=ing.stockcode,cost=ing.cost)
                mea = Measure.objects.get(name=ingredient['measurement'])
                RecipeIngredient.objects.create(recipe=recipe,quantity=ingredient['two'],quantity4=ingredient['four'],quantityMeasure=mea,ingredient=ing)

            return JsonResponse(dict(id=recipe.id))
        except Exception as e:
            raise e
            return JsonResponse({'status':'false','message':str(e)}, status=500)

    response = HttpResponse()
    response['allow'] = "post, options"
    return response

@return_403
def RecipeIngredientsList(request,pk):
    if request.method=='GET':
        account = AccountUser.objects.get(user=request.user).account
        ingredients = RecipeIngredient.objects.filter(recipe=pk,recipe__accountrecipe__account=account).values('recipe','ingredient','quantity','quantity4','quantityMeasure','id')
        for ing in ingredients:
            ing['quantityMeasure'] = Measure.objects.get(id=ing['quantityMeasure']).name
            ingobj = AccountIngredient.objects.filter(account=account,ingredient_id=ing['ingredient']).values('ingredient__name','fresh').first()
            ing['ingredient'] = ingobj['ingredient__name']
            ing['fresh'] = ingobj['fresh']

        return JsonResponse(dict(result=list(ingredients)))

    response = HttpResponse()
    response['allow'] = "get, options"
    return response

@return_403
def RecipeWeekList(request):
    account = AccountUser.objects.get(user=request.user).account
    week_ids = RecipeWeek.objects.filter(account=account).order_by('-year','-week').values('week','year').distinct()
    for week in week_ids:
        week['cost'] = ShoppingList.objects.filter(account=account,week=week['week'],year=week['year'],fresh=True).aggregate(Sum('cost'))['cost__sum']
        recipes = RecipeWeek.objects.values('recipe').filter(account=account,week=week['week'],year=week['year'])
        week['recipes'] = list(Recipe.objects.filter(duplicate=False).values('id','name','filename','description','season','primaryType','secondaryType','prepTime','cookTime').filter(id__in=recipes))

        for recipe in week['recipes']:
            recipe['cost'] = ShoppingList.objects.filter(account=account,week=week['week'],year=week['year'],fresh=True,recipeIngredient__recipe_id=recipe['id']).aggregate(Sum('cost'))['cost__sum']

    return JsonResponse(dict(result=list(week_ids)))

@return_403
def ShoppingLister(request, year, week):
    account = AccountUser.objects.get(user=request.user).account

    def getList(fresh):
        shoppinglist = list(ShoppingList.objects.filter(
            Q(recipeIngredient__ingredient__accountingredient__account=account) | Q(recipeIngredient__ingredient__accountingredient__account=None),
            account=account,
            week=week,
            year=year,
            fresh=fresh,
        ).values(
            'fresh',
            'name',
            'purchased'
        ).annotate(
            id=Min('id'),
            cost=Sum('cost'),
            ingredientId=F('recipeIngredient__ingredient__id'),
            supermarketCategory=F('supermarketCategory__name'),
            pantryCategory=F('recipeIngredient__ingredient__accountingredient__pantryCategory__name'),
            ingredient=F('recipeIngredient__ingredient__name'),
            quantityMeasure=F('recipeIngredient__quantityMeasure__name'),
            sort=Min('sort'),
            quantity=Sum('recipeIngredient__quantity'),
            quantity4=Sum('recipeIngredient__quantity4'),
            defaultCost=F('recipeIngredient__ingredient__accountingredient__cost'),
            stockcode=Sum('stockcode')
        ).order_by('sort'))

        return shoppinglist

    if request.method=='GET':
        # load from ingredients and recipes tables
        if ShoppingList.objects.filter(account=account,week=week,year=year).count() == 0:
            generateShoppingList(account,week,year)

        return JsonResponse(dict(result={'fresh': getList(True), 'pantry': getList(False)}))

    if request.method=='PUT':
        body = json.loads(request.body.decode('utf-8'))
        if 'ingredients' in body['data']:
            sort = 0;
            for ingredient in body['data']['ingredients']:
                if 'ingredientId' in ingredient and ingredient['ingredientId'] is not None:
                    # check cost division for duplicates
                    if ingredient['cost'] is not None:
                        ingredient['cost'] = ingredient['cost']/countIngredientDuplicatesInShoppingList(account,ingredient['ingredientId'],week,year)
                    ShoppingList.objects.filter(account=account,week=week,year=year,recipeIngredient__ingredient_id=ingredient['ingredientId']).update(fresh=ingredient['fresh'], cost=ingredient['cost'], sort=sort)

                    if 'replaceDefaultCost' in ingredient and ingredient['replaceDefaultCost']:
                        AccountIngredient.objects.filter(account=account,ingredient_id=ingredient['ingredientId']).update(cost=ingredient['cost']);
                else:
                    ShoppingList.objects.filter(account=account,pk=ingredient['id']).update(fresh=ingredient['fresh'], sort=sort)
                sort = sort + 1
        elif 'purchased' in body['data']:
            if 'ingredient_id' in body['data'] and body['data']['ingredient_id'] is not None:
                ShoppingList.objects.filter(account=account,week=week,year=year,recipeIngredient__ingredient_id=body['data']['ingredient_id']).update(purchased=body['data']['purchased'])
            else:
                ShoppingList.objects.filter(account=account,pk=body['data']['id']).update(purchased=body['data']['purchased'])

    if request.method=='POST':
        body = json.loads(request.body.decode('utf-8'))
        sort = ShoppingList.objects.filter(week=6,year=2018,fresh=True).aggregate(sort=Max('sort'))['sort']+1
        if AccountIngredient.objects.filter(account=account,ingredient__name=body['data']['name']).count() == 1:
            ingredient = AccountIngredient.objects.get(account=account,ingredient__name=body['data']['name'])
            result = ShoppingList.objects.create(account=account, week=week, year=year, fresh=True, name=body['data']['name'], cost=ingredient.cost, stockcode=ingredient.stockcode, supermarketCategory=ingredient.supermarketCategory, sort=sort, purchased=False)
            category = result.supermarketCategory.name
        else:
            result = ShoppingList.objects.create(account=account, week=week, year=year, fresh=True, name=body['data']['name'], sort=sort, purchased=False)
            category = None
        return JsonResponse(dict(id=result.id,cost=result.cost,stockcode=result.stockcode,supermarketCategory=category))

    if request.method=='DELETE':
        body = json.loads(request.body.decode('utf-8'))
        if 'id' in body:
            ShoppingList.objects.get(account=account,pk=body['id']).delete()
        elif 'reset' in body:
            ShoppingList.objects.filter(account=account,week=week,year=year).delete()

    response = HttpResponse()
    response['allow'] = "get, put, delete, post, options"
    return response

def countIngredientDuplicatesInShoppingList(account,ingredient_id,week,year):
    return ShoppingList.objects.filter(account=account,week=week,year=year,recipeIngredient__ingredient__id=ingredient_id).aggregate(ids=Count('recipeIngredient__ingredient__id'))['ids']

def generateShoppingList(account, week, year):
    recipes = RecipeWeek.objects.filter(account=account,week=week,year=year).values('recipe').order_by('id')
    ingredientsFresh = list()
    ingredientsPantry = list()
    recipeIngIds = list()
    for recipe in recipes:
        thisRecipeFresh = list(RecipeIngredient.objects.filter(recipe__accountrecipe__account=account,ingredient__accountingredient__account=account,recipe=recipe['recipe'],ingredient__accountingredient__fresh=True).values('id','recipe','ingredient','ingredient__name','ingredient__accountingredient__cost','ingredient__accountingredient__stockcode','ingredient__accountingredient__fresh','ingredient__accountingredient__supermarketCategory','ingredient__accountingredient__pantryCategory','quantity','quantity4','quantityMeasure'))
        thisRecipePantry = list(RecipeIngredient.objects.filter(recipe__accountrecipe__account=account,ingredient__accountingredient__account=account,recipe=recipe['recipe'],ingredient__accountingredient__fresh=False).values('id','recipe','ingredient','ingredient__name','ingredient__accountingredient__cost','ingredient__accountingredient__stockcode','ingredient__accountingredient__fresh','ingredient__accountingredient__supermarketCategory','ingredient__accountingredient__pantryCategory','quantity','quantity4','quantityMeasure'))
        ingredientsFresh = ingredientsFresh + thisRecipeFresh
        ingredientsPantry = ingredientsPantry + thisRecipePantry
        for ing in thisRecipeFresh:
            recipeIngIds.append(ing['id'])
        for ing in thisRecipePantry:
            recipeIngIds.append(ing['id'])

    ingredientsFresh.sort(key=lambda x: (x['ingredient__accountingredient__supermarketCategory'], x['ingredient__name']))
    ingredientsPantry.sort(key=lambda x: (x['ingredient__accountingredient__pantryCategory'], x['ingredient__name']))
    allIngredients = ingredientsFresh + ingredientsPantry

    # reconcile with the existing list
    # Delete ingredients which aren't in the new list
    ShoppingList.objects.filter(account=account,week=week,year=year,purchased=False,name='').exclude(recipeIngredient__in=recipeIngIds).delete()

    # We don't want to update existing ingredients, so simply track its sort
    existingList = ShoppingList.objects.filter(account=account,week=week,year=year).values('id','recipeIngredient','sort')
    for existing in existingList:
        for newIng in allIngredients:
            if existing['recipeIngredient'] == newIng['id']:
                newIng['sort'] = existing['sort']
                break

    sort = 0
    for ingredient in allIngredients:
        if 'sort' in ingredient:
            sort = ingredient['sort']
        else:
            ing = ShoppingList.objects.create(account=account,week=week,year=year,fresh=ingredient['ingredient__accountingredient__fresh'],recipeIngredient=RecipeIngredient.objects.filter(ingredient__accountingredient__account=account).get(id=ingredient['id']),cost=ingredient['ingredient__accountingredient__cost'],stockcode=ingredient['ingredient__accountingredient__stockcode'],supermarketCategory=SupermarketCategory.objects.get(id=ingredient['ingredient__accountingredient__supermarketCategory']),sort=sort)
            sort = sort + 1

    # fix prices on duplicates
    for ingredient in allIngredients:
        duplicates = countIngredientDuplicatesInShoppingList(account,ingredient['ingredient'],week,year)
        if ingredient['ingredient__accountingredient__cost'] and duplicates and duplicates > 1:
            cost = ingredient['ingredient__accountingredient__cost']/duplicates
            ShoppingList.objects.filter(account=account,week=week,year=year,recipeIngredient__ingredient_id=ingredient['ingredient']).update(cost=cost)

@return_403
def RecipeWeekDetail(request, year, week):
    account = AccountUser.objects.get(user=request.user).account

    if request.method=='GET':
        weeks_list = RecipeWeek.objects.filter(account=account,week=week,year=year).values('recipe').order_by('id')
        recipes = Recipe.objects.filter(duplicate=False,id__in=weeks_list)

        return JsonResponse(dict(result=list(recipes.values('id','name','filename','description','season','primaryType','secondaryType','prepTime','cookTime'))))

    if request.method=='PUT':
        RecipeWeek.objects.filter(account=account,week=week,year=year).delete()
        body = json.loads(request.body.decode('utf-8'))
        for recipe in body['data']['recipes']:
            RecipeWeek.objects.create(account=account,week=week,year=year,recipe_id=recipe['id'])

        # reconcile the shopping list with these changes
        generateShoppingList(account,week,year)

    if request.method=='DELETE':
        RecipeWeek.objects.filter(account=account,week=week,year=year).delete()
        ShoppingList.objects.filter(account=account,week=week,year=year,purchased=False,name='').delete()

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
