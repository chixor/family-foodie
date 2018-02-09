import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

export default class Recipe extends Component {
    render() {
        let randomBtn,
            deleteBtn,
            cost = null
        if (typeof this.props.randomize !== 'undefined') {
            randomBtn = (
                <div
                    title="randomize"
                    className="corner-triangle-left"
                    onClick={() => this.props.randomize(this.props.windex, this.props.index)}
                >
                    <span className="glyphicon glyphicon-refresh" />
                </div>
            )
        }
        if (typeof this.props.delete !== 'undefined') {
            deleteBtn = (
                <div
                    title="remove"
                    className="corner-triangle-right"
                    onClick={() => this.props.delete(this.props.windex, this.props.index)}
                >
                    <span className="glyphicon glyphicon-remove" />
                </div>
            )
        }
        if (typeof this.props.cost !== 'undefined' && this.props.cost !== null) {
            cost = (
                <span className="pricetag">
                    <sup>$</sup>
                    {this.props.cost.toFixed(2)}
                </span>
            )
        }

        return (
            <article>
                {deleteBtn}
                {randomBtn}
                <NavLink target="_blank" to={`/recipe/${this.props.id}`}>
                    <img className="heroimage" alt="thumbnail" src={`/assets/resources/${this.props.front}.jpg`} />
                </NavLink>
                <h3>{this.props.name}</h3>
                <p>
                    <span className="glyphicon glyphicon-time" /> {this.props.prepTime + this.props.cookTime}min{cost}
                </p>
            </article>
        )
    }
}
