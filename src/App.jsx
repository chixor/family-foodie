import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";
import "./App.css";
import Nav from "./components/Nav";
import Shopping from "./pages/Shopping";
import Planner from "./pages/Planner";
import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import Ingredients from "./pages/Ingredients";

const App = () => (
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
          <Route render={() => <p>Not Found</p>} />
        </Switch>
      </div>
    </div>
  </BrowserRouter>
);

export default App;
