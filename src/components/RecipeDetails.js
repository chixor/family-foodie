import React, { Component } from 'react'
import api from '../utils/api'

export default class RecipeDetails extends Component {
    constructor(props) {
        super()
        this.state = {
            recipe: {},
            recipeIngredients: [],
            measurements: [],
            ingredients: [],
            editing: false
        }
        this.form = {
            two: new Map(),
            four: new Map(),
            measurement: new Map(),
            ingredient: new Map(),
            recipeIngredientId: new Map(),
            fresh: new Map()
        }
    }

    componentDidMount() {
        this.getRecipe()
        this.getRecipeIngredients()
        this.getMeasurements()
    }

    save = () => {
        var ingredients = []
        Object.keys(this.form).map(key => {
            Array.from(this.form[key].values())
                .filter(node => node != null)
                .forEach((node, index) => {
                    if (typeof ingredients[index] === 'undefined') {
                        ingredients[index] = {}
                    }
                    ingredients[index][key] = node.type === 'checkbox' ? node.checked : node.value
                })
            return true
        })

        api.saveRecipeIngredients(this.props.match.params.recipeId, ingredients).then(() => {
            this.getRecipeIngredients()
            this.toggleEdit()
        })
    }

    delete = () => {
        api.deleteRecipeIngredients(this.props.match.params.recipeId).then(() => {
            this.toggleEdit()
        })
    }

    toggleEdit = index => {
        let { editing, recipeIngredients } = this.state
        editing = !this.state.editing

        if (editing && recipeIngredients.length === 0) {
            recipeIngredients.push({}, {}, {}, {}, {})
        }
        this.setState({ editing, recipeIngredients })
    }

    getRecipe() {
        api.getRecipe(parseInt(this.props.match.params.recipeId, 10)).then(recipe => {
            this.setState({ recipe })
        })
    }

    getRecipeIngredients() {
        api.getRecipeIngredients(parseInt(this.props.match.params.recipeId, 10)).then(recipeIngredients => {
            this.setState({ recipeIngredients })
        })
    }

    getMeasurements() {
        api.getMeasurements().then(measurements => {
            this.setState({ measurements })
        })
    }

    getIngredients() {
        api.getIngredients().then(ingredients => {
            this.setState({ ingredients })
        })
    }

    addIngredient() {
        let recipeIngredients = this.state.recipeIngredients
        recipeIngredients.push({})
        this.setState({ recipeIngredients })
    }

    deleteIngredient(i, id) {
        let recipeIngredients = this.state.recipeIngredients
        recipeIngredients.splice(i, 1)
        api.deleteRecipeIngredient(this.props.match.params.recipeId, id).then(() => {
            this.setState({ recipeIngredients })
        })
    }

