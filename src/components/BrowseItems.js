import React from "react";
import "./BrowseItems.css";


const BrowseItems = () => {
  return (
    <div className="browsecontainer">
      <div className="filecontainer">
        <div style={{ color: "#547B3E" }}>
          <h2>Categories</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>
            <input type="checkbox" name="textbooks" />
            Textbooks
          </label>
          <label>
            <input type="checkbox" name="electronics" />
            Electronics
          </label>
          <label>
            <input type="checkbox" name="uniforms" />
            Uniforms
          </label>
          <label>
            <input type="checkbox" name="schoolsupplies" />
            School Supplies
          </label>
          <label>
            <input type="checkbox" name="others" />
            Others
          </label>

          <div style={{ color: "#547B3E" }}>
            <h2>Price</h2>
          </div>
          <div style={{ color: "#547B3E" }}>
            <h2>Condition</h2>
          </div>

          <label>
            <input type="checkbox" name="new" />
            New
          </label>
          <label>
            <input type="checkbox" name="likenew" />
            Like New
          </label>
          <label>
            <input type="checkbox" name="good" />
            Good
          </label>
        </div>
      </div>
    </div>
  );
};

export default BrowseItems;
