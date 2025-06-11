import React, { useState, useEffect } from 'react';
import DragNdrop from './DragNdrop';
import './Sell.css';
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; 


function EditListing() {

  const MySwal = withReactContent(Swal); // For Alert

  const navigate = useNavigate();
  const location = useLocation();

  const { passedID, passedName } = location.state || {};
  const itemId = passedID;
  const listingName = passedName;


  const [listingPics, setListingPics] = useState([]);

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

  const goBack = () => {
    navigate("/myProfile");
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



    useEffect(() => {
      console.log (itemId);

      //fetching item pictures
      fetch(`${ip}/tua_marketplace/itemPicsFetch.php`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId }),
      })
        .then((response) => response.json())
        .then((pics) => {
          setListingPics(pics.map((pic) => pic.image));
          })
        .catch((error) => console.error("Error fetching pics:", error));

      //fetching item details
      fetch(`${ip}/tua_marketplace/fetchItemDeets.php`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId, item_name: listingName }), 
      })
      .then((response) => response.json())
      .then((data)=>{
        setItemName(data.itemName);
        setPrice(data.price);
        setCategory(data.category);
        setCondition(data.item_condition);
        setDescription(data.description);
      })
      .catch((error) => console.error("Error fetching item details:", error));

    }, [itemId])



  const handleSubmit = (event) => {
    event.preventDefault();

    fetch(`${ip}/tua_marketplace/updateListing.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId,
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
        if (data.message == "Item updated successfully!"){
          MySwal.fire({
              title: "UPDATED!",
              text: data.message,
              icon: "success",
              confirmButtonColor: "#547B3E",
          }).then((result) => {
              if (result.isConfirmed){
                navigate("/myProfile");
              }
          });
        }

        else{
          MySwal.fire({
              title: "Error!",
              text: data.message,
              icon: "error",
              confirmButtonColor: "#547B3E",
          });
        }
        
        //alert("Server Response: " + data.message);
        
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <>
      <div className="sell-container">
        <div className="sell-box">
            <h2 className="sell-title">Edit Your Listing</h2>
            <h3 className="sell-subtitle">
              Edit your listing if there are necessary changes need to be made.
            </h3>

            {/* Drag and Drop Image Upload */}
            <DragNdrop onImagesChange={handleImagesFromChild} initialImages={listingPics} />
            <br />

            {/* Form */}
            <form className="sell-form" onSubmit={handleSubmit}>
              <label htmlFor="itemName">Item Name:</label>
              <input type="text" id="itemName" className="sell-input" name="itemName" placeholder="Enter Item Name" onChange={handleItemNameChange} value={itemName} required/>

              <label htmlFor="price">Price:</label>
              <div className="currencySign">&#8369;</div>
              <input type="number" id="price" className="sell-input no-arrows" name="price" min="0" step="0.01" placeholder="Enter price" onChange={handlePriceChange} value={price} required/>

              <label htmlFor="category">Category:</label>
              <select id="category" className="sell-select" name="category" onChange={handleCategoryChange} value={category} required>
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
              <select id="condition" className="sell-select" name="condition" onChange={handleConditionChange} value={condition} required>
                <option value="" disabled selected hidden>Select Condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
              </select>

              <label htmlFor="description">Description:</label>
              <textarea id="description" className="sell-description" name="description" placeholder="Describe what you are selling and include any details a buyer might be interested in." onChange={handleDescChange} value={description} required></textarea>

              <div className="buttonsDisplay">
                <button type="submit" className="sell-button"><b>Submit</b></button>
                <button className="cancel-button" onClick={(e) => {e.preventDefault(); goBack();}}><b>Cancel</b></button>
              </div>
            </form>
        </div>
      </div>
    </>
  );
}

export default EditListing;
