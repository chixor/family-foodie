import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import api from '../utils/api'
import { NotificationManager } from 'react-notifications'

export default class Nav extends Component {

    componentDidMount() {
        this.getUser()
    }

    getUser = () => {
        api.getUser().then(account => {
            this.setState({ account })
        })
    }

    render() {
        let account, username;
        if(this.state && this.state.account) {
          account = this.state.account.account
          username = this.state.account.username
        }

        return (
            <div>
                <nav className="navbar navbar-inverse">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button
                                type="button"
                                className="navbar-toggle collapsed"
                                data-toggle="collapse"
                                data-target="#bs-example-navbar-collapse-1"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar" />
                                <span className="icon-bar" />
                                <span className="icon-bar" />
                            </button>
                            <a className="navbar-brand" href="/">
                                <img alt="logo" src="/static/favicon.png" />
                                {account}
                            </a>
                        </div>

                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="nav navbar-nav">
                                <li>
                                    <NavLink exact activeClassName="active" to="/planner">
                                        Planner
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink activeClassName="active" to="/shopping">
                                        Shopping
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink activeClassName="active" to="/recipes">
                                        Recipes
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink activeClassName="active" to="/ingredients">
                                        Ingredients
                                    </NavLink>
                                </li>
                            </ul>
                            <div className="nav navbar-nav navbar-right">
                                <a href="/accounts/logout" className="btn btn-success navbar-btn">
                                    Logout
                                </a>
                            </div>
                            <div className="nav navbar-nav navbar-right">
                                <span className="navbar-text">{username}</span>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        )
    }
}
