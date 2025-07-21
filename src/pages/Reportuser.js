import React, { useState, useEffect } from 'react';
import { Send } from "lucide-react"; // Library for icons
import { useNavigate, useLocation } from 'react-router-dom';
import "../assets/Reportitem.css"; // Import CSS file
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


const Reportuser = () => {
  const location = useLocation();    
  const { passedItemID, receiverPicture, reportedUser, reportedUserId} = location.state || {}; // Extract passedID from location state
  const navigate = useNavigate(); // Initialize navigate for programmatic navigation


  const MySwal = withReactContent(Swal);  //For alerts
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
 
    fetch(`${ip}/tua_marketplace/reportUser.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: passedItemID,
        category,
        description,
        reportedUserId: reportedUserId
      }),
      credentials: 'include',
    })
      .then((res) => res.json())  // Change this to .json() to get raw response
      .then((data) => {
        if (data.message === "Report submitted successfully"){
          MySwal.fire({
            icon: 'success',
            title: 'Report Submitted',
            text: data.message,
            showConfirmButton: false,
            timer: 1500
            }); // Display raw response to user
          navigate("/messages");
        }
        else {
          MySwal.fire({
            icon: 'error',
            title: 'Report Submit Error',
            text: data.message,
            showConfirmButton: false,
            timer: 1500
          });
        }
      })
      .catch((error) => {
        console.error("Report Submit Error:", error);
        MySwal.fire({
          icon: 'error',
          title: 'Report Submit Error',
          text: error.message,
          showConfirmButton: false,
          timer: 1500
        });
      });
  };


const goBack = (event) => {
    event.preventDefault(); 
    navigate("/messages")
}
 
  return (
    <div className="reportcontainer">
      <div className="reportbox">
        <h2 className="reporttitle">Report User</h2>
        <h3 className="subheading">Please fill out the form below to report the user</h3>


        <div className="itembar">
          <img src={receiverPicture} alt={reportedUser} className='reportImg'/>
          <h3>{reportedUser}</h3>
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
            <option value="" disabled selected hidden>
              Select a reason
            </option>
            <option value="Scam">Tried to scam me</option>
            <option value="Inappropriate or Offensive Seller">Inappropriate or Offensive Seller </option>
            <option value="Selling prohibited items">Selling prohibited items</option>
            <option value="Harmful & Violent">Harmful & Violent</option>
            <option value="Others">Others</option>
          </select>


          <br/><br/><br/>
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




export default Reportuser;