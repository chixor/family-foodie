import React, { Component } from "react";
import api from '../utils/api';
import search from '../utils/search';
import Recipe from './Recipe';

export default class Recipes extends Component {

    constructor(props) {
        super();
        this.state = {
            allRecipes: [],
            showRecipes: []
        };
        this.searchInput = search.debounce(this.searchInput,800);
    }

    componentDidMount() {
        this.getRecipes();
    }

    getRecipes() {
        api.getRecipes().then((recipes) => {
            this.setState(prevState => {
                this.refs.searchQuery.value = search.getParameterByName('s',this.props.location.search);
                prevState.allRecipes = recipes;
                prevState.showRecipes = this.search(this.refs.searchQuery.value,recipes);
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

    search(value = '',list) {
        var recipes = list ? list : this.state.allRecipes;
        if(value.length > 0) {
            var split = value.split(/[, ]+/);
            var query = new RegExp(split.join('|'),'i');

            return recipes.filter(recipe => {
                return recipe.name.search(query) > -1 || (recipe.description != null && recipe.description.search(query) > -1) || (recipe.ingredients != null && recipe.ingredients.search(query) > -1);
            });
        }
        return recipes;
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
