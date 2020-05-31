import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import PriceTag from "./PriceTag";

const CornerButtonLeft = styled.button`
  background: transparent;
  cursor: pointer;
  display: block;
  width: ${(props) => (props.small ? "45px" : "90px")};
  height: ${(props) => (props.small ? "45px" : "90px")};
  border-style: solid;
  border-width: 0 0 ${(props) => (props.small ? "45px 45px" : "90px 90px")};
  border-color: transparent transparent transparent #222;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99999;
  color: white;

  & > .glyphicon {
    position: absolute;
    top: ${(props) => (props.small ? "7px" : "15px")};
    left: ${(props) => (props.small ? "-38px" : "-75px")};
    font-size: ${(props) => (props.small ? "120%" : "180%")};
  }
`;

const CornerButtonRight = styled(CornerButtonLeft)`
  border-width: 0 ${(props) => (props.small ? "45px 45px" : "90px 90px")} 0;
  border-color: transparent #222 transparent transparent;
  left: auto;
  right: 0;

  & > .glyphicon {
    left: auto;
    right: ${(props) => (props.small ? "-38px" : "-75px")};
  }
`;

const RandomButton = (randomCallback, small) => (
  <CornerButtonLeft small={small} type="button" onClick={randomCallback}>
    <span className="glyphicon glyphicon-refresh" />
  </CornerButtonLeft>
);

const DeleteButton = (deleteCallback, small) => (
  <CornerButtonRight small={small} type="button" onClick={deleteCallback}>
    <span className="glyphicon glyphicon-remove" />
  </CornerButtonRight>
);

const DeletePermButton = (deletePermCallback, id) => (
  <button
    type="button"
    className="btn btn-xs text-danger"
    onClick={() => deletePermCallback(id)}
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

const RecipeCard = (props) => {
  const {
    randomCallback,
    deleteCallback,
    deletePerm,
    canDelete,
    archivePerm,
    unarchivePerm,
    editable,
    id,
    cost,
    filename,
    name,
    prepTime,
    cookTime,
    small,
  } = props;
  let randomBtn;
  let deleteBtn;
  let deletePermBtn;
  let archivePermBtn;
  let unarchivePermBtn;
  let priceTag = null;

  if (typeof randomCallback !== "undefined") {
    randomBtn = RandomButton(randomCallback, small);
  }
  if (typeof deleteCallback !== "undefined") {
    deleteBtn = DeleteButton(deleteCallback, small);
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
  if (typeof cost !== "undefined" && cost !== null) {
    priceTag = <PriceTag small>{cost.toFixed(2)}</PriceTag>;
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
      {editable && (
        <p className="actions">
          {unarchivePermBtn}
          {archivePermBtn}
          {deletePermBtn}
        </p>
      )}
    </article>
  );
};

export default RecipeCard;
