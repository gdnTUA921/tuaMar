import React, { useState, useEffect } from 'react';
import { Send } from "lucide-react"; // Library for icons
import { useNavigate, useLocation } from 'react-router-dom';
import "../assets/Reportitem.css"; // Import CSS file
import Swal from 'sweetalert2';
import DragNdrop from '../components/DragNdrop';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig"; // Adjust path if needed
import withReactContent from 'sweetalert2-react-content';
import { v4 as uuidv4 } from "uuid";


const Reportitem = () => {
  const location = useLocation();
  const { passedID, previewPic, itemName} = location.state || {}; // Extract passedID from location state
  const navigate = useNavigate(); // Initialize navigate for programmatic navigation
  const [images, setImages] = useState([]); // File objects


  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const handleImagesFromChild = (imageData) => setImages(imageData);
  const MySwal = withReactContent(Swal); //For alerts
  const ip = process.env.REACT_APP_LAPTOP_IP; // IP address (see env file for set up)


  useEffect(() => {
    // Checking if logged in, if not redirected to log-in
    fetch(`${ip}/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.user_id) {
          navigate("/login"); // Redirect to login if not authenticated
        }
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });
  }, [ip, navigate]);


 const uploadImagesToFirebase = async () => {
    const uploadPromises = images.map(async (file) => {
      if (file instanceof File) {
        const storageRef = ref(storage, `reports/${uuidv4()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
      } else {
        // Already a URL (initial image perhaps)
        return file;
      }
    });


    return Promise.all(uploadPromises);
  };




const handleSubmit = async (event) => {
  event.preventDefault();


  try {
    // upload local image files (if any) and get array of URLs
    const uploadedImageURLs = await uploadImagesToFirebase();


    // now send the report including uploaded image URLs
    const response = await fetch(`${ip}/report.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: passedID,
        category,
        description,
        images: uploadedImageURLs, // include uploaded image URLs here
      }),
      credentials: 'include',
    });


    const data = await response.json();
    console.log(data.message);


    if (data.message === "Report submitted successfully") {
      MySwal.fire({
        icon: 'success',
        title: 'Report Submitted',
        text: data.message,
        showConfirmButton: false,
        timer: 1500
      });
      navigate("/browseItems");
    } else {
      MySwal.fire({
        icon: 'error',
        title: 'Report Submit Error',
        text: data.message,
        showConfirmButton: false,
        timer: 1500
      });
    }
  } catch (error) {
    console.error("Report Submit Error:", error);
    MySwal.fire({
      icon: 'error',
      title: 'Report Submit Error',
      text: error.message || "An error occurred",
      showConfirmButton: false,
      timer: 1500
    });
  }
};


  const goBack = (event) => {
    event.preventDefault();
    navigate("/browseItems")
  }
 
  return (
    <div className="reportcontainer">
      <div className="reportbox">
        <h2 className="reporttitle">Report Item</h2>
        <h3 className="subheading">Please fill out the form below to report the item</h3>

        <div className="itembar">
          <img src={previewPic} alt={itemName} className='reportImg'/>
          <h3>{itemName}</h3>
        </div>

        <form onSubmit={handleSubmit} className='report-form'>
          <label className="reasontitle" htmlFor="category">
            Reason for report
          </label>
          <br/><br/>
          <select
            id="category"
            className="report-select"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" disabled hidden>
              Select a reason
            </option>
            <option value="Scam">Scam Listing</option>
            <option value="Inappropriate">Inappropriate or Offensive Content </option>
            <option value="Prohibited">Prohibited or Restricted Items</option>
            <option value="Incorrect or Misleading Information">Incorrect or Misleading Information</option>
            <option value="Others">Others</option>
          </select>

          <br/><br/>
          <label className="reasondesc">Description:</label><br/><br/>
          <textarea
            type="text"
            id="itemName"
            className="desc-input"
            name="itemName"
            placeholder="Enter Report Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <h3>Upload Pictures</h3>
          <div className="report-picture">
            <DragNdrop onImagesChange={handleImagesFromChild} />
          </div>
          <div className="buttons-display">
            <button type="submit" className="submit-report"><Send size={19} /><b>Submit</b></button>
            <button className="cancel-button" onClick={(event) => {goBack(event);}}><b>Cancel</b></button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Reportitem;