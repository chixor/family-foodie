import React from 'react';
import api from '../modules/api';
import MenuDate from '../modules/MenuDate';
import search from '../modules/search';
import Recipe from './Recipe';
import Auth from '../modules/Auth';

export default class Planner extends React.Component {
    constructor(props) {
        super();
        this.state = {
            weeks: [],
            recipes: [],
            thisWeek: new MenuDate(),
            nextWeek: new MenuDate().nextDateWeek(),
            searchResults: []
        };

        this.searchInput = search.debounce(this.searchInput,800);

        // This binding is necessary to make `this` work in the callback
        this.chooseRecipe = this.chooseRecipe.bind(this);
        this.chooseRecipes = this.chooseRecipes.bind(this);
        this.randomizeOne = this.randomizeOne.bind(this);
        this.randomizeAll = this.randomizeAll.bind(this);
        this.edit = this.edit.bind(this);
        this.addWeek = this.addWeek.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    componentDidMount() {
        this.getRecipes();
        this.getWeeks();
    }

    getWeeks() {
        api.getWeeks().then((weeks) => {
            this.setState(prevState => {
                if(weeks.length === 0 || (weeks.length > 0 && (parseInt(weeks[0].week,10) < this.state.thisWeek.getDateWeek() || parseInt(weeks[0].year,10) < this.state.thisWeek.getFullYear()))) {
                    weeks.unshift({week: this.state.thisWeek.getDateWeek(), year: this.state.thisWeek.getFullYear(), recipes: this.chooseRecipes(3), unsaved: true});
                }
                let daysToWeek = (1 + (weeks[0].week - 1) * 7);
                prevState.nextWeek = new MenuDate(weeks[0].year,0,daysToWeek).nextDateWeek();
                prevState.weeks = weeks;
                return prevState;
            });
        });
    }

    getRecipes() {
        api.getRecipes().then((recipes) => {
            this.setState(prevState => {
                return { recipes: recipes }
            });
        });
    }

    chooseRecipe() {
        return this.state.recipes[Math.floor(Math.random() * this.state.recipes.length)];
    }

    chooseRecipes(howMany) {
        var randomSelection = [];
        if(this.state.recipes.length > 0) {
            for(let x=0; x<howMany; x++) {
                randomSelection.push(this.chooseRecipe());
            }
        }
        return randomSelection;
    }

    /**
     * functions for manipulating one week at a time
     */

    randomizeAll(index) {
        this.setState(prevState => {
            prevState.weeks[index].recipes = this.chooseRecipes(prevState.weeks[index].recipes.length || 3);
            return prevState;
        });
    }

    addWeek(week,year) {
        this.setState(prevState => {
            prevState.weeks.unshift({week: week, year: year, recipes: this.chooseRecipes(3), unsaved: true});
            prevState.nextWeek = prevState.nextWeek.nextDateWeek();
            return prevState;
        });
    }

    edit(index) {
        this.setState(prevState => {
            prevState.weeks[index].prevRecipes = prevState.weeks[index].recipes;
            prevState.weeks[index].unsaved = true;
            return prevState;
        });
    }

    save(index) {
        api.saveWeek(this.state.weeks[index]).then(() => {
            this.setState(prevState => {
                prevState.weeks[index].unsaved = undefined;
                prevState.weeks[index].cost = prevState.weeks[index].recipes.reduce((sum, recipe) => {
                    return sum + parseFloat(recipe.cost,10);
                },0);
                if(!Number.isInteger(prevState.weeks[index].cost)) {
                    prevState.weeks[index].cost = undefined;
                }
                return prevState;
            });
        });
    }

    delete(index) {
        api.deleteWeek(this.state.weeks[index]).then(() => {
            this.setState(prevState => {
                prevState.weeks.splice(index,1);
                let daysToWeek = (1 + (prevState.weeks[0].week - 1) * 7);
                prevState.nextWeek = new MenuDate(prevState.weeks[0].year,0,daysToWeek).nextDateWeek();
                return prevState;
            });
        });
    }

    cancel(index) {
        this.setState(prevState => {
            if(typeof prevState.weeks[index].prevRecipes !== 'undefined') {
                prevState.weeks[index].recipes = prevState.weeks[index].prevRecipes;
                prevState.weeks[index].prevRecipes = undefined;
                prevState.weeks[index].unsaved = undefined;
            }
            else {
                prevState.weeks.splice(index,1);
                let daysToWeek = (1 + (prevState.weeks[0].week - 1) * 7);
                prevState.nextWeek = new MenuDate(prevState.weeks[0].year,0,daysToWeek).nextDateWeek();
            }
            return prevState;
        });
    }

    /**
     * functions for manipulating one recipe card at a time
     */

    randomizeOne(index,place) {
        this.setState(prevState => {
            prevState.weeks[index].recipes[place] = this.chooseRecipe();
            return prevState;
        });
    }

    addOne(index) {
        this.setState(prevState => {
            prevState.weeks[index].recipes.push(this.chooseRecipe());
            return prevState;
        });
    }

    addSearchOne(index,recipe) {
        this.setState(prevState => {
            this.refs.searchQuery.value = '';
            prevState.searchResults = [];
            prevState.weeks[index].recipes.push(recipe);
            return prevState;
        });
    }

    deleteOne(index,place) {
        this.setState(prevState => {
            prevState.weeks[index].recipes.splice(place,1);
            return prevState;
        });
    }

    costOne(index,place,value) {
        this.setState(prevState => {
            prevState.weeks[index].recipes[place].cost = value;
            return prevState;
        });
    }

    searchInput(value) {
        var results = [];

        if(value.length > 0) {
            var split = value.trim().split(/[,]+/);
            var query = new RegExp(split.join('|'),'i');

            results = this.state.recipes.filter(recipe => {
                return recipe.name.search(query) > -1 || (recipe.description != null && recipe.description.search(query) > -1) || (recipe.ingredients != null && recipe.ingredients.search(query) > -1);
            });
        }
        else {
            results = this.state.recipes;
        }

        this.setState(prevState => {
            return prevState.searchResults = results;
        });
    }

    /**
     * render!
     */

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <button className="btn btn-default" onClick={() => this.addWeek(this.state.nextWeek.getDateWeek(),this.state.nextWeek.getFullYear())}><span className="glyphicon glyphicon-plus"></span> Week {this.state.nextWeek.getDateWeek()}</button>
                    <br/><br/>
                    {
                        this.state.weeks.length > 0 && this.state.weeks.map((w, i) =>
                            <div key={`week-${w.week}-${w.year}`}>
                                <h2>
                                    Week {w.week}, {w.year}
                                    {
                                        w.unsaved ? 
                                            <span>
                                                &nbsp;<button className="btn btn-sm btn-default" onClick={() => this.randomizeAll(i)}><span className="glyphicon glyphicon-refresh"></span> Randomize</button>
                                                &nbsp;<button className="btn btn-sm btn-success" onClick={() => this.save(i)}><span className="glyphicon glyphicon-ok"></span> Save</button>
                                                &nbsp;<button className="btn btn-sm btn-danger" onClick={() => this.delete(i)}><span className="glyphicon glyphicon-remove"></span> Delete</button>
                                                &nbsp;<button className="btn btn-sm btn-default" onClick={() => this.cancel(i)}><span className="glyphicon glyphicon-remove"></span> Cancel</button>
                                            </span>:
                                            (w.cost !== null && typeof w.cost !== 'undefined') ?
                                                <span>&nbsp;&nbsp;|&nbsp;&nbsp;${w.cost}</span>:
                                                <span>
                                                    &nbsp;<button className="btn btn-sm btn-default" onClick={() => this.edit(i)}><span className="glyphicon glyphicon-pencil"></span> Edit</button>
                                                </span>
                                    }
                                </h2>
                                <section className={w.unsaved ? 'unsaved weeklist recipelist' : 'weeklist recipelist'}>
                                    {
                                        w.recipes.length ? 
                                            w.unsaved ?
                                                w.recipes.map((r, x) =>
                                                        <Recipe key={`recipe-${x}-${r.id}`} index={x} windex={i} delete={(windex, index) => this.deleteOne(windex, index)} randomize={(windex, index) => this.randomizeOne(windex, index)} costField={(windex, index, value) => this.costOne(windex, index, value)} {...r}/>
                                                ):
                                                w.recipes.map((r, x) =>
                                                        <Recipe key={`recipe-${x}-${r.id}`} index={x} {...r}/>
                                                ):
                                            null
                                    }
                                    {
                                        w.unsaved && w.recipes.length < 7 ?
                                            <article className="recipeadd" onClick={() => this.addOne(i)}>
                                                <div className="recipe-search navbar-form form-group" role="search" onClick={(e) => e.stopPropagation()} >
                                                    <div className="icon-addon addon-md">
                                                        <input autoComplete="false" ref="searchQuery" onChange={(event) => this.searchInput(event.target.value)} type="search" placeholder="Search" className="form-control" id="search"/>
                                                        <label htmlFor="search" className="glyphicon glyphicon-search" rel="tooltip" title="email"></label>
                                                        {
                                                            this.state.searchResults.length > 0 ?
                                                            <ul className="search-results">
                                                                {
                                                                    this.state.searchResults.map((r,x) =>
                                                                        <li key={`recipe-search-results-${x}`} onClick={() => this.addSearchOne(i,r)}><img alt="thumbnail" src={`http://192.168.1.20:8000/static/thumbs/${r.front}.jpg`}/> <span>{r.name}</span></li>
                                                                    )
                                                                }
                                                            </ul>:
                                                            null
                                                        }
                                                    </div>
                                                </div>
                                            </article>:
                                            null
                                    }
                                </section>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}