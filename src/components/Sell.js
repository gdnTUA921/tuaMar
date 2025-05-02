import React, { useState } from 'react';
import DragNdrop from './DragNdrop';
import './Sell.css';
import { useNavigate } from "react-router-dom";

function Sell() {
  const navigate = useNavigate();

  // Form state
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // Base64 images

  const handleItemNameChange = (event) => setItemName(event.target.value);
  const handlePriceChange = (event) => setPrice(event.target.value);
  const handleCategoryChange = (event) => setCategory(event.target.value);
  const handleConditionChange = (event) => setCondition(event.target.value);
  const handleDescChange = (event) => setDescription(event.target.value);

  // Receive images from DragNdrop
  const handleImagesFromChild = (imageData) => {
    setImages(imageData);
  };

  const goHome = () => {
    navigate("/home");
  };

  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)
  const handleSubmit = (event) => {
    event.preventDefault();

    fetch(`${ip}/tua_marketplace/listItem.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName,
        price,
        category,
        condition,
        description,
        images, // Base64 strings included here
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Server response:", data);
        alert("Server Response: " + data.message);
        navigate("/home");
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <>
      <div className="sell-container">
        <div className="sell-box">
            <h2 className="sell-title">List your Items</h2>
            <h3 className="sell-subtitle">
              Fill out the form below to list your item in the Marketplace
            </h3>

            {/* Drag and Drop Image Upload */}
            <DragNdrop onImagesChange={handleImagesFromChild} />
            <br />

            {/* Form */}
            <form className="sell-form" onSubmit={handleSubmit}>
              <label htmlFor="itemName">Item Name:</label>
              <input type="text" id="itemName" className="sell-input" name="itemName" placeholder="Enter Item Name" onChange={handleItemNameChange} required/>

              <label htmlFor="price">Price:</label>
              <div className="currencySign">&#8369;</div>
              <input type="number" id="price" className="sell-input no-arrows" name="price" min="0" step="0.01" placeholder="Enter price" onChange={handlePriceChange} required/>

              <label htmlFor="category">Category:</label>
              <select id="category" className="sell-select" name="category" onChange={handleCategoryChange} required>
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
              <select id="condition" className="sell-select" name="condition" onChange={handleConditionChange} required>
                <option value="" disabled selected hidden>Select Condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
              </select>

              <label htmlFor="description">Description:</label>
              <textarea id="description" className="sell-description" name="description" placeholder="Describe what you are selling and include any details a buyer might be interested in." onChange={handleDescChange} required></textarea>

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
