import React, { Component } from "react";
import debounce from "lodash/debounce";
import styled from "styled-components";

const CardContainer = styled.article`
  border: 5px dashed rgba(0, 0, 0, 0.1);
  background-color: transparent !important;
  box-shadow: none;
  border-radius: 0;
  position: relative;
  cursor: pointer;

  &:before {
    content: "+";
    color: rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 80px;
    font-weight: bold;
    line-height: 1;
    margin-left: -24px;
    margin-top: -40px;
  }
`;

const Results = styled.div`
  background-color: white;
  position: absolute;
  top: 33px;
  padding: 0;
  border-top: 1px solid silver;
  margin: 0 6pt;
  width: calc(100% - 12pt);
  max-height: 300px;
  overflow: scroll;
  border-bottom: 1px solid silver;
`;

const Result = styled.div`
  list-style: none;
  margin: 0;
  border: 1px solid silver;
  margin-top: -1px;
  margin-bottom: -1px;
  overflow: hidden;

  &:hover {
    background-color: #eee;
  }

  & > img {
    height: 56px;
    float: left;
    padding-right: 6pt;
  }

  & > span {
    padding: 6pt;
    height: 56px;
    display: block;
  }
`;

const Search = (value, recipes) => {
  if (value.length === 0) return [];

  const split = value.trim().split(/[,]+/);
  const query = new RegExp(split.join("|"), "i");
  return recipes.filter((recipe) => {
    return (
      recipe.name.search(query) > -1 ||
      (recipe.description != null && recipe.description.search(query) > -1) ||
      (recipe.ingredients != null && recipe.ingredients.search(query) > -1)
    );
  });
};

export default class RecipeCardAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
    };
    this.searchInput = debounce(this.searchInput, 800);
  }

  searchInput = (value) => {
    const { recipes } = this.props;
    this.setState({ searchResults: Search(value, recipes) });
  };

  render() {
    const { addCallback, addFromSearchCallback } = this.props;
    const { searchResults } = this.state;
    return (
      <CardContainer onClick={addCallback}>
        <div
          className="recipe-search navbar-form form-group"
          role="search"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="icon-addon addon-md">
            <input
              autoComplete="false"
              onChange={(event) => this.searchInput(event.target.value)}
              type="search"
              placeholder="Search"
              className="form-control"
              id="search"
            />
            <label
              htmlFor="search"
              className="glyphicon glyphicon-search"
              rel="tooltip"
              title="email"
            />
            {searchResults.length > 0 && (
              <Results>
                {searchResults.map((r) => (
                  <Result
                    key={`recipe-search-results-${r.id}`}
                    onClick={() => addFromSearchCallback(r)}
                  >
                    <img
                      alt="thumbnail"
                      src={`/assets/resources/${r.filename}.jpg`}
                    />{" "}
                    <span>{r.name}</span>
                  </Result>
                ))}
              </Results>
            )}
          </div>
        </div>
      </CardContainer>
    );
  }
}
