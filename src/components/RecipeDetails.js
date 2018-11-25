import React, { Component } from 'react'
import { NotificationManager } from 'react-notifications'
import api from '../utils/api'

export default class RecipeDetails extends Component {
    constructor(props) {
        super()
        this.state = {
            recipe: {},
            recipeIngredients: [],
            measurements: {},
            ingredients: [],
            deleteIngredients: [],
            editing: false
        }
        this.detailsForm = {};
        this.ingredientsForm = {
            two: new Map(),
            four: new Map(),
            measurement: new Map(),
            ingredient: new Map(),
            recipeIngredientId: new Map(),
            fresh: new Map()
        }
    }

    componentDidMount() {
        this.getIngredients()
        this.getMeasurements()
        if(this.props.match.params.recipeId) {
          this.getRecipe()
          this.getRecipeIngredients()
        } else {
          this.toggleEdit()
        }
    }

    fileReader = (file, destination, fileTypes, fileSize, error) => {
      const extension = file.name.split('.').pop().toLowerCase()
      const acceptedFileType = fileTypes.indexOf(extension) > -1;
      const acceptedFileSize = file.size <= fileSize

      if (file && acceptedFileType && acceptedFileSize) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = e => this.detailsForm[destination] = e.target.result
      } else {
        NotificationManager.error(error)
      }
    }

    save = () => {
        let details = {}, valid = true
        Object.keys(this.detailsForm).map(key => {
            if(typeof this.detailsForm[key] == 'string') {
                details[key] = this.detailsForm[key]
            } else {
                if(this.detailsForm[key].required && this.detailsForm[key].value == '') {
                    valid = false
                    NotificationManager.error(`${key} is required`)
                } else {
                    details[key] = (this.detailsForm[key].type == 'number') ?
                        this.detailsForm[key].valueAsNumber :
                            this.detailsForm[key].value !== '' ?
                                this.detailsForm[key].value :
                                null
                }
            }
        })

        let ingredients = []
        Object.keys(this.ingredientsForm).map(key => {
            Array.from(this.ingredientsForm[key].values())
                .filter(node => node != null)
                .forEach((node, index) => {
                    if (typeof ingredients[index] === 'undefined') {
                        ingredients[index] = {}
                    }
                    ingredients[index][key] = node.type === 'checkbox' ? node.checked : node.value
                    if(node.type === 'hidden' && !parseInt(node.value)) {
                        delete ingredients[index][key]
                    }
                })
            return true
        })
        ingredients = ingredients.filter(i => i.ingredient !== '')

        valid && api.saveRecipe(this.props.match.params.recipeId, details, ingredients, this.state.deleteIngredients).then((result) => {
            if(result !== null) {
                window.location.href = `/recipe/${result}`
            }
        })
    }

    toggleEdit = index => {
        let { editing, recipeIngredients } = this.state
        editing = !this.state.editing

        if (editing && recipeIngredients.length === 0) {
            recipeIngredients.push({id:this.randomId()}, {id:this.randomId()}, {id:this.randomId()}, {id:this.randomId()}, {id:this.randomId()})
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

    getIngredients() {
        api.getIngredients().then(ingredients => {
            this.setState({ ingredients })
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

    randomId() {
      return Math.random().toString(36)
    }

    addIngredient() {
        let recipeIngredients = this.state.recipeIngredients
        recipeIngredients.push({id:this.randomId()})
        this.setState({ recipeIngredients })
    }

    deleteIngredient(i, id) {
        let recipeIngredients = this.state.recipeIngredients
        let deleteIngredients = this.state.deleteIngredients
        recipeIngredients.splice(i, 1)
        if(typeof id !== 'undefined') {
            deleteIngredients.push(id)
        }
        this.setState({ recipeIngredients, deleteIngredients })
    }

    render() {
        const addRecipe = typeof this.props.match.params.recipeId === 'undefined'
        let pdf, thumb;
        if(this.state.recipe.filename) {
            pdf = <a href={`/assets/resources/${this.state.recipe.filename}.pdf`}>Recipe PDF File</a>
            thumb = (
                <img
                    alt="thumbnail"
                    className="recipe-thumb"
                    src={`/assets/resources/${this.state.recipe.filename}.jpg`}
                />
            )
        }

        const detailView = (
            <div>
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
                    </table>
                </div>
            </div>
            <hr/>
            <button onClick={() => this.toggleEdit()} className="btn btn-default">
                <span className="glyphicon glyphicon-pencil" /> Edit
            </button>
            </div>
          );

          const editView = (
            <div>
            <h1>{addRecipe ? 'Add' : 'Edit'} Recipe</h1>
            <div className="row">
                <div className="col-md-5">
                    <div className="form-group">
                      <label for="recipename">Name</label>
                      <input className="form-control input-lg" id="recipename" ref={c => this.detailsForm.name = c} name="name" type="text" required="true" value={this.state.recipe.name}/>
                    </div>
                    <div className="form-group">
                      <label for="recipedescription">Description</label>
                      <textarea required="true" id="recipedescription" rows="5" ref={c => this.detailsForm.description = c} className="form-control" name="description">{this.state.recipe.description}</textarea>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                              <label for="recipeimage">Upload image</label>
                              <input required="true" id="recipeimage" name="image" onChange={e => { if(e.target.files.length > 0) this.fileReader(e.target.files[0], 'image', ['jpg'], 1000000, "Images need to be 'jpg' and be smaller than 2mb") }} type="file" required="true"/>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                              <label for="recipepdf">Upload PDF (optional)</label>
                              <input id="recipepdf" name="pdf" type="file" onChange={e => { if(e.target.files.length > 0) this.fileReader(e.target.files[0], 'pdf', ['pdf'], 1000000, "PDFs need to be 'pdf' and be smaller than 2mb") }} required="true"/>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                              <label for="recipeprep">Preparation Time</label>
                              <input className="form-control" id="recipeprep" name="prep" type="number" ref={c => this.detailsForm.prepTime = c} value={this.state.recipe.prepTime} required="true"/>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                              <label for="recipecook">Cooking Time</label>
                              <input className="form-control" id="recipecook" name="cook" type="number" ref={c => this.detailsForm.cookTime = c} value={this.state.recipe.cookTime} required="true"/>
                            </div>
                        </div>
                    </div>
                    <h3>Meal Planner Options</h3>
                    <p>Used by the automatic meal planner to provide healthy variety with seasonal awareness.</p>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                              <label for="primary-type">Primary Ingredient</label>
                              {this.state.measurements.primaryType ? (
                                  <select
                                      required="true"
                                      defaultValue={this.state.recipe.primaryType__name}
                                      ref={c => this.detailsForm.primaryType = c}
                                      id="primary-type"
                                      className="form-control"
                                  >
                                      <option></option>
                                      {this.state.measurements.primaryType.map((m, measure) => (
                                          <option key={`primary-type-${measure}`} value={m.name}>
                                              {m.name}
                                          </option>
                                      ))}
                                  </select>
                              ) : null}
                            </div>
                      </div>
                      <div className="col-md-4">
                          <div className="form-group">
                              <label for="secondary-type">Secondary Ingredient</label>
                              {this.state.measurements.secondaryType ? (
                                  <select
                                      required="true"
                                      defaultValue={this.state.recipe.secondaryType__name}
                                      ref={c => this.detailsForm.secondaryType = c}
                                      id="secondary-type"
                                      className="form-control"
                                  >
                                      <option></option>
                                      {this.state.measurements.secondaryType.map((m, measure) => (
                                          <option key={`secondary-type-${measure}`} value={m.name}>
                                              {m.name}
                                          </option>
                                      ))}
                                  </select>
                              ) : null}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                              <label for="season">Season (optional)</label>
                              {this.state.measurements.season ? (
                                  <select
                                      defaultValue={this.state.recipe.season__name}
                                      ref={c => this.detailsForm.season = c}
                                      id="season"
                                      className="form-control"
                                  >
                                      <option></option>
                                      {this.state.measurements.season.map((m, measure) => (
                                          <option key={`season-${measure}`} value={m.name}>
                                              {m.name}
                                          </option>
                                      ))}
                                  </select>
                              ) : null}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-7">
                    <datalist id="all-ingredients">
                      {this.state.ingredients.map(ing =>
                        <option value={ing.ingredient__name}/>
                      )}
                    </datalist>
                    <table className="table">
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
                            <tr className="form-ingredient-group" key={`ingredients-${r.id}`}>
                                <td className="form-group">
                                    <label className="sr-only" htmlFor="2p">
                                        2p
                                    </label>
                                    <input
                                        defaultValue={r.quantity}
                                        ref={c => this.ingredientsForm.two.set(i, c)}
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
                                        ref={c => this.ingredientsForm.four.set(i, c)}
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
                                    {this.state.measurements.measure ? (
                                        <select
                                            defaultValue={r.quantityMeasure}
                                            ref={c => this.ingredientsForm.measurement.set(i, c)}
                                            id="measurement"
                                            className="form-control"
                                        >
                                            {this.state.measurements.measure.map((m, measure) => (
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
                                        ref={c => this.ingredientsForm.ingredient.set(i, c)}
                                        type="text"
                                        className="form-control"
                                        id="ingredient"
                                        placeholder="Ingredient"
                                        list="all-ingredients"
                                    />
                                    <input
                                        defaultValue={r.id}
                                        ref={c => this.ingredientsForm.recipeIngredientId.set(i, c)}
                                        type="hidden"
                                        id={`recipeIngredientId-${r.id}`}
                                    />
                                </td>
                                <td className="form-group">
                                    <label>
                                        <input
                                            defaultChecked={r.fresh}
                                            ref={c => this.ingredientsForm.fresh.set(i, c)}
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
                    </table>
                    <div>
                        <button onClick={() => this.addIngredient()} className="btn btn-default">
                            <span className="glyphicon glyphicon-plus" /> Add Ingredient
                        </button>
                    </div>
                </div>
            </div>
            <hr/>
            <button onClick={() => this.save()} className="btn btn-success">
                <span className="glyphicon glyphicon-ok" /> Save
            </button>
            {!addRecipe ? (
                <span>
                    &nbsp;<button onClick={() => this.toggleEdit()} className="btn btn-default">
                        <span className="glyphicon glyphicon-remove" /> Cancel
                    </button>
                </span>
            ) : (
                <span>
                    &nbsp;<a href="/recipes" className="btn btn-default">
                        <span className="glyphicon glyphicon-remove" /> Cancel
                    </a>
                </span>
            )}
            </div>
          );

        return (
            <article>
                <div className="recipedetail">
                {!this.state.editing ? detailView : editView}
                </div>
                <br />
                <br />
            </article>
        )
    }
}
