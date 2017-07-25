import React from 'react';
import { NavLink } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';
import Auth from '../modules/Auth';

export default class Nav extends React.Component {
    login(response) {
        console.log(response);
        typeof response.error !== 'undefined' ?
            NotificationManager.error(response.error):
            Auth.authenticateUser(response.tokenObj,response.profileObj);

        this.setState(prevState => {
            return prevState.isAuthenticated = true;
        });
    }

    logout() {
        Auth.deauthenticateUser();
        this.setState(prevState => {
            return prevState.isAuthenticated = false;
        });
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-inverse">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="#">
                                <img alt="logo" src="/static/favicon.png"/>
                                Menu Fresh
                            </a>
                        </div>

                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="nav navbar-nav">
                                <li><NavLink exact activeClassName='active' to='/'>Planner</NavLink></li>
                                <li><NavLink activeClassName='active' to="/shopping">Shopping</NavLink></li>
                                <li><NavLink activeClassName='active' to="/recipes">All recipes</NavLink></li>
                            </ul>
                            <div className="nav navbar-nav navbar-right">
                                <a href="/accounts/logout" className="btn btn-success navbar-btn">Logout</a>
                            </div>
                            <ul className="nav navbar-nav navbar-right">
                                <li><a target="_blank" href="http://seasonalfoodguide.com/melbourne-victoria-seasonal-fresh-produce-guide-fruits-vegetables-in-season-availability-australia.html">Melbourne Seasonal Food Guide</a></li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        )
    }
}