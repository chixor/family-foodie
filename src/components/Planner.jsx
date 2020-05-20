import React, { Component } from "react";
import debounce from "lodash/debounce";
import cloneDeep from "lodash/cloneDeep";
import api from "../utils/api";
import MenuDate from "../utils/MenuDate";
import Recipe from "./Recipe";

const WeekKeyword = (itemWeek, itemYear, calendarWeek, calendarYear) => {
  if (itemWeek === calendarWeek && itemYear === calendarYear) return "this";
  if (itemWeek < calendarWeek || itemYear < calendarYear) return "archive";
  return "future";
};

export default class Planner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weeks: [],
      recipes: [],
      thisWeek: new MenuDate(),
      nextWeek: new MenuDate().nextWeek(),
      searchResults: [],
    };
    this.limitedList = [];
    this.savedLimitedList = [];
    this.searchInput = debounce(this.searchInput, 800);
  }

  componentDidMount() {
    this.getRecipes();
    this.getWeeks();
  }

  newWeekObject = (week, year) => {
    return {
      week,
      year,
      recipes: this.chooseRecipes(3),
      unsaved: true,
      date: new MenuDate(year, week),
    };
  };

  newWeekObjectBlank = (week, year) => {
    return {
      week,
      year,
      recipes: [],
      unsaved: true,
      date: new MenuDate(year, week),
    };
  };

  getWeeks = () => {
    const { thisWeek } = this.state;
    api.getWeeks().then((weeks) => {
      if (weeks.length === 0) {
        weeks.unshift(
          this.newWeekObject(thisWeek.getWeek(), thisWeek.getYear())
        );
      } else {
        const mostRecentWeek = new MenuDate(weeks[0].year, weeks[0].week);
        if (mostRecentWeek.isBefore(thisWeek)) {
          weeks.unshift(
            this.newWeekObject(thisWeek.getWeek(), thisWeek.getYear())
          );
        }
      }
      const nextWeek = new MenuDate(weeks[0].year, weeks[0].week).nextWeek();
      weeks.forEach((w) => {
        w.date = new MenuDate(w.year, w.week);
      });
      this.setState({ weeks, nextWeek });
    });
  };

  getRecipes = () => {
    api.getMyRecipes().then((recipes) => {
      this.setState({ recipes });
    });
  };

  /*
   * Choose recipes based on:
   * - seasonal ingredients
   * - primary ingredient must be unique
   * - secondary ingredient must be unique
   * - NOT a recipe which has been selected in the last 6 months
   *
   * Nice to have:
   * - finishes ingredients like parmesan, spinach
   * - uses an ingredient in the 'pantry'
   *
   * Initial cull: all recipes used in the last 6 months or recipes for other seasons
   * primary diff: [beef (beef, steak, fillet), chicken, pork (pork, ham, bacon), duck, lamb (goan), fish (salmon, tilapia), vegetarian (bean, chickpea, Aubergine, pumpkin, sweet potato)]
   * secondary diff: [rice, pasta (incl noodle and risotto), taco, pizza, potato]
   */
  getRecipesForRandomisation = () => {
    const { recipes, weeks } = this.state;

    // if we don't have recipes loaded, exit
    if (recipes.length === 0 || weeks.length === 0) {
      this.limitedList = [];
    }
    // if we've saved this calculation, recover from save
    if (this.savedLimitedList.length > 0) {
      this.limitedList = this.savedLimitedList;
    }

    // disclude the recipes which are designated to seasons other than this one
    const seasons = [
      [0, 1, 11],
      [2, 3, 4],
      [5, 6, 7],
      [8, 9, 10],
    ];
    const d = new Date();
    const month = d.getMonth();
    let thisSeason = seasons.findIndex((s) => s.indexOf(month) > -1);
    thisSeason += 1;
    let discludeList = [];

    // disclude the recipes we've already scheduled in the last 24 weeks (6 months)
    weeks.forEach((w, x) => {
      if (x < 24) {
        discludeList = discludeList.concat(
          w.recipes.map((recipe) => {
            return recipe.id;
          })
        );
      }
    });

    // put it all together
    this.limitedList = recipes.filter((r) => {
      return (
        discludeList.indexOf(r.id) === -1 &&
        (r.season === null || r.season === thisSeason)
      );
    });
    this.savedLimitedList = this.limitedList;
  };

  chooseRecipe = () => {
    // ran out start from scratch
    if (this.limitedList.length === 0) this.getRecipesForRandomisation();
    const index = this.limitedList[
      Math.floor(Math.random() * this.limitedList.length)
    ];

    // remove all recipes with matching primary or secondary differential
    this.limitedList = this.limitedList.filter((r) => {
      return (
        r.primaryType !== index.primaryType &&
        r.secondaryType !== index.secondaryType
      );
    });

    return index;
  };

  chooseRecipes = (howMany) => {
    const { recipes } = this.state;
    return recipes.length > 0
      ? Array.from({ length: howMany }, () => this.chooseRecipe()).filter(
          (item) => typeof item !== "undefined"
        )
      : [];
  };

  /**
   * functions for manipulating one week at a time
   */

  randomizeAll = (index) => {
    this.getRecipesForRandomisation();
    const { weeks } = this.state;
    weeks[index].recipes = this.chooseRecipes(weeks[index].recipes.length || 3);
    this.setState({ weeks });
  };

  addWeek = (week, year) => {
    this.getRecipesForRandomisation();
    const { weeks, nextWeek } = this.state;
    weeks.unshift(this.newWeekObject(week, year));
    this.setState({ weeks, nextWeek: nextWeek.nextWeek() });
  };

  edit = (index) => {
    this.getRecipesForRandomisation();
    const { weeks } = this.state;
    weeks[index].prevRecipes = cloneDeep(weeks[index].recipes);
    weeks[index].unsaved = true;
    this.setState({ weeks });
  };

  save = (index) => {
    const { weeks } = this.state;
    api.saveWeek(weeks[index]).then(() => {
      weeks[index].unsaved = undefined;
      this.getRecipesForRandomisation();
      this.setState({ weeks });
    });
  };

  delete = (index) => {
    const { thisWeek, weeks } = this.state;
    let nextWeek;

    api.deleteWeek(weeks[index]).then(() => {
      weeks.splice(index, 1);
      if (weeks === 0) {
        weeks.unshift(
          this.newWeekObjectBlank(thisWeek.getWeek(), thisWeek.getYear())
        );
        nextWeek = new MenuDate().nextWeek();
      } else {
        nextWeek = new MenuDate(weeks[0].year, weeks[0].week).nextWeek();
      }
      const mostRecentWeek = new MenuDate(weeks[0].year, weeks[0].week);
      if (mostRecentWeek.isBefore(thisWeek)) {
        weeks.unshift(
          this.newWeekObjectBlank(thisWeek.getWeek(), thisWeek.getYear())
        );
      }
      this.setState({ weeks, nextWeek });
    });
  };

  cancel = (index) => {
    const { thisWeek, weeks } = this.state;
    let { nextWeek } = this.state;
    if (typeof weeks[index].prevRecipes !== "undefined") {
      weeks[index].recipes = weeks[index].prevRecipes;
      weeks[index].prevRecipes = undefined;
      weeks[index].unsaved = undefined;
    } else {
      weeks.splice(index, 1);
      if (weeks.length > 0) {
        const mostRecentWeek = new MenuDate(weeks[0].year, weeks[0].week);
        if (mostRecentWeek.isBefore(thisWeek)) {
          weeks.unshift(
            this.newWeekObjectBlank(thisWeek.getWeek(), thisWeek.getYear())
          );
        }
        nextWeek = new MenuDate(weeks[0].year, weeks[0].week).nextWeek();
      } else {
        weeks.unshift(
          this.newWeekObjectBlank(thisWeek.getWeek(), thisWeek.getYear())
        );
        nextWeek = new MenuDate().nextWeek();
      }
    }
    this.setState({ weeks, nextWeek });
  };

  /**
   * functions for manipulating one recipe card at a time
   */

  randomizeOne = (index, place) => {
    this.getRecipesForRandomisation();
    const { weeks } = this.state;

    // remove all recipes with matching primary or secondary differentials
    weeks[index].recipes.forEach((recipe, inset) => {
      if (place !== inset) {
        this.limitedList = this.limitedList.filter((l) => {
          return (
            l.primaryType !== recipe.primaryType &&
            l.secondaryType !== recipe.secondaryType
          );
        });
      }
    });
    weeks[index].recipes[place] = this.chooseRecipe();
    this.setState({ weeks });
  };

  addOne = (index) => {
    this.getRecipesForRandomisation();
    const { weeks } = this.state;
    weeks[index].recipes.push(this.chooseRecipe());
    this.setState({ weeks });
  };

  addSearchOne = (index, recipe) => {
    const { weeks } = this.state;

    this.refs.searchQuery.value = "";
    weeks[index].recipes.push(recipe);
    this.setState({ weeks, searchResults: [] });
  };

  deleteOne = (index, place) => {
    const { weeks } = this.state;
    weeks[index].recipes.splice(place, 1);
    this.setState({ weeks });
  };

  searchInput = (value) => {
    const { recipes } = this.state;
    let searchResults = [];
    let split;
    let query;

    if (value.length > 0) {
      split = value.trim().split(/[,]+/);
      query = new RegExp(split.join("|"), "i");
      searchResults = recipes.filter((recipe) => {
        return (
          recipe.name.search(query) > -1 ||
          (recipe.description != null &&
            recipe.description.search(query) > -1) ||
          (recipe.ingredients != null && recipe.ingredients.search(query) > -1)
        );
      });
    } else {
      searchResults = recipes;
    }
    this.setState({ searchResults });
  };

  render() {
    const { weeks, nextWeek, thisWeek, searchResults } = this.state;
    return (
      <div className="row">
        <div className="col-md-12">
          <button
            type="button"
            className="btn btn-light planner-addweek"
            onClick={() => this.addWeek(nextWeek.getWeek(), nextWeek.getYear())}
          >
            <span className="glyphicon glyphicon-plus" /> Week{" "}
            {nextWeek.getWeek()}
          </button>
          {weeks.length > 0 &&
            weeks.map((w, i) => (
              <section
                className={`planner-week container-${WeekKeyword(
                  w.week,
                  w.year,
                  thisWeek.getWeek(),
                  thisWeek.getYear()
                )}week`}
                key={`week-${w.week}-${w.year}`}
              >
                <h2 className="shopping-week">
                  Week {w.week}, {w.year}
                  {w.cost ? (
                    <span className="pricetag">
                      <sup>$</sup>
                      {w.cost.toFixed(2)}
                    </span>
                  ) : null}
                </h2>
                <h4 className="shopping-week">
                  {w.date.toFirstDayOfTheWeek().formatText()} ↣&nbsp;
                  {w.date.toLastDayOfTheWeek().formatText()}
                </h4>
                {w.unsaved ? (
                  <div className="planner-controls">
                    &nbsp;
                    <button
                      type="button"
                      className="btn btn-xs text-primary"
                      onClick={() => this.randomizeAll(i)}
                    >
                      <span className="glyphicon glyphicon-refresh" /> Automate
                    </button>
                    &nbsp;
                    <button
                      type="button"
                      className="btn btn-xs text-success"
                      onClick={() => this.save(i)}
                    >
                      <span className="glyphicon glyphicon-ok" /> Save
                    </button>
                    &nbsp;
                    <button
                      type="button"
                      className="btn btn-xs text-danger"
                      onClick={() => this.delete(i)}
                    >
                      <span className="glyphicon glyphicon-remove" /> Delete
                    </button>
                    &nbsp;
                    <button
                      type="button"
                      className="btn btn-xs text-secondary"
                      onClick={() => this.cancel(i)}
                    >
                      <span className="glyphicon glyphicon-remove" /> Cancel
                    </button>
                  </div>
                ) : null}
                {!w.unsaved ? (
                  <div className="planner-controls">
                    &nbsp;
                    <button
                      type="button"
                      title="Edit"
                      className="btn btn-xs text-primary"
                      onClick={() => this.edit(i)}
                    >
                      <span className="glyphicon glyphicon-pencil" /> Edit
                    </button>
                    &nbsp;
                    <a
                      title="Shopping List"
                      href={`/shopping/${w.year}/${w.week}`}
                      className="btn btn-xs btn-link"
                    >
                      <span className="glyphicon glyphicon-list" /> Shopping
                      List
                    </a>
                  </div>
                ) : null}
                <div
                  className={
                    w.unsaved
                      ? "unsaved weeklist recipelist"
                      : "weeklist recipelist"
                  }
                >
                  {w.recipes.length && w.unsaved
                    ? w.recipes.map((r, x) => (
                        <Recipe
                          key={`recipe-${w.week}-${w.year}-${r.id}`}
                          index={x}
                          windex={i}
                          deleteFn={(windex, index) =>
                            this.deleteOne(windex, index)
                          }
                          randomize={(windex, index) =>
                            this.randomizeOne(windex, index)
                          }
                          {...r}
                        />
                      ))
                    : w.recipes.map((r, x) => (
                        <Recipe
                          key={`recipe-${w.week}-${w.year}-${r.id}`}
                          index={x}
                          {...r}
                        />
                      ))}
                  {w.unsaved && w.recipes.length < 7 ? (
                    <article
                      className="recipeadd"
                      onClick={() => this.addOne(i)}
                    >
                      <div
                        className="recipe-search navbar-form form-group"
                        role="search"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="icon-addon addon-md">
                          <input
                            autoComplete="false"
                            ref="searchQuery"
                            onChange={(event) =>
                              this.searchInput(event.target.value)
                            }
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
                          {searchResults.length && (
                            <ul className="search-results">
                              {searchResults.map((r) => (
                                <li
                                  key={`recipe-search-results-${r.id}`}
                                  onClick={() => this.addSearchOne(i, r)}
                                >
                                  <img
                                    alt="thumbnail"
                                    src={`/assets/resources/${r.filename}.jpg`}
                                  />{" "}
                                  <span>{r.name}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </article>
                  ) : null}
                </div>
              </section>
            ))}
        </div>
      </div>
    );
  }
}
