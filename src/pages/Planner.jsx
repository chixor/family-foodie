import React, { Component } from "react";
import cloneDeep from "lodash/cloneDeep";
import api from "../utils/api";
import MenuDate from "../utils/MenuDate";
import RecipeCard from "../components/RecipeCard";
import PlannerControls from "../components/PlannerControls";
import RecipeCardAdd from "../components/RecipeCardAdd";
import PriceTag from "../components/PriceTag";

const THIS_DATE = new MenuDate();
const THIS_WEEK = THIS_DATE.getWeek();
const THIS_YEAR = THIS_DATE.getYear();

const WeekKeyword = (itemWeek, itemYear) => {
  if (itemWeek === THIS_WEEK && itemYear === THIS_YEAR) return "this";
  if (itemWeek < THIS_WEEK || itemYear < THIS_YEAR) return "archive";
  return "future";
};

const NewWeekObject = (week, year, recipes) => {
  return {
    week,
    year,
    recipes,
    unsaved: true,
    keyword: WeekKeyword(week, year),
    date: new MenuDate(year, week),
  };
};

const WeekAddButton = ({ callback, children }) => (
  <button
    type="button"
    className="btn btn-light planner-addweek"
    onClick={callback}
  >
    <span className="glyphicon glyphicon-plus" /> {children}
  </button>
);

export default class Planner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weeks: [],
      recipes: [],
    };
    this.limitedList = [];
    this.savedLimitedList = [];
  }

  componentDidMount() {
    this.getRecipes();
    this.getWeeks();
  }

  getRecipes = () => {
    api.getMyRecipes().then((recipes) => {
      this.setState({ recipes });
    });
  };

  getWeeks = () => {
    api.getWeeks().then((weeksProp) => {
      const weeks = weeksProp.map((w) => {
        const newWeek = w;
        newWeek.date = new MenuDate(w.year, w.week);
        newWeek.keyword = WeekKeyword(w.week, w.year);
        return newWeek;
      });
      const newWeek = NewWeekObject(
        THIS_WEEK,
        THIS_YEAR,
        this.chooseRecipes(3)
      );

      if (weeks.length === 0) {
        weeks.unshift(newWeek);
      } else {
        const mostRecentWeek = new MenuDate(weeks[0].year, weeks[0].week);
        if (mostRecentWeek.isBefore(THIS_DATE)) {
          weeks.unshift(newWeek);
        }
      }

      this.setState({ weeks });
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
    const thisSeason = seasons.findIndex((s) => s.indexOf(month) > -1) + 1;
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
    const { weeks } = this.state;
    weeks.unshift(NewWeekObject(week, year, this.chooseRecipes(3)));
    this.setState({ weeks });
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
    const { weeks } = this.state;

    api.deleteWeek(weeks[index]).then(() => {
      weeks.splice(index, 1);
      if (weeks === 0) {
        weeks.unshift(NewWeekObject(THIS_WEEK, THIS_YEAR, []));
      }
      const mostRecentWeek = new MenuDate(weeks[0].year, weeks[0].week);
      if (mostRecentWeek.isBefore(THIS_DATE)) {
        weeks.unshift(NewWeekObject(THIS_WEEK, THIS_YEAR, []));
      }
      this.setState({ weeks });
    });
  };

  cancel = (index) => {
    const { weeks } = this.state;
    if (typeof weeks[index].prevRecipes !== "undefined") {
      weeks[index].recipes = weeks[index].prevRecipes;
      weeks[index].prevRecipes = undefined;
      weeks[index].unsaved = undefined;
    } else {
      weeks.splice(index, 1);
      if (weeks.length > 0) {
        const mostRecentWeek = new MenuDate(weeks[0].year, weeks[0].week);
        if (mostRecentWeek.isBefore(THIS_DATE)) {
          weeks.unshift(NewWeekObject(THIS_WEEK, THIS_YEAR, []));
        }
      } else {
        weeks.unshift(NewWeekObject(THIS_WEEK, THIS_YEAR, []));
      }
    }
    this.setState({ weeks });
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

    weeks[index].recipes.push(recipe);
    this.setState({ weeks });
  };

  deleteOne = (index, place) => {
    const { weeks } = this.state;
    weeks[index].recipes.splice(place, 1);
    this.setState({ weeks });
  };

  render() {
    const { weeks, recipes } = this.state;
    const nextWeek = weeks.length
      ? new MenuDate(weeks[0].year, weeks[0].week).nextWeek()
      : new MenuDate().nextWeek();

    return (
      <div className="row">
        <div className="col-md-12">
          <WeekAddButton
            callback={() =>
              this.addWeek(nextWeek.getWeek(), nextWeek.getYear())
            }
          >
            {`Week ${nextWeek.getWeek()}`}
          </WeekAddButton>
          <div className="planner-container">
            {weeks.length > 0 &&
              weeks.map((w, i) => (
                <section
                  className={`planner-week container-${w.keyword}week`}
                  key={`week-${w.week}-${w.year}`}
                >
                  <h2 className="shopping-week">
                    Week {w.week}, {w.year}
                    {w.cost && <PriceTag>{w.cost.toFixed(2)}</PriceTag>}
                  </h2>
                  <h4 className="shopping-week">
                    {w.date.toFirstDayOfTheWeek().formatText()} ↣&nbsp;
                    {w.date.toLastDayOfTheWeek().formatText()}
                  </h4>
                  <PlannerControls
                    isEditing={w.unsaved}
                    randomCallback={() => this.randomizeAll(i)}
                    saveCallback={() => this.save(i)}
                    deleteCallback={() => this.delete(i)}
                    cancelCallback={() => this.cancel(i)}
                    editCallback={() => this.edit(i)}
                    shopLink={`/shopping/${w.year}/${w.week}`}
                  />
                  {w.unsaved ? (
                    <div className="unsaved weeklist recipelist">
                      {w.recipes.map((r, x) => (
                        <RecipeCard
                          key={`recipe-${w.week}-${w.year}-${r.id}`}
                          deleteCallback={() => this.deleteOne(i, x)}
                          randomCallback={() => this.randomizeOne(i, x)}
                          small={w.keyword === "archive"}
                          {...r}
                        />
                      ))}
                      {recipes && (
                        <RecipeCardAdd
                          addCallback={() => this.addOne(i)}
                          addFromSearchCallback={(r) => this.addSearchOne(i, r)}
                          recipes={recipes}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="weeklist recipelist">
                      {w.recipes.map((r) => (
                        <RecipeCard
                          key={`recipe-${w.week}-${w.year}-${r.id}`}
                          {...r}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))}
          </div>
        </div>
      </div>
    );
  }
}
