import React, { Component } from 'react'
import { NotificationManager } from 'react-notifications'
import api from '../utils/api'

export default class Ingredients extends Component {
    constructor(props) {
        super()
        this.state = {
            ingredients: [],
            categories: [],
            editing: []
        }
        this.forms = {}
    }

    componentDidMount() {
        this.load()
    }

    load = () => {
        api.getIngredients().then(ingredients => {
            api.getCategories().then(categories => {
                this.setState({ ingredients, categories })
            })
        })
    }

    edit = (id) => {
        let editing = this.state.editing
        editing.push(id)
        this.forms[id] = {}
        this.setState({ editing })
    }

    save = (id) => {
      let editing = this.state.editing

      let details = {}, valid = true
      Object.keys(this.forms[id]).map(key => {
          if(this.forms[id][key].type === 'checkbox') {
              details[key] = this.forms[id][key].checked
          } else if(typeof this.forms[id][key] === 'string') {
              details[key] = this.forms[id][key]
          } else {
              if(this.forms[id][key].required && this.forms[id][key].value === '') {
                  valid = false
                  NotificationManager.error(`${key} is required`)
              } else {
                  details[key] = this.forms[id][key].value !== '' ?
                      this.forms[id][key].value :
                      null
              }
          }
      })
      
      valid && api.saveIngredient(id, details).then(() => {
          editing.splice(editing.indexOf(id), 1)
          this.setState({ editing }, () => this.load())
      })
    }

    render() {
        return (
            <section className="recipelist">
                <h2>Ingredients</h2>
                <p>{this.state.ingredients.length} found</p>
                <div className="recipedetail" style={{marginTop: '20px'}}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th colSpan="2">Name</th>
                          <th className="align-center">Buy Fresh?</th>
                          <th className="align-right">Default Price</th>
                          <th className="align-right">Stockcode</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                      {this.state.ingredients.map((i, x) =>
                          this.state.editing.indexOf(i.ingredient_id) > -1 ?
                          <tr>
                            <td className={`table-column-tiny supermarket-category supermarket-category-${
                                i.category__name
                                    ? i.category__name.replace(' & ', '').replace(' ', '-')
                                    : ''
                            }`} title={i.category__name}>
                                <select
                                    required="true"
                                    defaultValue={i.category__id}
                                    ref={c => this.forms[i.ingredient_id].category = c}
                                    className="form-control"
                                    style={{width: '100px'}}
                                    id={`${i.ingredient_id}-category`}
                                >
                                    {this.state.categories.map(cat =>
                                        <option key={`category-${i.ingredient_id}-${cat.id}`} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    )}
                                </select>
                            </td>
                            <td>{i.ingredient__name}</td>
                              <td className="form-group align-center">
                                  <label>
                                      <input
                                          ref={c => this.forms[i.ingredient_id].fresh = c}
                                          defaultChecked={i.fresh}
                                          type="checkbox"
                                          id={`${i.ingredient_id}-fresh`}
                                      />{' '}
                                      {i.fresh}
                                  </label>
                              </td>
                              <td className="align-right">
                                  $<input
                                      defaultValue={i.cost && i.cost.toFixed(2)}
                                      type="text"
                                      ref={c => this.forms[i.ingredient_id].cost = c}
                                      className="form-control price-field"
                                      id={`${i.ingredient_id}-cost`}
                                  />
                              </td>
                              <td className="align-right">
                                  <input
                                      style={{width: '80px'}}
                                      defaultValue={i.stockcode}
                                      type="text"
                                      ref={c => this.forms[i.ingredient_id].stockcode = c}
                                      className="form-control price-field"
                                      id={`${i.ingredient_id}-stockcode`}
                                  />
                              </td>
                              <td>
                                  <button className="btn btn-xs btn-success float-right" onClick={() => this.save(i.ingredient_id)}>
                                    <span className="glyphicon glyphicon-ok" /> save
                                  </button>
                              </td>
                          </tr> : <tr>
                           <td className={`table-column-tiny supermarket-category supermarket-category-${
                               i.category__name
                                   ? i.category__name.replace(' & ', '').replace(' ', '-')
                                   : ''
                           }`} title={i.category__name}></td>
                           <td>{i.ingredient__name}</td>
                             <td className="align-center"><span className={i.fresh ? 'glyphicon glyphicon-ok' : null} /></td>
                             <td className="align-right">{i.cost && i.cost.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}</td>
                             <td className="align-right">{i.stockcode ?
                               <a
                                   title="Woolworths details"
                                   target="_blank"
                                   href={`https://www.woolworths.com.au/shop/productdetails/${
                                       i.stockcode
                                   }/`}
                               >
                                   {i.stockcode} <span className="glyphicon glyphicon-new-window" />
                               </a>: null}
                             </td>
                             <td>
                                 <button className="btn btn-xs btn-default float-right" onClick={() => this.edit(i.ingredient_id)}>
                                   <span className="glyphicon glyphicon-pencil" /> edit
                                 </button>
                             </td>
                         </tr>
                      )}
                      </tbody>
                    </table>
                </div>
            </section>
        )
    }
}
