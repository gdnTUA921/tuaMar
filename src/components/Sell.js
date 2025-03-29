import React from 'react';
import DragNdrop from './DragNdrop';
import './Sell.css'; // Import the external CSS file
import { useNavigate } from "react-router-dom";

function Sell() {

    const navigate = useNavigate();

    const goHome = () => {
      navigate("/");
    };

    const onFileChange = (files) => {
      console.log(files);
  }


  return (
    <>
      <div className="sell-container">
        <div className="sell-box">
          <h2 className="sell-title">List your Items</h2>
          <h3 className="sell-subtitle">
            Fill out the form below to list your item in the Marketplace
          </h3>

          <DragNdrop />
          <br />

          <form className="sell-form">
            <label htmlFor="itemName">Item Name:</label>
            <input type="text" id="itemName" className="sell-input" name="itemName" placeholder="Enter Item Name"/>

            <label htmlFor="price">Price:</label>
            <div className="currencySign">&#8369;</div>
            <input type="number" id="price" className="sell-input no-arrows" name="price" min="0" step="0.01" placeholder="Enter price"/>

            <label htmlFor="category">Category:</label>
            <select id="category" className="sell-select" name="category">
              <option value="" disabled selected hidden>Select a Category</option>
              <option value="Textbooks">Textbooks</option>
              <option value="Electronics">Electronics</option>
              <option value="Uniforms">Uniforms</option>
              <option value="School Supplies">School Supplies</option>
              <option value="Foods">Foods</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Others">Others</option>
            </select>

            <label htmlFor="condition">Condition:</label>
            <select id="condition" className="sell-select" name="condition">
            <option value="" disabled selected hidden>Select Condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
            </select>

            <label htmlFor="description">Description:</label>
            <textarea id="description" className="sell-description" name="description" placeholder="Describe what you are selling and include any details a buyer might be interested in."></textarea>

            <div className="buttonsDisplay">
              <button type="submit" className="sell-button"><b>Submit</b></button>
              <button className="cancel-button" onClick={(e) => {e.preventDefault(); goHome();}}><b>Cancel</b></button>
            </div>  

          </form>
        </div>
      </div>
    </>
  );
}

export default Sell;
