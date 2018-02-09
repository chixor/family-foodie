import React, { Component } from 'react'
import api from '../utils/api'
import MenuDate from '../utils/MenuDate'
import { NotificationManager } from 'react-notifications'

export default class Shopping extends Component {
    constructor(props) {
        super()
        this.state = {
            ingredients: [],
            cost: 0,
            editPrices: false,
            offerDefaultPriceChange: []
        }
        this.firstDay = new MenuDate().toFirstDayOfTheWeek()
        this.lastDay = new MenuDate().toLastDayOfTheWeek()
        this.datestamp = {
          week: this.firstDay.getDateWeek(),
          year: this.firstDay.getFullYear()
        }
    }

    componentDidMount() {
      const { week, year } = this.props.match.params
      if(week && year) {
        this.firstDay = new MenuDate(year, week).toFirstDayOfTheWeek()
        this.lastDay = new MenuDate(year, week).toLastDayOfTheWeek()
        this.datestamp = { week, year }
      }

      api.shoppingListWeek(this.datestamp).then((ingredients) => {
          var cost = 0, offerDefaultPriceChange = []
          if(ingredients.fresh.length > 0) {
            cost = ingredients.fresh.reduce((a, b) => { return b.cost ? {cost: a.cost + Number(b.cost)} : {cost: a.cost}})
            ingredients.fresh.forEach((i) => {
              offerDefaultPriceChange[i.ingredientId] = i.cost !== i.defaultCost
            })
          }

          this.setState({ ingredients, offerDefaultPriceChange, cost: cost.cost })
      })
    }

    reset = () => {
      api.resetShoppingList(this.datestamp).then(() => {
        window.location.reload()
      })
    }

    checkAvailability = () => {
      api.checkAvailability(this.state.ingredients.fresh).then((result) => {
        var ingredients = this.state.ingredients
        result.forEach((i,k) => {
          ingredients.fresh[k].isPurchasable = i.IsPurchasable
        })
        NotificationManager.success('Available ingredients highlighted in green')
        this.setState({ ingredients })
      })
    }

    save = () => {
      api.saveShoppingList(
        this.datestamp,
        this.state.ingredients.fresh.concat(this.state.ingredients.pantry)
      )
    }

    dragStart = (ingredient, fromList, fromIndex) => {
      this.setState({ drag: { ingredient, fromList, fromIndex } })
    }

    dragOverTable = (e) => {
      e.preventDefault()
    }

    dragEnterRow = (toList, toIndex) => {
      var drag = this.state.drag
      drag.toIndex = toIndex
      drag.toList = toList

      var ingredients = this.state.ingredients
      Object.keys(ingredients).forEach((key) => {
        ingredients[key].forEach((ingredient) => {
          ingredient.dragover = false
        })
      })
      ingredients[toList][toIndex].dragover = true

      this.setState({ ingredients, drag })
    }

    drop = () => {
      var ingredients = this.state.ingredients, drag = this.state.drag, cost
      Object.keys(ingredients).forEach((key) => {
        ingredients[key].forEach((ingredient) => {
          ingredient.dragover = false
        })
      })

      if(!drag.ingredient.ingredientId && drag.toList === 'pantry') {
        this.setState({ drag: undefined })
        NotificationManager.warning('Cannot save that to the pantry')
        this.setState({ ingredients })
        return
      }

      drag.ingredient.fresh = (drag.toList === 'fresh')
      ingredients[drag.fromList].splice(drag.fromIndex, 1)
      drag.toIndex = (drag.toList === drag.fromList && drag.toIndex < drag.fromIndex || drag.toList !== drag.fromList)
        ? drag.toIndex + 1
        : drag.toIndex

      ingredients[drag.toList].splice(drag.toIndex, 0, drag.ingredient)
      cost = ingredients.fresh.reduce((a, b) => ({cost: a.cost + Number(b.cost)}))
      this.setState({ ingredients, cost: cost.cost, drag: undefined }, this.save)
    }

    add = (e) => {
      e.stopPropagation()
      e.preventDefault()

      api.addShoppingListItem(
        this.datestamp,
        this.refs.newIngredient.value
      ).then((id) => {
        if(!id) return
        var ingredients = this.state.ingredients
        ingredients.fresh.push({id: id, cost: null, fresh: true, ingredient: this.refs.newIngredient.value, purchased: false})
        this.refs.newIngredient.value = ''
        this.setState({ ingredients })
      })
    }

    delete = (index) => {
      api.deleteShoppingListItem(
        this.datestamp,
        this.state.ingredients.fresh[index].id
      ).then(() => {
        var ingredients = this.state.ingredients
        ingredients.fresh.splice(index, 1)
        this.setState({ ingredients })
      })
    }

    purchase = (index) => {
      var purchased = !this.state.ingredients.fresh[index].purchased
      api.purchaseShoppingListItem(
        this.datestamp,
        this.state.ingredients.fresh[index].id,
        this.state.ingredients.fresh[index].ingredientId,
        purchased
      ).then(() => {
        var ingredients = this.state.ingredients
        ingredients.fresh[index].purchased = purchased
        this.setState({ ingredients })
      })
    }

    editPrices = () => {
      var offerDefaultPriceChange = this.state.offerDefaultPriceChange
      if(this.state.editPrices) {
        var ingredients = this.state.ingredients
        ingredients.fresh = this.state.ingredients.fresh.map(i => {
          if(i.ingredientId) {
            i.cost = parseFloat(this.refs['cost-'+i.ingredientId].value) || null
            i.replaceDefaultCost = (this.refs['costDefault-'+i.ingredientId] && this.refs['costDefault-'+i.ingredientId].checked) || false
          }
          return i
        })
        api.saveShoppingList(this.datestamp, ingredients.fresh).then(() => {
          const cost = ingredients.fresh.reduce((a, b) => ({cost: a.cost + Number(b.cost)}))
          ingredients.fresh.forEach((i) => {
            if(i.replaceDefaultCost) {
              i.defaultCost = i.cost
              i.replaceDefaultCost = false
              offerDefaultPriceChange[i.ingredientId] = false
            }
          })
          this.setState({editPrices: !this.state.editPrices, ingredients, offerDefaultPriceChange, cost: cost.cost})
        })
      } else {
        this.setState({editPrices: !this.state.editPrices})
      }
    }

