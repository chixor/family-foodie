import React from "react";

const PlannerControls = ({
  isEditing,
  randomCallback,
  saveCallback,
  deleteCallback,
  cancelCallback,
  editCallback,
  shopLink,
}) => {
  return isEditing ? (
    <div className="planner-controls">
      &nbsp;
      <button
        type="button"
        className="btn btn-xs text-primary"
        onClick={randomCallback}
      >
        <span className="glyphicon glyphicon-refresh" /> Automate
      </button>
      &nbsp;
      <button
        type="button"
        className="btn btn-xs text-success"
        onClick={saveCallback}
      >
        <span className="glyphicon glyphicon-ok" /> Save
      </button>
      &nbsp;
      <button
        type="button"
        className="btn btn-xs text-danger"
        onClick={deleteCallback}
      >
        <span className="glyphicon glyphicon-remove" /> Delete
      </button>
      &nbsp;
      <button
        type="button"
        className="btn btn-xs text-secondary"
        onClick={cancelCallback}
      >
        <span className="glyphicon glyphicon-remove" /> Cancel
      </button>
    </div>
  ) : (
    <div className="planner-controls">
      &nbsp;
      <button
        type="button"
        title="Edit"
        className="btn btn-xs text-primary"
        onClick={editCallback}
      >
        <span className="glyphicon glyphicon-pencil" /> Edit
      </button>
      &nbsp;
      <a title="Shopping List" href={shopLink} className="btn btn-xs btn-link">
        <span className="glyphicon glyphicon-list" /> Shopping List
      </a>
    </div>
  );
};
export default PlannerControls;
