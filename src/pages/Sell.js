import React, { useState, useEffect } from 'react';
import DragNdrop from '../components/DragNdrop';
import '../assets/Sell.css';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { storage } from '../firebaseConfig'; // make sure this path is correct
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

function Sell() {
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // stores File[] objects

  const handleItemNameChange = (e) => setItemName(e.target.value);
  const handlePriceChange = (e) => setPrice(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleConditionChange = (e) => setCondition(e.target.value);
  const handleDescChange = (e) => setDescription(e.target.value);

  const handleImagesFromChild = (fileArray) => {
    setImages(fileArray); // store raw File[] from DragNdrop
  };

  const ip = process.env.REACT_APP_LAPTOP_IP;

  useEffect(() => {
    fetch(`${ip}/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user_id) navigate("/login", {replace: true});
      })
      .catch((err) => console.error("Session error:", err));
  }, [ip, navigate]);

  //handling submit
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Upload files to Firebase
      const uploadPromises = images.map((file) => {
        const storageRef = ref(storage, `posted-item-images/${uuidv4()}-${file.name}`);
        return uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Send form data with image URLs
      const response = await fetch(`${ip}/listItem.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          itemName,
          price,
          category,
          condition,
          description,
          images: imageUrls,
        }),
      });

      const data = await response.json();

      if (data.status === "Success") {
        await MySwal.fire({
          title: "Item Posted!",
          html: data.message + "<br><br><b>Pending for Admin Review.</b>",
          icon: "success",
          confirmButtonColor: "#547B3E",
        });
        navigate("/home");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Upload or Submit Error:", error);
      MySwal.fire({
        title: "Failed to Post Item!",
        html: error.message || "Unknown error occurred",
        icon: "error",
        confirmButtonColor: "#547B3E",
      });
    }
  };

  const goHome = () => navigate("/home");

  return (
    <div className="sell-container">
      <div className="sell-box">
        <h2 className="sell-title">List Your Items</h2>
        <h3 className="sell-subtitle">
          Fill out the form below to list your item in the Marketplace
        </h3>

        <DragNdrop onImagesChange={handleImagesFromChild} />
        <br />

        <form className="sell-form" onSubmit={handleSubmit}>
          <label htmlFor="itemName">Item Name:</label>
          <input type="text" id="itemName" className="sell-input" onChange={handleItemNameChange} required />

          <label htmlFor="price">Price:</label>
          <div className="currencySign">&#8369;</div>
          <input type="number" id="price" className="sell-input no-arrows" min="0" step="0.01" onChange={handlePriceChange} required />

          <label htmlFor="category">Category:</label>
          <select id="category" className="sell-select" onChange={handleCategoryChange} required>
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
          <select id="condition" className="sell-select" onChange={handleConditionChange} required>
            <option value="" disabled selected hidden>Select Condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
          </select>

          <label htmlFor="description">Description:</label>
          <textarea id="description" className="sell-description" placeholder="Describe what you are selling and include any details a buyer might be interested in." onChange={handleDescChange} required></textarea>

          <div className="buttonsDisplay">
            <button type="submit" className="sell-button"><b>Submit</b></button>
            <button className="cancel-button" onClick={(e) => { e.preventDefault(); goHome(); }}><b>Cancel</b></button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Sell;
