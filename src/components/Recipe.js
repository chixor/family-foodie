import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

export default class Recipe extends Component {
    render() {
        let randomBtn,
            deleteBtn,
            deletePermBtn,
            archivePermBtn,
            unarchivePermBtn,
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
        if (typeof this.props.deletePerm !== 'undefined' && this.props.canDelete) {
            deletePermBtn = (
                <button
                    className="btn btn-xs text-danger"
                    onClick={() => this.props.deletePerm(this.props.id)}
                >
                    <span className="glyphicon glyphicon-remove" /> Delete
                </button>
            )
        }
        if (typeof this.props.archivePerm !== 'undefined') {
            archivePermBtn = (
                <button
                    className="btn btn-xs text-primary"
                    onClick={() => this.props.archivePerm(this.props.id)}
                >
                    <span className="glyphicon glyphicon-remove" /> Archive
                </button>
            )
        }
        if (typeof this.props.unarchivePerm !== 'undefined') {
            unarchivePermBtn = (
                <button
                    className="btn btn-xs text-primary"
                    onClick={() => this.props.unarchivePerm(this.props.id)}
                >
                    <span className="glyphicon glyphicon-ok" /> Unarchive
                </button>
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
                <NavLink to={`/recipe/${this.props.id}`}>
                    <img className="heroimage" alt="thumbnail" src={`/assets/resources/${this.props.filename}.jpg`} />
                </NavLink>
                <h3>{this.props.name}</h3>
                <p className="preptime">
                    <span className="glyphicon glyphicon-time" /> {this.props.prepTime + this.props.cookTime}min
                </p>
                {cost}
                {this.props.editable ?
                <p className="actions">
                    {unarchivePermBtn}
                    {archivePermBtn}
                    {deletePermBtn}
                </p> : null}
            </article>
        )
    }
}
