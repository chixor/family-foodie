import React, { Component } from 'react'
import api from '../modules/api'
import MenuDate from '../modules/MenuDate'

export default class Shopping extends Component {
  constructor (props) {
    super()
    this.state = {
      ingredients: []
    }
    this.firstDay = new MenuDate().toFirstDayOfTheWeek()
    this.lastDay = new MenuDate().toLastDayOfTheWeek()
  }

  componentDidMount () {
    api.shoppingListWeek({week: this.firstDay.getDateWeek(), year: this.firstDay.getFullYear()}).then((ingredients) => {
      this.setState(prevState => {
        var ingredientsList = {}
        ingredientsList.fresh = ingredients.filter(ing => { return ing.fresh })
        ingredientsList.pantry = ingredients.filter(ing => { return !ing.fresh })
        prevState.ingredients = ingredientsList
        return prevState
      })
    })
  }

  render () {
    return (
      <div>
        <div className='row'>
          <div className='col-md-12'>
            <h1>Shopping List</h1>
            <h2>Week {this.firstDay.getDateWeek()} ({this.firstDay.formatText()} - {this.lastDay.formatText()})</h2>
          </div>
        </div>
        <div className='row'>
          {Object.keys(this.state.ingredients).map((ing, i) =>
            <div className='col-md-6' key={`ingredients-table-${ing}`}>
              <div className='recipedetail'>
                <h3>{ing.charAt(0).toUpperCase() + ing.slice(1)}</h3>
                <table className='table'>
                  <tbody>
                    <tr>
                      <th>Ingredients</th>
                      <th>2p</th>
                      <th>4p</th>
                    </tr>
                    {this.state.ingredients[ing].map((r, i) =>
                      <tr key={`ingredient-display-table-${i}`}>
                        <td>{r.ingredient}</td>
                        <td>{r.quantity} {r.quantityMeasure}{parseFloat(r.quantity) > 1 ? 's' : null}</td>
                        <td>{r.quantity4} {r.quantityMeasure}{parseFloat(r.quantity4) > 1 ? 's' : null}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <br /><br />
      </div>
    )
  }
}
