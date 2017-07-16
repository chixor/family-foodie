var axios = require('axios');

function handleError (error) {
  console.warn(error);
  return null;
}

module.exports = {
  getRecipes: function () {
    return axios.get('http://192.168.1.20:8000/api/recipes/')
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  getRecipe: function (id) {
    return axios.get(`http://192.168.1.20:8000/api/recipe/${id}`)
      .then(function (response) {
        return response.data.result[0];
      })
      .catch(handleError);
  },

  getRecipeIngredients: function (id) {
    return axios.get(`http://192.168.1.20:8000/api/recipe/${id}/ingredients`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  saveRecipeIngredients: function (id,ingredients) {
    return axios.put(`http://192.168.1.20:8000/api/recipe/${id}/ingredients/`,{ data: { ingredients: ingredients } })
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  deleteRecipeIngredients: function (id) {
    return axios.put(`http://192.168.1.20:8000/api/recipe/${id}/ingredients/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  getMeasurements: function () {
    return axios.get(`http://192.168.1.20:8000/api/measurements/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  getIngredients: function () {
    return axios.get(`http://192.168.1.20:8000/api/ingredients/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  getWeeks: function () {
    return axios.get(`http://192.168.1.20:8000/api/weeks/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  saveWeek: function (week) {
    let recipe_ids = week.recipes.map((recipe,index) => {
      return {id: recipe.id, cost: recipe.cost};
    });
    return axios.put(`http://192.168.1.20:8000/api/week/${week.year}/${week.week}/`,{ data: { recipes: recipe_ids } })
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  deleteWeek: function (week) {
    return axios.delete(`http://192.168.1.20:8000/api/week/${week.year}/${week.week}/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  shoppingListWeek: function (week) {
    return axios.get(`http://192.168.1.20:8000/api/shopping/${week.year}/${week.week}/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  }
};