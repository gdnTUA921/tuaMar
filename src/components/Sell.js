import React, { useState, useEffect } from 'react';
import DragNdrop from './DragNdrop';
import './Sell.css';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; 

function Sell() {
  
  const navigate = useNavigate();

  //sweet-alerts
  const MySwal = withReactContent(Swal);

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


  useEffect(() => {
    //Checking if logged in, if not redirected to log-in
      fetch(`${ip}/tua_marketplace/fetchSession.php`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.user_id) {
            navigate("/"); // Redirect to login if not authenticated
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
        });
    }, [ip, navigate]);


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
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {

        if (data.status == "Success"){
            MySwal.fire({
            title: "Item Posted!",
            html: data.message + " <br><br><b>Pending for Admin Review.</b>",
            icon: "success",
            confirmButtonColor: "#547B3E",
          }).then((result) => {
              if (result.isConfirmed){
              navigate("/home");
              }
          });
        }

        else {
          MySwal.fire({
            title: "Failed to Post Item!",
            html: data.message,
            icon: "error",
            confirmButtonColor: "#547B3E",
          }).then((result) => {
              if (result.isConfirmed){
              navigate("/home");
              }
          });
        }

      })
      .catch((error) => console.error("Error:", error));
  };


  return (
    <>
      <div className="sell-container">
        <div className="sell-box">
            <h2 className="sell-title">List Your Items</h2>
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
                <option value="Books & Study Materials">Books & Study Materials</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture & Home Essentials">Furniture & Home Essentials</option>
                <option value="Clothing & Accessories">Clothing & Accessories</option>
                <option value="Transportation">Transportation</option>
                <option value="Food & Drinks">Food & Drinks</option>
                <option value="Services & Gigs">Services & Gigs</option>
                <option value="Tickets & Events">Tickets & Events</option>
                <option value="Hobbies & Toys">Hobbies & Toys</option>
                <option value="Housing & Rentals">Housing & Rentals</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Announcements">Announcements</option>
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
