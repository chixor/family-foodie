import React, { Component } from "react";
import { NotificationManager } from "react-notifications";
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import api from "../utils/api";
import MenuDate from "../utils/MenuDate";

polyfill({
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
});

const ENTER_KEY_CODE = 13;

export default class Shopping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: [],
      allIngredients: [],
      cost: 0,
      editPrices: false,
      offerDefaultPriceChange: [],
    };
    this.firstDay = new MenuDate().toFirstDayOfTheWeek();
    this.lastDay = new MenuDate().toLastDayOfTheWeek();
    this.datestamp = {
      week: this.firstDay.getWeek(),
      year: this.firstDay.getYear(),
    };
  }

  componentDidMount() {
    this.getIngredients();
    const { match } = this.props;
    const { week, year } = match.params;
    if (week && year) {
      this.firstDay = new MenuDate(year, week).toFirstDayOfTheWeek();
      this.lastDay = new MenuDate(year, week).toLastDayOfTheWeek();
      this.datestamp = { week, year };
    }

    api.shoppingListWeek(this.datestamp).then((ingredients) => {
      let cost = 0;
      const offerDefaultPriceChange = [];

      if (ingredients.fresh.length > 0) {
        cost = ingredients.fresh.reduce((a, b) => {
          return b.cost ? { cost: a.cost + Number(b.cost) } : { cost: a.cost };
        });
        ingredients.fresh.forEach((i) => {
          offerDefaultPriceChange[i.ingredientId] = i.cost !== i.defaultCost;
        });
      }

      this.setState({ ingredients, offerDefaultPriceChange, cost: cost.cost });
    });
  }

  getIngredients() {
    api.getIngredients().then((allIngredients) => {
      this.setState({ allIngredients });
    });
  }

  reset = () => {
    api.resetShoppingList(this.datestamp).then(() => {
      window.location.reload();
    });
  };

  checkAvailability = () => {
    const { ingredients } = this.state;
    api.checkAvailability(ingredients.fresh).then((result) => {
      result.forEach((i, k) => {
        ingredients.fresh[k].isPurchasable = i.IsPurchasable;
      });
      NotificationManager.success("Available ingredients highlighted in green");
      this.setState({ ingredients });
    });
  };

  save = () => {
    const { ingredients } = this.state;
    api.saveShoppingList(
      this.datestamp,
      ingredients.fresh.concat(ingredients.pantry)
    );
  };

  roundToTwo = (num) => {
    return num ? +`${Math.round(`${num}e+2`)}e-2` : null;
  };

  dragStart = (ingredient, fromList, fromIndex) => {
    document.body.style.overflow = "hidden";
    this.setState({ drag: { ingredient, fromList, fromIndex } });
  };

  dragOverTable = (e) => {
    e.preventDefault();
  };

  dragEnterRow = (e, toList, toIndex) => {
    e.preventDefault();
    const { drag, ingredients } = this.state;
    drag.toIndex = toIndex;
    drag.toList = toList;

    Object.keys(ingredients).forEach((key) => {
      ingredients[key].forEach((ingredient) => {
        ingredient.dragover = false;
      });
    });
    ingredients[toList][toIndex].dragover = true;

    this.setState({ ingredients, drag });
  };

  drop = () => {
    document.body.style.overflow = "auto";
    const { drag, ingredients } = this.state;
    let { cost } = this.state;

    Object.keys(ingredients).forEach((key) => {
      ingredients[key].forEach((ingredient) => {
        ingredient.dragover = false;
      });
    });

    if (!drag.ingredient.ingredientId && drag.toList === "pantry") {
      this.setState({ drag: undefined });
      NotificationManager.warning("Cannot save that to the pantry");
      this.setState({ ingredients });
      return;
    }

    drag.ingredient.fresh = drag.toList === "fresh";
    ingredients[drag.fromList].splice(drag.fromIndex, 1);
    drag.toIndex =
      (drag.toList === drag.fromList && drag.toIndex < drag.fromIndex) ||
      drag.toList !== drag.fromList
        ? drag.toIndex + 1
        : drag.toIndex;

    ingredients[drag.toList].splice(drag.toIndex, 0, drag.ingredient);
    cost = ingredients.fresh.reduce((a, b) => ({
      cost: a.cost + Number(b.cost),
    }));
    this.setState({ ingredients, cost: cost.cost, drag: undefined }, this.save);
  };

  add = (e) => {
    if (e.keyCode !== ENTER_KEY_CODE) return;
    const { ingredients } = this.state;

    api
      .addShoppingListItem(this.datestamp, this.refs.newIngredient.value)
      .then(({ id, cost, stockcode, supermarketCategory }) => {
        if (!id) return;
        ingredients.fresh.push({
          id,
          cost,
          stockcode,
          supermarketCategory,
          fresh: true,
          ingredient: this.refs.newIngredient.value,
          ingredientId: null,
          purchased: false,
        });
        this.refs.newIngredient.value = "";

        const totalCost = ingredients.fresh.reduce((a, b) => ({
          cost: a.cost + Number(b.cost),
        }));

        this.setState({ ingredients, cost: totalCost.cost });
      });
  };

  delete = (index) => {
    const { ingredients } = this.state;
    api
      .deleteShoppingListItem(this.datestamp, ingredients.fresh[index].id)
      .then(() => {
        ingredients.fresh.splice(index, 1);
        const { cost } = ingredients.fresh.reduce((a, b) => ({
          cost: a.cost + Number(b.cost),
        }));
        this.setState({ ingredients, cost });
      });
  };

  purchase = (index) => {
    const { ingredients } = this.state;
    const purchased = !ingredients.fresh[index].purchased;
    api
      .purchaseShoppingListItem(
        this.datestamp,
        ingredients.fresh[index].id,
        ingredients.fresh[index].ingredientId,
        purchased
      )
      .then(() => {
        ingredients.fresh[index].purchased = purchased;
        this.setState({ ingredients });
      });
  };

  editPrices = () => {
    const { editPrices, offerDefaultPriceChange, ingredients } = this.state;
    if (editPrices) {
      ingredients.fresh = ingredients.fresh.map((i) => {
        if (i.ingredientId) {
          i.cost =
            parseFloat(this.refs[`cost-${i.ingredientId}`].value) || null;
          i.replaceDefaultCost =
            (this.refs[`costDefault-${i.ingredientId}`] &&
              this.refs[`costDefault-${i.ingredientId}`].checked) ||
            false;
        }
        return i;
      });
      api.saveShoppingList(this.datestamp, ingredients.fresh).then(() => {
        const { cost } = ingredients.fresh.reduce((a, b) => ({
          cost: a.cost + Number(b.cost),
        }));
        ingredients.fresh.forEach((i) => {
          if (i.replaceDefaultCost) {
            i.defaultCost = i.cost;
            i.replaceDefaultCost = false;
            offerDefaultPriceChange[i.ingredientId] = false;
          }
        });
        this.setState({
          editPrices: !editPrices,
          ingredients,
          offerDefaultPriceChange,
          cost,
        });
      });
    } else {
      this.setState({ editPrices: !editPrices });
    }
  };

  onChangePrice = (ingredient) => {
    const ref = this.refs[`cost-${ingredient.ingredientId}`];
    const { offerDefaultPriceChange } = this.state;
    offerDefaultPriceChange[ingredient.ingredientId] = false;

    if (ref && parseFloat(ref.value) !== ingredient.defaultCost) {
      offerDefaultPriceChange[ingredient.ingredientId] = true;
    }

    this.setState({ offerDefaultPriceChange });
  };

  render() {
    const {
      cost,
      editPrices,
      ingredients,
      allIngredients,
      offerDefaultPriceChange,
    } = this.state;
    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <h2 className="shopping-week shopping-list">
              Week {this.datestamp.week}
              <button
                type="button"
                className="btn btn-default float-right"
                onClick={() => this.reset()}
              >
                <span className="glyphicon glyphicon-refresh" /> Reset
              </button>
            </h2>
            <h4 className="shopping-week">
              {this.firstDay.formatText()} ↣ {this.lastDay.formatText()}
            </h4>
          </div>
        </div>
        <div className="row">
          <datalist id="all-ingredients">
            {allIngredients.map((ing) => (
              <option value={ing.ingredient__name} />
            ))}
          </datalist>
          <div className="col-md-6 shopping-list">
            <div className="recipedetail shoppinglist">
              <h3>
                Shopping List
                <span className="float-right">
                  {cost &&
                    cost.toLocaleString("en-AU", {
                      style: "currency",
                      currency: "AUD",
                    })}
                </span>
              </h3>
              <table
                className="table"
                onDrop={this.drop}
                onDragOver={this.dragOverTable}
              >
                <tbody>
                  <tr>
                    <th>Ingredients</th>
                    <th className="ingredient-quantity">2p</th>
                    <th colSpan="3" className="ingredient-price">
                      Price&nbsp;
                      <button
                        type="button"
                        className={`btn btn-xs float-right ${
                          editPrices ? "btn-success" : "btn-default"
                        }`}
                        onClick={this.editPrices}
                      >
                        {editPrices ? "save" : "edit"}
                      </button>
                    </th>
                  </tr>
                  {ingredients.fresh &&
                    ingredients.fresh.map((r, i) => {
                      return (
                        <tr
                          className={`${r.purchased ? "checked" : ""} ${
                            r.dragover ? "dragover" : ""
                          } ${r.isPurchasable ? "can-purchase" : ""}`}
                          key={`ingredient-${r.ingredient}-${r.id}`}
                        >
                          <td
                            className={`draggable supermarket-category supermarket-category-${
                              r.supermarketCategory
                                ? r.supermarketCategory
                                    .replace(" & ", "")
                                    .replace(" ", "-")
                                : ""
                            }`}
                            draggable="true"
                            onDragStart={() => this.dragStart(r, "fresh", i)}
                            onDragEnter={(e) =>
                              this.dragEnterRow(e, "fresh", i)
                            }
                          >
                            <input
                              onChange={() => this.purchase(i)}
                              type="checkbox"
                              checked={r.purchased}
                            />
                            &nbsp;&nbsp;
                            {r.name || r.ingredient}
                          </td>
                          <td className="ingredient-quantity">
                            {this.roundToTwo(r.quantity)} {r.quantityMeasure}
                            {parseFloat(r.quantity) > 1 ? "s" : null}
                          </td>
                          {r.cost ? (
                            <td className="align-right">
                              {editPrices ? (
                                <div className="popside-container">
                                  {offerDefaultPriceChange[r.ingredientId] && (
                                    <div className="popside">
                                      Make this my default price (replace{" "}
                                      {r.defaultCost &&
                                        r.defaultCost.toLocaleString("en-AU", {
                                          style: "currency",
                                          currency: "AUD",
                                        })}
                                      ){" "}
                                      <input
                                        type="checkbox"
                                        ref={`costDefault-${r.ingredientId}`}
                                      />
                                    </div>
                                  )}
                                  <input
                                    onChange={() => this.onChangePrice(r)}
                                    defaultValue={r.cost && r.cost.toFixed(2)}
                                    type="text"
                                    ref={`cost-${r.ingredientId}`}
                                    className="form-control price-field"
                                    id={`${r.ingredientId}-cost`}
                                  />
                                </div>
                              ) : (
                                <span>
                                  {r.cost &&
                                    r.cost.toLocaleString("en-AU", {
                                      style: "currency",
                                      currency: "AUD",
                                    })}
                                </span>
                              )}
                            </td>
                          ) : (
                            <td />
                          )}
                          <td className="table-column-tiny align-center pad-left">
                            {r.stockcode !== null && (
                              <a
                                title="Woolworths details"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://www.woolworths.com.au/shop/productdetails/${r.stockcode}/`}
                              >
                                <span className="glyphicon glyphicon-new-window" />
                              </a>
                            )}
                          </td>
                          <td className="table-column-tiny align-center pad-left">
                            {r.ingredientId === null ? (
                              <span
                                onClick={() => this.delete(i)}
                                className="glyphicon glyphicon-remove"
                              />
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  <tr>
                    <td colSpan="5">
                      <input
                        type="text"
                        className="ingredient-input form-control"
                        placeholder="add item..."
                        ref="newIngredient"
                        name="newIngredient"
                        list="all-ingredients"
                        onKeyDown={this.add}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6 pantry">
            <div className="recipedetail shoppinglist">
              <h3>Pantry</h3>
              <table
                className="table"
                onDrop={this.drop}
                onDragOver={this.dragOverTable}
              >
                <tbody>
                  <tr>
                    <th>Ingredients</th>
                    <th className="ingredient-quantity">2p</th>
                  </tr>
                  {ingredients.pantry &&
                    ingredients.pantry.map((r, i) => {
                      return (
                        <tr
                          className={r.dragover ? "dragover" : ""}
                          key={`ingredient-${r.ingredient}-${r.id}`}
                        >
                          <td
                            className={`draggable supermarket-category pantry-category-${r.pantryCategory.replace(
                              " ",
                              "-"
                            )}`}
                            draggable="true"
                            onDragStart={() => this.dragStart(r, "pantry", i)}
                            onDragEnter={(e) =>
                              this.dragEnterRow(e, "pantry", i)
                            }
                          >
                            {r.ingredient}
                          </td>
                          <td>
                            {this.roundToTwo(r.quantity)} {r.quantityMeasure}
                            {parseFloat(r.quantity) > 1 ? "s" : null}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <br />
        <br />
      </div>
    );
  }
}
