import React, { useState, useEffect } from 'react';
import DragNdrop from '../components/DragNdrop';
import '../assets/Sell.css';
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; 
import { database, storage } from '../firebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { ref, onValue, push, set, get, update} from 'firebase/database';

function EditListing() {
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
  const location = useLocation();
  const { passedID, passedName } = location.state || {};
  const itemId = passedID;
  const listingName = passedName;

  const ip = process.env.REACT_APP_LAPTOP_IP; //ip address

  //initial loaded pics from db and firebase storage
  const [listingPics, setListingPics] = useState([]);

  //for setting updated details
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  const handleItemNameChange = (e) => setItemName(e.target.value);
  const handlePriceChange = (e) => setPrice(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleConditionChange = (e) => setCondition(e.target.value);
  const handleDescChange = (e) => setDescription(e.target.value);

  const handleImagesFromChild = (imageData) => {
    console.log('Images received from child:', imageData);
    setImages(imageData);
  };
  
  const goBack = () => navigate("/myProfile");

  useEffect(() => {
    fetch(`${ip}/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user_id) navigate("/login");
      })
      .catch((error) => console.error("Session error:", error));
  }, [ip, navigate]);

  useEffect(() => {
    
    fetch(`${ip}/itemPicsFetch.php`, {
      method: "POST",
      body: JSON.stringify({ item_id: itemId }),
    })
      .then((res) => res.json())
      .then((pics) => {
        const imageUrls = pics.map((p) => p.image);
        setListingPics(imageUrls);
      })
      .catch((err) => console.error("Pics fetch error:", err));

    fetch(`${ip}/fetchItemDeets.php`, {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, item_name: listingName }),
    })
      .then((res) => res.json())
      .then((data) => {
        setItemName(data.itemName);
        setPrice(data.price);
        setCategory(data.category);
        setCondition(data.item_condition);
        setDescription(data.description);
      })
      .catch((err) => console.error("Item fetch error:", err));
  }, [itemId, listingName, ip]);

  const deleteImageByUrl = async (url) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const startIndex = decodedUrl.indexOf("/o/") + 3;
      const endIndex = decodedUrl.indexOf("?");
      const fullPath = decodedUrl.substring(startIndex, endIndex);
      const imageRef = storageRef(storage, fullPath);
      await deleteObject(imageRef);
      console.log("Deleted:", fullPath);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that we have at least one image
    if (!images || images.length === 0) {
      MySwal.fire({
        title: "Error!",
        text: "Please upload at least one image.",
        icon: "error",
        confirmButtonColor: "#547B3E",
      });
      return;
    }

    try {
      // Separate existing URLs from new File objects
      const existingUrls = [];
      const newFiles = [];

      images.forEach(image => {
        if (typeof image === 'string' && image.startsWith('http')) {
          // This is an existing Firebase URL
          existingUrls.push(image);
        } else if (image instanceof File) {
          // This is a new file to upload
          newFiles.push(image);
        }
      });

      console.log('Existing URLs:', existingUrls);
      console.log('New files to upload:', newFiles);

      // Delete old images that are no longer in the list
      const urlsToDelete = listingPics.filter(oldUrl => !existingUrls.includes(oldUrl));
      console.log('URLs to delete:', urlsToDelete);

      for (let oldUrl of urlsToDelete) {
        await deleteImageByUrl(oldUrl);
      }

      // Upload new images to Firebase Storage
      const newUploadedUrls = [];
      for (let file of newFiles) {
        const imageRef = storageRef(storage, `posted-item-images/${uuidv4()}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        newUploadedUrls.push(url);
      }

      // Combine existing URLs with newly uploaded URLs
      const allImageUrls = [...existingUrls, ...newUploadedUrls];
      console.log('Final image URLs:', allImageUrls);

      // Update listing in database
      const res = await fetch(`${ip}/updateListing.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          itemName,
          price,
          category,
          condition,
          description,
          images: allImageUrls,
        }),
        credentials: 'include',
      });

      const result = await res.json();

      if (result.message === "Item updated successfully!") {
        // Update Firebase Realtime Database
        const chatListRef = ref(database, 'chatsList');
        const snapshot = await get(chatListRef);
        if (snapshot.exists()) {
          const updates = {};
          snapshot.forEach(childSnapshot => {
            const key = childSnapshot.key;
            const val = childSnapshot.val();
            if (String(val.item_id) === String(itemId)) {
              updates[`/chatsList/${key}/item_name`] = itemName;
              updates[`/chatsList/${key}/item_price`] = Number(price).toFixed(2);
              updates[`/chatsList/${key}/item_pic`] = allImageUrls[0];
              updates[`/chatsList/${key}/item_status`] = "IN REVIEW";
            }
          });
          await update(ref(database), updates);
        }

        await MySwal.fire({
          title: "UPDATED!",
          text: result.message,
          icon: "success",
          confirmButtonColor: "#547B3E",
        });
        navigate("/myProfile");
      } else {
        MySwal.fire({
          title: "Error!",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#547B3E",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      MySwal.fire({
        title: "Error!",
        text: "Something went wrong while updating.",
        icon: "error",
        confirmButtonColor: "#547B3E",
      });
    }
  };

  return (
    <div className="sell-container">
      <div className="sell-box">
        <h2 className="sell-title">Edit Your Listing</h2>
        <h3 className="sell-subtitle">Edit your listing if there are necessary changes need to be made.</h3>
        <DragNdrop onImagesChange={handleImagesFromChild} initialImages={listingPics} />
        <br />
        <form className="sell-form" onSubmit={handleSubmit}>
          <label htmlFor="itemName">Item Name:</label>
          <input type="text" id="itemName" className="sell-input" name="itemName" onChange={handleItemNameChange} value={itemName} required />

          <label htmlFor="price">Price:</label>
          <div className="currencySign">&#8369;</div>
          <input type="number" id="price" className="sell-input no-arrows" name="price" min="0" step="0.01" onChange={handlePriceChange} value={price} required />

          <label htmlFor="category">Category:</label>
          <select id="category" className="sell-select" onChange={handleCategoryChange} value={category} required>
            <option value="" disabled hidden>Select a Category</option>
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
          <select id="condition" className="sell-select" name="condition" onChange={handleConditionChange} value={condition} required>
            <option value="" disabled hidden>Select Condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
          </select>

          <label htmlFor="description">Description:</label>
          <textarea id="description" className="sell-description" name="description" onChange={handleDescChange} value={description} required />

          <div className="buttonsDisplay">
            <button type="submit" className="sell-button"><b>Submit</b></button>
            <button className="cancel-button" onClick={(e) => {e.preventDefault(); goBack();}}><b>Cancel</b></button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditListing;