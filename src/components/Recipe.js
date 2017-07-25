import React from 'react';
import { NavLink } from 'react-router-dom';

export default class Recipe extends React.Component {

    render() {
        let randomBtn, deleteBtn, costField, cost = null;
        if(typeof this.props.randomize !== 'undefined') {
          randomBtn = <div title="randomize" className="corner-triangle-left" onClick={() => this.props.randomize(this.props.windex, this.props.index)}><span className="glyphicon glyphicon-refresh"></span></div>;
        }
        if(typeof this.props.delete !== 'undefined') {
          deleteBtn = <div title="remove" className="corner-triangle-right" onClick={() => this.props.delete(this.props.windex, this.props.index)}><span className="glyphicon glyphicon-remove"></span></div>;
        }
        if(typeof this.props.costField !== 'undefined') {
          costField = <div className="form-group recipe-cost-field">
                <label className="sr-only" htmlFor="cost">cost</label>
                <input defaultValue={this.props.cost} onChange={(e) => this.props.costField(this.props.windex, this.props.index, e.target.value)} type="text" className="form-control" id="cost" placeholder="cost"/>
            </div>
        }
        if(typeof this.props.cost !== 'undefined' && this.props.cost !== null) {
          cost = <span>&nbsp;&nbsp;|&nbsp;&nbsp;${this.props.cost}</span>
        }

        return (
            <article>
                {deleteBtn}{randomBtn}
                <NavLink target="_blank" to={`/recipe/${this.props.id}`}>
                    <img className="heroimage" alt="thumbnail" src={`/static/resources/${this.props.front}.jpg`}/>
                </NavLink>
                <h3>{this.props.name}</h3>
                {costField}
                <p><span className="glyphicon glyphicon-time"></span> {this.props.prepTime + this.props.cookTime}min{cost}</p>
            </article>
        );
    }
};