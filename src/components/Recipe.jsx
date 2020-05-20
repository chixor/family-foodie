import React from "react";
import { NavLink } from "react-router-dom";

const RandomButton = (randomize, windex, index) => (
  <button
    type="button"
    title="randomize"
    className="corner-triangle-left"
    onClick={() => randomize(windex, index)}
  >
    <span className="glyphicon glyphicon-refresh" />
  </button>
);

const DeletePermButton = (deletePerm, id) => (
  <button
    type="button"
    className="btn btn-xs text-danger"
    onClick={() => deletePerm(id)}
  >
    <span className="glyphicon glyphicon-remove" /> Delete
  </button>
);

const ArchivePermButton = (archivePerm, id) => (
  <button
    type="button"
    className="btn btn-xs text-primary"
    onClick={() => archivePerm(id)}
  >
    <span className="glyphicon glyphicon-remove" /> Archive
  </button>
);

const UnArchivePermButton = (unarchivePerm, id) => (
  <button
    type="button"
    className="btn btn-xs text-primary"
    onClick={() => unarchivePerm(id)}
  >
    <span className="glyphicon glyphicon-ok" /> Unarchive
  </button>
);

const DeleteButton = (deleteFn, windex, index) => (
  <button
    type="button"
    title="remove"
    className="corner-triangle-right"
    onClick={() => deleteFn(windex, index)}
  >
    <span className="glyphicon glyphicon-remove" />
  </button>
);

const PriceTag = (cost) => (
  <span className="pricetag">
    <sup>$</sup>
    {cost.toFixed(2)}
  </span>
);

const Recipe = (props) => {
  const {
    randomize,
    deletePerm,
    canDelete,
    deleteFn,
    archivePerm,
    unarchivePerm,
    editable,
    index,
    windex,
    id,
    cost,
    filename,
    name,
    prepTime,
    cookTime,
  } = props;
  let randomBtn;
  let deleteBtn;
  let deletePermBtn;
  let archivePermBtn;
  let unarchivePermBtn;
  let priceTag = null;

  if (typeof randomize !== "undefined") {
    randomBtn = RandomButton(randomize, windex, index);
  }
  if (typeof deletePerm !== "undefined" && canDelete) {
    deletePermBtn = DeletePermButton(deletePerm, id);
  }
  if (typeof archivePerm !== "undefined") {
    archivePermBtn = ArchivePermButton(archivePerm, id);
  }
  if (typeof unarchivePerm !== "undefined") {
    unarchivePermBtn = UnArchivePermButton(unarchivePerm, id);
  }
  if (typeof deleteFn !== "undefined") {
    deleteBtn = DeleteButton(deleteFn, windex, index);
  }
  if (typeof cost !== "undefined" && cost !== null) {
    priceTag = PriceTag(cost);
  }

  return (
    <article>
      {deleteBtn}
      {randomBtn}
      <NavLink to={`/recipe/${id}`}>
        <img
          className="heroimage"
          alt="thumbnail"
          src={`/assets/resources/${filename}.jpg`}
        />
      </NavLink>
      <h3>{name}</h3>
      <p className="preptime">
        <span className="glyphicon glyphicon-time" /> {prepTime + cookTime}min
      </p>
      {priceTag}
      {editable ? (
        <p className="actions">
          {unarchivePermBtn}
          {archivePermBtn}
          {deletePermBtn}
        </p>
      ) : null}
    </article>
  );
};

export default Recipe;
