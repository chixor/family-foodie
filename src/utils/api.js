import axios from 'axios'
import { NotificationManager } from 'react-notifications'

const BASEURL = '/api'

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

function handleError(error) {
    console.warn(error)
    NotificationManager.error(
        `${error.response.config.url}`,
        `${error.response.status}: ${error.response.statusText}`,
        100000
    )
    return null
}

export default {
    getUser() {
        return axios
            .get(`${BASEURL}/user/`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    getMyRecipes() {
        return axios
            .get(`${BASEURL}/myrecipes/`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    getRecipes() {
        return axios
            .get(`${BASEURL}/recipes/`)
            .then((response) => response.data)
            .catch(handleError)
    },

    getRecipe(id) {
        return axios
            .get(`${BASEURL}/recipe/${id}`)
            .then((response) => response.data.result[0])
            .catch(handleError)
    },

    getRecipeIngredients(id) {
        return axios
            .get(`${BASEURL}/recipe/${id}/ingredients`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    saveRecipe(id, details, ingredients, deleteIngredients) {
        if (id) {
            return axios
                .put(`${BASEURL}/recipe/${id}`, { data: { details, ingredients, deleteIngredients } })
                .then((response) => {
                    NotificationManager.success('Recipe saved successfully')
                    return response.data.id
                })
                .catch(handleError)
        }
        return axios
            .post(`${BASEURL}/recipe/`, { data: { details, ingredients } })
            .then((response) => {
                NotificationManager.success('Recipe saved successfully')
                return response.data.id
            })
            .catch(handleError)
    },

    saveRecipeIngredients(id, ingredients) {
        return axios
            .put(`${BASEURL}/recipe/${id}/ingredients/`, { data: { ingredients } })
            .then((response) => {
                NotificationManager.success('Recipe ingredients saved successfully')
                return response.data.result
            })
            .catch(handleError)
    },

    saveIngredient(id, ingredient) {
        return axios
            .put(`${BASEURL}/ingredient/${id}`, { data: { ingredient } })
            .then((response) => {
                NotificationManager.success('Ingredient saved successfully')
                return response.data.result
            })
            .catch(handleError)
    },

    deleteRecipe(id) {
        return axios
            .delete(`${BASEURL}/recipe/${id}`, { data: { action: 'delete' } })
            .then((response) => {
                NotificationManager.success('Recipe deleted successfully')
                return response.data.result
            })
            .catch(handleError)
    },

    archiveRecipe(id) {
        return axios
            .delete(`${BASEURL}/recipe/${id}`, { data: { action: 'archive' } })
            .then((response) => {
                NotificationManager.success('Recipe archived successfully')
                return response.data.result
            })
            .catch(handleError)
    },

    unarchiveRecipe(id) {
        return axios
            .delete(`${BASEURL}/recipe/${id}`, { data: { action: 'unarchive' } })
            .then((response) => {
                NotificationManager.success('Recipe unarchived successfully')
                return response.data.result
            })
            .catch(handleError)
    },

    getMeasurements() {
        return axios
            .get(`${BASEURL}/measurements/`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    getSupermarketCategories() {
        return axios
            .get(`${BASEURL}/supermarketcategories/`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    getPantryCategories() {
        return axios
            .get(`${BASEURL}/pantrycategories/`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    getIngredients() {
        return axios
            .get(`${BASEURL}/ingredients/`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    getWeeks() {
        return axios
            .get(`${BASEURL}/weeks/`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    saveWeek(week) {
        const recipeIds = week.recipes.map((recipe) => {
            return { id: recipe.id, cost: recipe.cost }
        })
        return axios
            .put(`${BASEURL}/week/${week.year}/${week.week}/`, { data: { recipes: recipeIds } })
            .then((response) => {
                NotificationManager.success(`Saved week ${week.week}, ${week.year}`)
                return response.data.result
            })
            .catch(handleError)
    },

    deleteWeek(week) {
        return axios
            .delete(`${BASEURL}/week/${week.year}/${week.week}/`)
            .then((response) => {
                NotificationManager.success(`Deleted week ${week.week}, ${week.year}`)
                return response.data.result
            })
            .catch(handleError)
    },

    shoppingListWeek(week) {
        return axios
            .get(`${BASEURL}/shopping/${week.year}/${week.week}/`)
            .then((response) => response.data.result)
            .catch(handleError)
    },

    saveShoppingList(week, ingredients) {
        return axios
            .put(`${BASEURL}/shopping/${week.year}/${week.week}/`, { data: { ingredients } })
            .then((response) => {
                NotificationManager.success('Saved')
                return response.data.result
            })
            .catch(handleError)
    },

    addShoppingListItem(week, name) {
        return axios
            .post(`${BASEURL}/shopping/${week.year}/${week.week}/`, { data: { name } })
            .then((response) => {
                NotificationManager.success('Item added successfully')
                return response.data.id
            })
            .catch(handleError)
    },

    deleteShoppingListItem(week, id) {
        return axios
            .delete(`${BASEURL}/shopping/${week.year}/${week.week}/`, { data: { id } })
            .then((response) => {
                NotificationManager.success('Item deleted successfully')
                return response.data.result
            })
            .catch(handleError)
    },

    resetShoppingList(week) {
        return axios
            .delete(`${BASEURL}/shopping/${week.year}/${week.week}/`, { data: { reset: true } })
            .catch(handleError)
    },

    purchaseShoppingListItem(week, id, ingredientId, purchased) {
        return axios
            .put(`${BASEURL}/shopping/${week.year}/${week.week}/`, {
                data: { id, ingredient_id: ingredientId, purchased },
            })
            .then((response) => response.data.result)
            .catch(handleError)
    },

    checkAvailability(ingredients) {
        const list = ingredients.reduce((a, b) => {
            return b.stockcode ? { stockcode: `${a.stockcode},${b.stockcode}` } : { stockcode: a.stockcode }
        })
        return axios
            .get(`https://www.woolworths.com.au/apis/ui/products/${list.stockcode}`)
            .then((response) => response.data)
            .catch(handleError)
    },
}
