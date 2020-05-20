import React, { Component } from "react";
import { NotificationManager } from "react-notifications";
import api from "../utils/api";

export default class Ingredients extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: [],
      supermarketCategories: [],
      pantryCategories: [],
      editing: [],
    };
    this.forms = {};
  }

  componentDidMount() {
    this.load();
  }

  load = () => {
    api.getIngredients().then((ingredients) => {
      api.getPantryCategories().then((pantryCategories) => {
        api.getSupermarketCategories().then((supermarketCategories) => {
          ingredients.push({});
          this.setState({
            ingredients,
            pantryCategories,
            supermarketCategories,
          });
        });
      });
    });
  };

  edit = (id) => {
    const { editing } = this.state;
    editing.push(id);
    this.forms[id] = {};
    this.setState({ editing });
  };

  save = (id) => {
    const { editing, ingredients } = this.state;
    const details = {};
    let valid = true;
    Object.keys(this.forms[id]).map((key) => {
      if (this.forms[id][key].type === "checkbox") {
        details[key] = this.forms[id][key].checked;
      } else if (typeof this.forms[id][key] === "string") {
        details[key] = this.forms[id][key];
      } else if (
        this.forms[id][key].required &&
        this.forms[id][key].value === ""
      ) {
        valid = false;
        NotificationManager.error(`${key} is required`);
      } else {
        details[key] =
          this.forms[id][key].value !== "" ? this.forms[id][key].value : null;
      }
    });

    if (valid && typeof id !== "undefined")
      api.saveIngredient(id, details).then(() => {
        editing.splice(editing.indexOf(id), 1);
        this.setState({ editing }, () => this.load());
      });
    else if (valid)
      api.addIngredient(details).then(() => {
        editing.splice(editing.indexOf(id), 1);
        ingredients.pop();
        this.setState({ ingredients, editing }, () => this.load());
      });
  };

  render() {
    const {
      ingredients,
      editing,
      supermarketCategories,
      pantryCategories,
    } = this.state;
    return (
      <section className="recipelist">
        <h2>Ingredients</h2>
        <p>{ingredients.length} found</p>
        <div className="recipedetail" style={{ marginTop: "20px" }}>
          <table className="table">
            <thead>
              <tr>
                <th colSpan="2">Name</th>
                <th className="align-center">Buy Fresh?</th>
                <th className="align-right">Default Price</th>
                <th className="align-right">Stockcode</th>
                <th>.</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((i) =>
                editing.indexOf(i.ingredient_id) > -1 ? (
                  <tr>
                    <td
                      colspan="2"
                      className={`table-column-tiny supermarket-category supermarket-category-${
                        i.supermarketCategory__name
                          ? i.supermarketCategory__name
                              .replace(" & ", "")
                              .replace(" ", "-")
                          : ""
                      }`}
                      title={i.supermarketCategory__name}
                    >
                      <select
                        required="true"
                        defaultValue={i.supermarketCategory__id}
                        ref={(c) =>
                          (this.forms[i.ingredient_id].supermarketCategory = c)
                        }
                        className="form-control"
                        style={{ width: "100px", float: "left" }}
                        id={`${i.ingredient_id}-category`}
                      >
                        {supermarketCategories.map((cat) => (
                          <option
                            key={`category-${i.ingredient_id}-${cat.id}`}
                            value={cat.id}
                          >
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <select
                        required="true"
                        defaultValue={i.pantryCategory__id}
                        ref={(c) =>
                          (this.forms[i.ingredient_id].pantryCategory = c)
                        }
                        className="form-control"
                        style={{ width: "100px", float: "left" }}
                        id={`${i.ingredient_id}-category`}
                      >
                        {pantryCategories.map((cat) => (
                          <option
                            key={`category-${i.ingredient_id}-${cat.id}`}
                            value={cat.id}
                          >
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <input
                        style={{ width: "250px", float: "left" }}
                        defaultValue={i.ingredient__name}
                        type="text"
                        ref={(c) => (this.forms[i.ingredient_id].name = c)}
                        className="form-control"
                        id={`${i.ingredient_id}-name`}
                        required="required"
                        placeholder="ingredient name"
                        disabled={
                          typeof i.ingredient__name === "undefined"
                            ? ""
                            : "disabled"
                        }
                      />
                    </td>
                    <td className="form-group align-center">
                      <label>
                        <input
                          ref={(c) => (this.forms[i.ingredient_id].fresh = c)}
                          defaultChecked={i.fresh}
                          type="checkbox"
                          id={`${i.ingredient_id}-fresh`}
                        />{" "}
                        {i.fresh}
                      </label>
                    </td>
                    <td className="align-right">
                      $
                      <input
                        defaultValue={i.cost && i.cost.toFixed(2)}
                        type="text"
                        ref={(c) => (this.forms[i.ingredient_id].cost = c)}
                        className="form-control price-field"
                        id={`${i.ingredient_id}-cost`}
                      />
                    </td>
                    <td className="align-right">
                      <input
                        style={{ width: "80px" }}
                        defaultValue={i.stockcode}
                        type="text"
                        ref={(c) => (this.forms[i.ingredient_id].stockcode = c)}
                        className="form-control price-field"
                        id={`${i.ingredient_id}-stockcode`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-xs btn-success float-right"
                        onClick={() => this.save(i.ingredient_id)}
                      >
                        <span className="glyphicon glyphicon-ok" /> save
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      className={`table-column-tiny supermarket-category supermarket-category-${
                        i.supermarketCategory__name
                          ? i.supermarketCategory__name
                              .replace(" & ", "")
                              .replace(" ", "-")
                          : ""
                      }`}
                      title={i.supermarketCategory__name}
                    />
                    <td>{i.ingredient__name}</td>
                    <td className="align-center">
                      <span
                        className={i.fresh ? "glyphicon glyphicon-ok" : null}
                      />
                    </td>
                    <td className="align-right">
                      {i.cost &&
                        i.cost.toLocaleString("en-AU", {
                          style: "currency",
                          currency: "AUD",
                        })}
                    </td>
                    <td className="align-right">
                      {i.stockcode ? (
                        <a
                          title="Woolworths details"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://www.woolworths.com.au/shop/productdetails/${i.stockcode}/`}
                        >
                          {i.stockcode}{" "}
                          <span className="glyphicon glyphicon-new-window" />
                        </a>
                      ) : null}
                    </td>
                    <td>
                      {typeof i.ingredient_id === "undefined" ? (
                        <button
                          type="button"
                          className="btn btn-xs btn-default float-right"
                          onClick={() => this.edit(i.ingredient_id)}
                        >
                          <span className="glyphicon glyphicon-plus" /> add
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-xs btn-default float-right"
                          onClick={() => this.edit(i.ingredient_id)}
                        >
                          <span className="glyphicon glyphicon-pencil" /> edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}
