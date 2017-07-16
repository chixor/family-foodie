import React from "react";
import api from '../utils/api';
import Recipe from './Recipe';

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[[]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export default class Recipes extends React.Component {

  constructor(props) {
    super();
    this.state = {
      allRecipes: [],
      showRecipes: []
    };
    this.searchInput = debounce(this.searchInput,800);
  }

  componentDidMount() {
    this.getRecipes();
  }

  getRecipes() {
    api.getRecipes()
      .then((recipes) => {
        this.setState(prevState => {
          this.refs.searchQuery.value = getParameterByName('s',this.props.location.search);
          prevState.allRecipes = recipes;
          prevState.showRecipes = this.search(this.refs.searchQuery.value);
          return prevState;
        });
      });
  }

  searchInput(value) {
    this.props.history.push({
      pathname: '/recipes',
      search: value.length > 0 ? `?s=${value}` : ''
    });
    this.setState(prevState => {
      return prevState.showRecipes = this.search(value);
    });
  }

  search(value = '') {
    if(value.length > 0) {
      var split = value.trim().split(/[,]+/);
      var query = new RegExp(split.join('|'),'i');

      return this.state.allRecipes.filter(recipe => {
        return recipe.name.search(query) > -1 || (recipe.description != null && recipe.description.search(query) > -1) || (recipe.ingredients != null && recipe.ingredients.search(query) > -1);
      });
    }
    return this.state.allRecipes;
  }

  render() {
    return (
      <section className="recipelist">
          <div className="recipe-search navbar-form form-group" role="search">
              <div className="icon-addon addon-md">
                  <input onChange={(event) => this.searchInput(event.target.value)} ref="searchQuery" type="search" placeholder="Search" className="form-control" id="search"/>
                  <label htmlFor="search" className="glyphicon glyphicon-search" rel="tooltip" title="email"></label>
              </div>
          </div>
          <p>{this.state.showRecipes.length} found</p>
          {
              this.state.showRecipes.map((r, i) =>
                  <Recipe key={`recipe-${r.id}`} index={i} {...r}/>
              )
          }
      </section>
    )
  }
}