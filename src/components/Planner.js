import React, { Component } from 'react'
import api from '../utils/api'
import MenuDate from '../utils/MenuDate'
import search from '../utils/search'
import Recipe from './Recipe'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'

export default class Planner extends Component {
    constructor(props) {
        super()
        this.state = {
            weeks: [],
            recipes: [],
            thisWeek: new MenuDate(),
            nextWeek: new MenuDate().nextWeek(),
            searchResults: []
        }
        this.limitedList = this.savedLimitedList = []
        this.searchInput = debounce(this.searchInput, 800)
    }

    componentDidMount() {
        this.getRecipes()
        this.getWeeks()
    }

    newWeekObject = (week, year) => {
        return {
            week: week,
            year: year,
            recipes: this.chooseRecipes(3),
            unsaved: true,
            date: new MenuDate(year, week)
        }
    }

    getWeeks = () => {
        api.getWeeks().then(weeks => {
            const mostRecentWeek = new MenuDate(weeks[0].year, weeks[0].week)
            if (weeks.length === 0 || (weeks.length > 0 && mostRecentWeek.isBefore(this.state.thisWeek))) {
                weeks.unshift(this.newWeekObject(this.state.thisWeek.getWeek(), this.state.thisWeek.getYear()))
            }
            const nextWeek = new MenuDate(weeks[0].year, weeks[0].week).nextWeek()
            weeks.forEach(w => {
                w.date = new MenuDate(w.year, w.week)
            })
            this.setState({ weeks, nextWeek })
        })
    }

    getRecipes = () => {
        api.getRecipes().then(recipes => {
            this.setState({ recipes })
        })
    }

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
        // if we don't have recipes loaded, exit
        if (this.state.recipes.length === 0 || this.state.weeks.length === 0) {
            this.limitedList = []
        }
        // if we've saved this calculation, recover from save
        if (this.savedLimitedList.length > 0) {
            this.limitedList = this.savedLimitedList
        }

        // disclude the recipes which are designated to seasons other than this one
        let seasons = [[0, 1, 11], [2, 3, 4], [5, 6, 7], [8, 9, 10]],
            discludeList = [],
            d = new Date(),
            month = d.getMonth(),
            thisSeason = seasons.findIndex(s => {
                return s.indexOf(month) > -1
            })
        thisSeason++

        // disclude the recipes we've already scheduled in the last 24 weeks (6 months)
        this.state.weeks.forEach((w, x) => {
            if (x < 24) {
                discludeList = discludeList.concat(
                    w.recipes.map(recipe => {
                        return recipe.id
                    })
                )
            }
        })

