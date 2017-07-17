import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './App.css';
import Nav from './Nav';
import Shopping from './Shopping';
import Planner from './Planner';
import Recipes from './Recipes';
import RecipeDetails from './RecipeDetails';

export default class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <NotificationContainer/>
                    <Nav />
                    <div className="container-fluid">
                        <Switch>
                            <Route exact path='/' component={Planner} />
                            <Route path='/shopping' component={Shopping} />
                            <Route path='/recipes' component={Recipes} />
                            <Route path='/recipe/:recipeId' component={RecipeDetails} />
                            <Route render={function () {
                                return <p>Not Found</p>
                            }} />
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        )
    }
}