    onChangePrice = (ingredient) => {
      const ref = this.refs['cost-'+ingredient.ingredientId]
      var offerDefaultPriceChange = this.state.offerDefaultPriceChange
      offerDefaultPriceChange[ingredient.ingredientId] = false

      if(ref && parseFloat(ref.value) !== ingredient.defaultCost) {
        offerDefaultPriceChange[ingredient.ingredientId] = true
      }

      this.setState({ offerDefaultPriceChange })
    }

    render() {
        return (
            <div>
                <div className="row">
                <div className="col-md-12">
                    <h2 className="shopping-week">
                      Week {this.datestamp.week}
                      <button className="btn btn-default float-right" onClick={() => this.reset()}><span className="glyphicon glyphicon-refresh"/> Reset</button>
                    </h2>
                    <h4 className="shopping-week">
                      {this.firstDay.formatText()} ↣ {this.lastDay.formatText()}
                    </h4>
                </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="recipedetail">
                          <h3>
                            Shopping List
                            <span className="float-right">{this.state.cost && this.state.cost.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}</span>
                          </h3>
                          <table className="table" onDrop={this.drop} onDragOver={this.dragOverTable}>
                              <tbody>
                                  <tr>
                                      <th colSpan="2">Ingredients</th>
                                      <th className="ingredient-quantity">2p</th>
                                      <th colSpan="2" className="ingredient-price">
                                        Price&nbsp;<button className={`btn btn-xs float-right ${this.state.editPrices ? 'btn-success' : 'btn-default'}`} onClick={this.editPrices}>{this.state.editPrices ? 'save':'edit'}</button>
                                      </th>
                                  </tr>
                                  {this.state.ingredients.fresh && this.state.ingredients.fresh.map((r, i) => {
                                    return <tr
                                        className={`${r.purchased ? 'checked' : ''} ${r.dragover ? 'dragover' : ''} ${r.isPurchasable ? 'can-purchase' : ''}`}
                                        draggable="true"
                                        onDragStart={() => this.dragStart(r,'fresh',i)}
                                        onDragEnter={() => this.dragEnterRow('fresh',i)}
                                        key={`ingredient-${r.ingredient}-${r.id}`}
                                      >
                                          <td className={`table-column-tiny supermarket-category supermarket-category-${r.category ? r.category.replace(' & ','').replace(' ','-'): ''}`}><input onChange={() => this.purchase(i)} type="checkbox" checked={r.purchased}/></td>
                                          <td>{r.name || r.ingredient}</td>
                                          <td className="ingredient-quantity">{r.quantity} {r.quantityMeasure}{parseFloat(r.quantity) > 1 ? 's':null}</td>
                                          {r.ingredientId ?
                                            <td className="align-right">
                                                {this.state.editPrices ?
                                                  <div className="popside-container">
                                                    {this.state.offerDefaultPriceChange[r.ingredientId] && <div className="popside">Make this my default price (replace {r.defaultCost && r.defaultCost.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}) <input type="checkbox" ref={'costDefault-'+r.ingredientId}/></div>}
                                                    <input onChange={() => this.onChangePrice(r)} defaultValue={r.cost && r.cost.toFixed(2)} type="text" ref={'cost-'+r.ingredientId} className="form-control price-field" id={`${r.ingredientId}-cost`}/>
                                                  </div>:
                                                  <span>{r.cost && r.cost.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}</span>
                                                }
                                            </td>: <td></td>}
                                            <td className="table-column-tiny align-center pad-left">
                                              {r.stockcode ?
                                                <a title="Woolworths details" target="_blank" href={`https://www.woolworths.com.au/shop/productdetails/${r.stockcode}/`}><span className="glyphicon glyphicon-new-window"/></a>:
                                                <span onClick={() => this.delete(i)} className="glyphicon glyphicon-remove"></span>
                                              }
                                            </td>
                                       </tr>
                                  })}
                                  <tr><td colSpan="5"><form onSubmit={this.add}><input type="text" className="ingredient-input form-control" placeholder="add item..." ref="newIngredient" name="newIngredient"/></form></td></tr>
                              </tbody>
                          </table>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="recipedetail">
                          <h3>Pantry</h3>
                          <table className="table" onDrop={this.drop} onDragOver={this.dragOverTable}>
                              <tbody>
                                  <tr>
                                      <th>Ingredients</th>
                                      <th className="ingredient-quantity">2p</th>
                                  </tr>
                                  {this.state.ingredients.pantry && this.state.ingredients.pantry.map((r, i) => {
                                    return <tr
                                        className={r.dragover ? 'dragover' : ''}
                                        draggable="true"
                                        onDragStart={() => this.dragStart(r,'pantry',i)}
                                        onDragEnter={() => this.dragEnterRow('pantry',i)}
                                        key={`ingredient-${r.ingredient}-${r.id}`}>
                                          <td>{r.ingredient}</td>
                                          <td>{r.quantity} {r.quantityMeasure}{parseFloat(r.quantity) > 1 ? 's':null}</td>
                                      </tr>
                                  })}
                              </tbody>
                          </table>
                        </div>
                    </div>
                </div>
                <br/><br/>
            </div>
        )
    }
}
