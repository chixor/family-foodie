import React from 'react';
import api from '../utils/api';

function getDateWeek(date) {
    var onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

export default class Shopping extends React.Component {
  constructor(props) {
    super();
    this.state = {
      ingredients: []
	}

    this.thisWeek = new Date();
    this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.firstDay = new Date();
    this.firstDay.setHours(-24 * (this.firstDay.getDay()));
    this.firstDayFormat = `${this.days[this.firstDay.getDay()]}  ${this.firstDay.getDate()} ${this.months[this.firstDay.getMonth()]}`;

    this.lastDay = this.firstDay;
    this.lastDay.setHours(24 * 6);
    this.lastDayFormat = `${this.days[this.lastDay.getDay()]}  ${this.lastDay.getDate()} ${this.months[this.lastDay.getMonth()]}`;
  }

  componentDidMount() {
    this.getShopping({week: getDateWeek(this.thisWeek), year: this.thisWeek.getFullYear()});
  }

  getShopping(week) {
    api.shoppingListWeek(week).then((ingredients) => {
      this.setState(prevState => {
      	var ingredientsList = {};
      	ingredientsList.fresh = ingredients.filter(ing => {return ing.fresh});
      	ingredientsList.pantry = ingredients.filter(ing => {return !ing.fresh});
        return prevState.ingredients = ingredientsList;
      });
    });
  }

  render() {
    return (
      <div>
	      <div className="row">
	      <div className="col-md-12">
	      	<h1>Shopping List</h1>
	      	<h2>Week {getDateWeek(this.thisWeek)} ({this.firstDayFormat} - {this.lastDayFormat})</h2>
	      </div>
	      </div>
	      <div className="row">
	            {Object.keys(this.state.ingredients).map((ing, i) =>
	            <div className="col-md-6" key={`ingredients-table-${ing}`}>
	            	<div className="recipedetail">
		            <h3>{ing.charAt(0).toUpperCase() + ing.slice(1)}</h3>
		            <table className="table">
		                <tbody>
		                    <tr>
		                        <th>Ingredients</th>
		                        <th>2p</th>
		                        <th>4p</th>
		                    </tr>
		                    {this.state.ingredients[ing].map((r, i) =>
		                        <tr key={`ingredient-display-table-${i}`}>
		                            <td>{r.ingredient}</td>
		                            <td>{r.quantity} {r.quantityMeasure}{parseFloat(r.quantity) > 1 ? 's':null}</td>
		                            <td>{r.quantity4} {r.quantityMeasure}{parseFloat(r.quantity4) > 1 ? 's':null}</td>
		                        </tr>
		                    )}
		                </tbody>
		            </table>
		            </div>
	            </div>
	            )}
	      </div>
	      <br/><br/>
      </div>
    )
  }
}