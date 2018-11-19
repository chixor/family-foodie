import React, { Component } from 'react'
import api from '../utils/api'
import search from '../utils/search'
import Recipe from './Recipe'
import debounce from 'lodash/debounce'

export default class Recipes extends Component {
    constructor(props) {
        super()
        this.state = {
            myRecipes: [],
            archiveRecipes: [],
            publicRecipes: [],
            showRecipes: [],
            edit: false
        }
        this.searchInput = debounce(this.searchInput, 800)
    }

    componentDidMount() {
        this.load()
    }

    toggleEditState = () => {
      let edit = this.state.edit
      edit = !edit
      this.setState({ edit })
    }

    load = () => {
        api.getRecipes().then(recipes => {
            const { myRecipes, archiveRecipes, publicRecipes} = recipes
            this.refs.searchQuery.value = search.getParameterByName('s', this.props.location.search)
            let showRecipes = this.search(this.refs.searchQuery.value, myRecipes)
            this.setState({ myRecipes, showRecipes, archiveRecipes, publicRecipes})
        })
    }

    searchInput = value => {
        this.props.history.push({
            pathname: '/recipes',
            search: value.length > 0 ? `?s=${value}` : ''
        })
        const showRecipes = this.search(value)
        this.setState({ showRecipes })
    }

    search(value = '', list) {
        var recipes = list ? list : this.state.myRecipes
        if (value.length > 0) {
            var split = value.split(/[, ]+/)
            var query = new RegExp(split.join('|'), 'i')

            return recipes.filter(recipe => {
                return (
                    recipe.name.search(query) > -1 ||
                    (recipe.description != null && recipe.description.search(query) > -1) ||
                    (recipe.ingredients != null && recipe.ingredients.search(query) > -1)
                )
            })
        }
        return recipes
    }

    delete = (id) => {
        api.deleteRecipe(id).then(() => {
            this.load()
        })
    }

    archive = (id) => {
        api.archiveRecipe(id).then(() => {
            this.load()
        })
    }

    unarchive = (id) => {
        api.unarchiveRecipe(id).then(() => {
            this.load()
        })
    }

    render() {
        return (
            <section className="recipelist">
                <div className="recipe-search navbar-form form-group" role="search" style={{float: 'right', marginTop: '-10px'}}>
                    <div className="icon-addon addon-md">
                        <input
                            onChange={event => this.searchInput(event.target.value)}
                            ref="searchQuery"
                            type="search"
                            placeholder="Search"
                            className="form-control"
                            id="search"
                        />
                        <label htmlFor="search" className="glyphicon glyphicon-search" rel="tooltip" title="email" />
                    </div>
                </div>
                <h2>My Recipes</h2>
                <button
                    className="btn btn-light"
                    style={{float: 'right', marginTop: '-4px', marginLeft: '5px'}}
                    onClick={() => this.toggleEditState()}
                >
                    <span className="glyphicon glyphicon-pencil" /> {this.state.edit ? 'Done Editing' : 'Edit Recipes'}
                </button>
                <a href="/recipe" className="btn btn-success" style={{float: 'right', marginTop: '-4px'}}>
                    <span className="glyphicon glyphicon-plus" /> Add Recipe
                </a>
                <p>{this.state.showRecipes.length} found</p>
                {this.state.showRecipes.map((r, i) => <Recipe key={`recipe-${r.id}`} index={i} editable={this.state.edit} deletePerm={this.delete} archivePerm={this.archive}  {...r} />)}
                <h2>My Archived Recipes</h2>
                <p>These recipes won't appear in the planner.</p>
                <p>{this.state.archiveRecipes.length} found</p>
                {this.state.archiveRecipes.map((r, i) => <Recipe key={`recipe-${r.id}`} index={i} editable={this.state.edit} unarchivePerm={this.unarchive} {...r} />)}
                {/*
                <h2>Public Recipes</h2>
                <p>You can add any of these recipes to your account.</p>
                <p>{this.state.publicRecipes.length} found</p>
                {this.state.publicRecipes.map((r, i) => <Recipe key={`recipe-${r.id}`} index={i} {...r} />)}
                */}
            </section>
        )
    }
}