        // put it all together
        this.limitedList = this.savedLimitedList = this.state.recipes.filter((r, x) => {
            return discludeList.indexOf(r.id) === -1 && (r.season === null || r.season === thisSeason) ? true : false
        })
    }

    chooseRecipe = () => {
        var index = this.limitedList[Math.floor(Math.random() * this.limitedList.length)]

        // remove all recipes with matching primary or secondary differential
        this.limitedList = this.limitedList.filter(r => {
            return r.primaryType !== index.primaryType && r.secondaryType !== index.secondaryType
        })

        return index
    }

    chooseRecipes = howMany => {
        return this.state.recipes.length > 0 ? Array.from({ length: howMany }, () => this.chooseRecipe()) : []
    }

    /**
     * functions for manipulating one week at a time
     */

    randomizeAll = index => {
        this.getRecipesForRandomisation()
        let weeks = this.state.weeks
        weeks[index].recipes = this.chooseRecipes(weeks[index].recipes.length || 3)
        this.setState({ weeks })
    }

    addWeek = (week, year) => {
        this.getRecipesForRandomisation()
        let weeks = this.state.weeks
        weeks.unshift(this.newWeekObject(week, year))
        const nextWeek = this.state.nextWeek.nextWeek()
        this.setState({ weeks, nextWeek })
    }

    edit = index => {
        this.getRecipesForRandomisation()
        let weeks = this.state.weeks
        weeks[index].prevRecipes = cloneDeep(weeks[index].recipes)
        weeks[index].unsaved = true
        this.setState({ weeks })
    }

    save = index => {
        api.saveWeek(this.state.weeks[index]).then(() => {
            let weeks = this.state.weeks
            weeks[index].unsaved = undefined
            this.getRecipesForRandomisation()
            this.setState({ weeks })
        })
    }

    delete = index => {
        api.deleteWeek(this.state.weeks[index]).then(() => {
            let weeks = this.state.weeks
            weeks.splice(index, 1)
            const nextWeek = new MenuDate(weeks[0].year, weeks[0].week).nextWeek()
            this.setState({ weeks, nextWeek })
        })
    }

    cancel = index => {
        let { weeks, nextWeek } = this.state
        if (typeof weeks[index].prevRecipes !== 'undefined') {
            weeks[index].recipes = weeks[index].prevRecipes
            weeks[index].prevRecipes = undefined
            weeks[index].unsaved = undefined
        } else {
            weeks.splice(index, 1)
            nextWeek = new MenuDate(weeks[0].year, weeks[0].week).nextWeek()
        }
        this.setState({ weeks, nextWeek })
    }

    /**
     * functions for manipulating one recipe card at a time
     */

    randomizeOne = (index, place) => {
        this.getRecipesForRandomisation()
        let weeks = this.state.weeks

        // remove all recipes with matching primary or secondary differentials
        weeks[index].recipes.forEach((recipe, inset) => {
            if (place !== inset) {
                this.limitedList = this.limitedList.filter(l => {
                    return l.primaryType !== recipe.primaryType && l.secondaryType !== recipe.secondaryType
                })
            }
        })
        weeks[index].recipes[place] = this.chooseRecipe()
        this.setState({ weeks })
    }

    addOne = index => {
        let weeks = this.state.weeks
        weeks[index].recipes.push(this.chooseRecipe())
        this.setState({ weeks })
    }

    addSearchOne = (index, recipe) => {
        let { searchResults, weeks } = this.state

        this.refs.searchQuery.value = ''
        searchResults = []
        weeks[index].recipes.push(recipe)
        this.setState({ weeks, searchResults })
    }

    deleteOne = (index, place) => {
        let weeks = this.state.weeks
        weeks[index].recipes.splice(place, 1)
        this.setState({ weeks })
    }

    searchInput = value => {
        let searchResults = []

        if (value.length > 0) {
            var split = value.trim().split(/[,]+/)
            var query = new RegExp(split.join('|'), 'i')
            searchResults = this.state.recipes.filter(recipe => {
                return (
                    recipe.name.search(query) > -1 ||
                    (recipe.description != null && recipe.description.search(query) > -1) ||
                    (recipe.ingredients != null && recipe.ingredients.search(query) > -1)
                )
            })
        } else {
            searchResults = this.state.recipes
        }
        this.setState({ searchResults })
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <button
                        className="btn btn-default"
                        onClick={() => this.addWeek(this.state.nextWeek.getWeek(), this.state.nextWeek.getYear())}
                    >
                        <span className="glyphicon glyphicon-plus" /> Week {this.state.nextWeek.getWeek()}
                    </button>
                    <br />
                    <br />
                    {this.state.weeks.length > 0 &&
                        this.state.weeks.map((w, i) => (
                            <section
                                className={
                                    this.state.thisWeek.getWeek() == w.week && this.state.thisWeek.getYear() == w.year
                                        ? 'container-thisweek'
                                        : ''
                                }
                                key={`week-${w.week}-${w.year}`}
                            >
                                <h2 className="shopping-week">
                                    Week {w.week}, {w.year}
                                    {w.unsaved ? (
                                        <span>
                                            &nbsp;<button
                                                className="btn btn-sm btn-default"
                                                onClick={() => this.randomizeAll(i)}
                                            >
                                                <span className="glyphicon glyphicon-refresh" /> Randomize
                                            </button>
                                            &nbsp;<button
                                                className="btn btn-sm btn-success"
                                                onClick={() => this.save(i)}
                                            >
                                                <span className="glyphicon glyphicon-ok" /> Save
                                            </button>
                                            &nbsp;<button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => this.delete(i)}
                                            >
                                                <span className="glyphicon glyphicon-remove" /> Delete
                                            </button>
                                            &nbsp;<button
                                                className="btn btn-sm btn-default"
                                                onClick={() => this.cancel(i)}
                                            >
                                                <span className="glyphicon glyphicon-remove" /> Cancel
                                            </button>
                                        </span>
                                    ) : null}
                                    {!w.unsaved ? (
                                        <span>
                                            &nbsp;<button
                                                title="Edit"
                                                className="btn btn-sm btn-default"
                                                onClick={() => this.edit(i)}
                                            >
                                                <span className="glyphicon glyphicon-pencil" />
                                            </button>
                                            &nbsp;<a
                                                title="Shopping List"
                                                href={`/shopping/${w.year}/${w.week}`}
                                                className="btn btn-sm btn-default"
                                            >
                                                <span className="glyphicon glyphicon-list" />
                                            </a>
                                            {w.cost ? (
                                                <span className="pricetag">
                                                    <sup>$</sup>
                                                    {w.cost.toFixed(2)}
                                                </span>
                                            ) : null}
                                        </span>
                                    ) : null}
                                </h2>
                                <h4 className="shopping-week">
                                    {w.date.toFirstDayOfTheWeek().formatText()} ↣&nbsp;
                                    {w.date.toLastDayOfTheWeek().formatText()}
                                </h4>
                                <div className={w.unsaved ? 'unsaved weeklist recipelist' : 'weeklist recipelist'}>
                                    {w.recipes.length
                                        ? w.unsaved
                                          ? w.recipes.map((r, x) => (
                                                <Recipe
                                                    key={`recipe-${w.week}-${w.year}-${r.id}`}
                                                    index={x}
                                                    windex={i}
                                                    delete={(windex, index) => this.deleteOne(windex, index)}
                                                    randomize={(windex, index) => this.randomizeOne(windex, index)}
                                                    {...r}
                                                />
                                            ))
                                          : w.recipes.map((r, x) => (
                                                <Recipe key={`recipe-${w.week}-${w.year}-${r.id}`} index={x} {...r} />
                                            ))
                                        : null}
                                    {w.unsaved && w.recipes.length < 7 ? (
                                        <article className="recipeadd" onClick={() => this.addOne(i)}>
                                            <div
                                                className="recipe-search navbar-form form-group"
                                                role="search"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <div className="icon-addon addon-md">
                                                    <input
                                                        autoComplete="false"
                                                        ref="searchQuery"
                                                        onChange={event => this.searchInput(event.target.value)}
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
                                                    {this.state.searchResults.length > 0 ? (
                                                        <ul className="search-results">
                                                            {this.state.searchResults.map((r, x) => (
                                                                <li
                                                                    key={`recipe-search-results-${r.id}`}
                                                                    onClick={() => this.addSearchOne(i, r)}
                                                                >
                                                                    <img
                                                                        alt="thumbnail"
                                                                        src={`/assets/resources/${r.front}.jpg`}
                                                                    />{' '}
                                                                    <span>{r.name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </article>
                                    ) : null}
                                </div>
                            </section>
                        ))}
                </div>
            </div>
        )
    }
}
