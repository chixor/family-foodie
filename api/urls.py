from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from menus import views

urlpatterns = [
    # Examples:
    # url(r'^$', 'menufresh.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^accounts/', include('django.contrib.auth.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^signup/$', views.signup, name='signup'),

    url(r'^$', views.Index),
    url(r'^planner', views.Index),
    url(r'^shopping', views.Index),
    url(r'^recipe', views.Index),
    url(r'^ingredients', views.Index),


    url(r'^api/user/$', views.User),
    url(r'^api/myrecipes/$', views.MyRecipeList),
    url(r'^api/recipes/$', views.RecipeList),
    url(r'^api/shopping/(?P<year>(\d+))/(?P<week>(\d+))/$', views.ShoppingLister),
    url(r'^api/measurements/$', views.MeasureList),
    url(r'^api/supermarketcategories/$', views.SupermarketCategoryList),
    url(r'^api/pantrycategories/$', views.PantryCategoryList),
    url(r'^api/ingredients/$', views.IngredientList),
    url(r'^api/ingredient/(?P<pk>[0-9]+)$', views.IngredientDetail),
    url(r'^api/recipe/$', views.RecipeAdd),
    url(r'^api/recipe/(?P<pk>[0-9]+)$', views.RecipeDetail),
    url(r'^api/recipe/(?P<pk>[0-9]+)/ingredients/$', views.RecipeIngredientsList),
    url(r'^api/weeks/$', views.RecipeWeekList),
    url(r'^api/week/(?P<year>(\d+))/(?P<week>(\d+))/$', views.RecipeWeekDetail),
] + static(settings.ASSETS_URL, document_root=settings.ASSETS_ROOT)