    render() {
        var front, back, thumb, pdf

        if (this.state.recipe.front) {
            pdf = <a href={`/assets/resources/${this.state.recipe.front}.pdf`}>Load PDF File</a>
            front = (
                <img
                    alt="front of recipe card"
                    className="recipe-detail-card"
                    src={`/assets/${this.state.recipe.front}.jpg`}
                />
            )
            thumb = (
                <img
                    alt="thumbnail"
                    className="recipe-thumb"
                    src={`/assets/resources/${this.state.recipe.front}.jpg`}
                />
            )
        }

        if (this.state.recipe.back) {
            back = (
                <img
                    alt="back of recipe card"
                    className="recipe-detail-card"
                    src={`/assets/${this.state.recipe.back}.jpg`}
                />
            )
        }

        return (
            <article>
                <div className="recipedetail">
                    <h1>{this.state.recipe.name}</h1>
                    <div className="row">
                        <div className="col-md-5">
                            <center>
                                <p>{thumb}</p>
                            </center>
                            <p>{this.state.recipe.description}</p>
                            <p>{pdf}</p>
                        </div>
                        <div className="col-md-7">
                            <table className="table">
                                {!this.state.editing ? (
                                    <tbody>
                                        <tr>
                                            <th>Ingredients</th>
                                            <th>2p</th>
                                            <th>4p</th>
                                        </tr>
                                        {this.state.recipeIngredients.map((r, i) => (
                                            <tr key={`ingredient-display-table-${i}`}>
                                                <td>{r.ingredient}</td>
                                                <td>
                                                    {r.quantity} {r.quantityMeasure}
                                                    {parseFloat(r.quantity, 10) > 1 ? 's' : null}
                                                </td>
                                                <td>
                                                    {r.quantity4} {r.quantityMeasure}
                                                    {parseFloat(r.quantity4, 10) > 1 ? 's' : null}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ) : (
                                    <tbody>
                                        <tr>
                                            <th>2p</th>
                                            <th>4p</th>
                                            <th>Measure</th>
                                            <th>Ingredients</th>
                                            <th>Buy Fresh?</th>
                                            <th>Delete</th>
                                        </tr>
                                        {this.state.recipeIngredients.map((r, i) => (
                                            <tr className="form-ingredient-group" key={`ingredients-${i}`}>
                                                <td className="form-group">
                                                    <label className="sr-only" htmlFor="2p">
                                                        2p
                                                    </label>
                                                    <input
                                                        defaultValue={r.quantity}
                                                        ref={c => this.form.two.set(i, c)}
                                                        type="text"
                                                        className="form-control"
                                                        id="2p"
                                                        placeholder="2p"
                                                    />
                                                </td>
                                                <td className="form-group">
                                                    <label className="sr-only" htmlFor="4p">
                                                        4p
                                                    </label>
                                                    <input
                                                        defaultValue={r.quantity4}
                                                        ref={c => this.form.four.set(i, c)}
                                                        type="text"
                                                        className="form-control"
                                                        id="4p"
                                                        placeholder="4p"
                                                    />
                                                </td>
                                                <td className="form-group">
                                                    <label className="sr-only" htmlFor="measurement">
                                                        Measurement
                                                    </label>
                                                    {this.state.measurements.length > 0 ? (
                                                        <select
                                                            defaultValue={r.quantityMeasure}
                                                            ref={c => this.form.measurement.set(i, c)}
                                                            id="measurement"
                                                            className="form-control"
                                                        >
                                                            {this.state.measurements.map((m, measure) => (
                                                                <option key={`measurements-${measure}`} value={m.name}>
                                                                    {m.name}(s)
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : null}
                                                </td>
                                                <td className="form-group">
                                                    <label className="sr-only" htmlFor="ingredient">
                                                        Ingredient
                                                    </label>
                                                    <input
                                                        defaultValue={r.ingredient}
                                                        ref={c => this.form.ingredient.set(i, c)}
                                                        type="text"
                                                        className="form-control"
                                                        id="ingredient"
                                                        placeholder="Ingredient"
                                                    />
                                                    <input
                                                        defaultValue={r.id}
                                                        ref={c => this.form.recipeIngredientId.set(i, c)}
                                                        type="hidden"
                                                        id="recipeIngredientId"
                                                    />
                                                </td>
                                                <td className="form-group">
                                                    <label>
                                                        <input
                                                            defaultChecked={r.fresh}
                                                            ref={c => this.form.fresh.set(i, c)}
                                                            type="checkbox"
                                                        />{' '}
                                                        {r.fresh}
                                                    </label>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => this.deleteIngredient(i, r.id)}
                                                        className="btn btn-danger"
                                                    >
                                                        <span className="glyphicon glyphicon-remove" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            </table>
                            {!this.state.editing ? (
                                <button onClick={() => this.toggleEdit()} className="btn btn-default">
                                    <span className="glyphicon glyphicon-pencil" /> Edit
                                </button>
                            ) : (
                                <div>
                                    <button onClick={() => this.addIngredient()} className="btn btn-default">
                                        <span className="glyphicon glyphicon-plus" /> Add Ingredient
                                    </button>
                                    &nbsp;<button onClick={() => this.save()} className="btn btn-success">
                                        <span className="glyphicon glyphicon-ok" /> Save
                                    </button>
                                    &nbsp;<button onClick={() => this.delete()} className="btn btn-danger">
                                        <span className="glyphicon glyphicon-remove" /> Delete
                                    </button>
                                    &nbsp;<button onClick={() => this.toggleEdit()} className="btn btn-default">
                                        <span className="glyphicon glyphicon-remove" /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <br />
                <br />
                {front}
                {back}
            </article>
        )
    }
}
