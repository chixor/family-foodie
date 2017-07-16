import React from 'react';
var NavLink = require('react-router-dom').NavLink;

export default class Nav extends React.Component {
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
                        <img alt="logo" src="/favicon.png"/>
                        Menu Fresh
                    </a>
                </div>

                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul className="nav navbar-nav">
                        <li><NavLink exact activeClassName='active' to='/'>Planner</NavLink></li>
                        <li><NavLink activeClassName='active' to="/shopping">Shopping</NavLink></li>
                        <li><NavLink activeClassName='active' to="/recipes">All recipes</NavLink></li>
                    </ul>
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