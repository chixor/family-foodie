import React, { Component } from "react";
import debounce from "lodash/debounce";
import api from "../utils/api";
import search from "../utils/search";
import Recipe from "./Recipe";

export default class Recipes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myRecipes: [],
      archiveRecipes: [],
      showRecipes: [],
      edit: false,
    };
    this.searchInput = debounce(this.searchInput, 800);
  }

  componentDidMount() {
    this.load();
  }

  toggleEditState = () => {
    let { edit } = this.state;
    edit = !edit;
    this.setState({ edit });
  };

  load = () => {
    const { location } = this.props;
    api.getRecipes().then((recipes) => {
      const { myRecipes, archiveRecipes } = recipes;
      this.refs.searchQuery.value = search.getParameterByName(
        "s",
        location.search
      );
      const showRecipes = this.search(this.refs.searchQuery.value, myRecipes);
      this.setState({ myRecipes, showRecipes, archiveRecipes });
    });
  };

  searchInput = (value) => {
    const { history } = this.props;
    history.push({
      pathname: "/recipes",
      search: value.length > 0 ? `?s=${value}` : "",
    });
    const showRecipes = this.search(value);
    this.setState({ showRecipes });
  };

  delete = (id) => {
    api.deleteRecipe(id).then(() => {
      this.load();
    });
  };

  archive = (id) => {
    api.archiveRecipe(id).then(() => {
      this.load();
    });
  };

  unarchive = (id) => {
    api.unarchiveRecipe(id).then(() => {
      this.load();
    });
  };

  search(value = "", list) {
    const { myRecipes } = this.state;
    const recipes = list || myRecipes;

    if (value.length > 0) {
      const split = value.split(/[, ]+/);
      const query = new RegExp(split.join("|"), "i");

      return recipes.filter((recipe) => {
        return (
          recipe.name.search(query) > -1 ||
          (recipe.description != null &&
            recipe.description.search(query) > -1) ||
          (recipe.ingredients != null && recipe.ingredients.search(query) > -1)
        );
      });
    }
    return recipes;
  }

  render() {
    const { edit, showRecipes, archiveRecipes } = this.state;
    return (
      <section className="recipelist">
        <div
          className="recipe-search navbar-form form-group"
          role="search"
          style={{ float: "right", marginTop: "-10px" }}
        >
          <div className="icon-addon addon-md">
            <input
              onChange={(event) => this.searchInput(event.target.value)}
              ref="searchQuery"
              type="search"
              placeholder="Search"
              className="form-control"
              id="search"
            />
            <label
              htmlFor="search"
              className="glyphicon glyphicon-search"
              rel="tooltip"
              title="email"
            />
          </div>
        </div>
        <h2>My Recipes</h2>
        <button
          type="button"
          className="btn btn-light"
          style={{ float: "right", marginTop: "-4px", marginLeft: "5px" }}
          onClick={() => this.toggleEditState()}
        >
          <span className="glyphicon glyphicon-pencil" />{" "}
          {edit ? "Done Editing" : "Edit Recipes"}
        </button>
        <a
          href="/recipe"
          className="btn btn-success"
          style={{ float: "right", marginTop: "-4px" }}
        >
          <span className="glyphicon glyphicon-plus" /> Add Recipe
        </a>
        <p>{showRecipes.length} found</p>
        {showRecipes.map((r, i) => (
          <Recipe
            key={`recipe-${r.id}`}
            index={i}
            editable={edit}
            deletePerm={this.delete}
            archivePerm={this.archive}
            {...r}
          />
        ))}
        <h2>My Archived Recipes</h2>
        <p>These recipes won&apos;t appear in the planner.</p>
        <p>{archiveRecipes.length} found</p>
        {archiveRecipes.map((r, i) => (
          <Recipe
            key={`recipe-${r.id}`}
            index={i}
            editable={edit}
            unarchivePerm={this.unarchive}
            {...r}
          />
        ))}
      </section>
    );
  }
}
