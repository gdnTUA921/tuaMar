import React, { useState, useEffect } from 'react';
import { Send } from "lucide-react"; // Library for icons
import { useNavigate, useLocation } from 'react-router-dom';
import "./Reportitem.css"; // Import CSS file

const Reportitem = () => {
  const location = useLocation();
  const { passedID, previewPic, itemName} = location.state || {}; // Extract passedID from location state
  const navigate = useNavigate(); // Initialize navigate for programmatic navigation


  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");


  const ip = process.env.REACT_APP_LAPTOP_IP; // IP address (see env file for set up)


  useEffect(() => {
    // Checking if logged in, if not redirected to log-in
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
 
    console.log({
      item_id: passedID,
      category,
      description,
    });
 
    fetch(`${ip}/tua_marketplace/report.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: passedID,
        category,
        description,
      }),
      credentials: 'include',
    })
      .then((res) => res.text())  // Change this to .text() to get raw response
      .then((data) => {
        console.log("Server response:", data);  // Log raw response
        alert("Server Response: " + data);  // Display raw response to user
        navigate("/home");
      })
      .catch((error) => {
        console.error("Report Submit Error:", error);
        alert("Error submitting report: " + error.message);
      });
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
            <option value="Incorrect Supplies">Incorrect or Misleading Information</option>
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