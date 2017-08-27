import axios from 'axios';
import {NotificationManager} from 'react-notifications';
var BASEURL = '/api';

function handleError (error) {
  console.warn(error);
  NotificationManager.error(`${error.response.config.url}`, `${error.response.status}: ${error.response.statusText}`,100000);
  return null;
}

export default {
  getRecipes: function () {
    return axios.get(`${BASEURL}/recipes/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  getRecipe: function (id) {
    return axios.get(`${BASEURL}/recipe/${id}`)
      .then(function (response) {
        return response.data.result[0];
      })
      .catch(handleError);
  },

  getRecipeIngredients: function (id) {
    return axios.get(`${BASEURL}/recipe/${id}/ingredients`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  saveRecipeIngredients: function (id,ingredients) {
    return axios.put(`${BASEURL}/recipe/${id}/ingredients/`,{ data: { ingredients: ingredients } })
      .then(function (response) {
        NotificationManager.success('Recipe ingredients saved successfully');
        return response.data.result;
      })
      .catch(handleError);
  },

  deleteRecipeIngredients: function (id) {
    return axios.put(`${BASEURL}/recipe/${id}/ingredients/`)
      .then(function (response) {
        NotificationManager.success('Recipe ingredients deleted successfully');
        return response.data.result;
      })
      .catch(handleError);
  },

  getMeasurements: function () {
    return axios.get(`${BASEURL}/measurements/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  getIngredients: function () {
    return axios.get(`${BASEURL}/ingredients/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  getWeeks: function () {
    return axios.get(`${BASEURL}/weeks/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  },

  saveWeek: function (week) {
    let recipe_ids = week.recipes.map((recipe,index) => {
      return {id: recipe.id, cost: recipe.cost};
    });
    return axios.put(`${BASEURL}/week/${week.year}/${week.week}/`,{ data: { recipes: recipe_ids } })
      .then(function (response) {
        NotificationManager.success(`Saved week ${week.week}, ${week.year}`);
        return response.data.result;
      })
      .catch(handleError);
  },

  deleteWeek: function (week) {
    return axios.delete(`${BASEURL}/week/${week.year}/${week.week}/`)
      .then(function (response) {
        NotificationManager.success(`Deleted week ${week.week}, ${week.year}`);
        return response.data.result;
      })
      .catch(handleError);
  },

  shoppingListWeek: function (week) {
    return axios.get(`${BASEURL}/shopping/${week.year}/${week.week}/`)
      .then(function (response) {
        return response.data.result;
      })
      .catch(handleError);
  }
};
