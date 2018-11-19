import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import './App.css'
import Nav from './Nav'
import Shopping from './Shopping'
import Planner from './Planner'
import Recipes from './Recipes'
import RecipeDetails from './RecipeDetails'
import Ingredients from './Ingredients'

export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <NotificationContainer />
                    <Nav />
                    <div className="container-fluid">
                        <Switch>
                            <Route exact path="/" component={Planner} />
                            <Route exact path="/planner" component={Planner} />
                            <Route exact path="/shopping" component={Shopping} />
                            <Route path="/shopping/:year/:week" component={Shopping} />
                            <Route path="/recipes" component={Recipes} />
                            <Route exact path="/recipe" component={RecipeDetails} />
                            <Route path="/recipe/:recipeId" component={RecipeDetails} />
                            <Route path="/ingredients" component={Ingredients} />
                            <Route
                                render={function() {
                                    return <p>Not Found</p>
                                }}
                            />
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        )
    }
}
