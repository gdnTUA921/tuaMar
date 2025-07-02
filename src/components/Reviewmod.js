import React, { useState, useEffect } from 'react';
import "./Reviewmod.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // For SweetAlert2 

import { Star } from "lucide-react";
import DragNdrop from './DragNdrop';
import { color } from '@mui/system';
// {/* Library for icons*/}


const Reviewmod = () => {

   const MySwal = withReactContent(Swal); // Initialize SweetAlert2

  const [rating, setRating] =useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState([]); // Base64 images
  
  
  const handleStarClick = (index) => {
    setRating(index + 1);
  };


  const handleStarHover = (index) => {
    setHoveredRating(index + 1);
  };
  const handleStarLeave = () => {
    setHoveredRating(0);
  };


 const handleImagesFromChild = (imageData) => {
    setImages(imageData);
  };


  const location = useLocation();
  const { passedID, previewPic, itemName, reviewedUser, reviewedUserID, receiverPicture, passedStatus} = location.state || {};
  const ip = process.env.REACT_APP_LAPTOP_IP;
  const navigate = useNavigate();


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
      rating,
      reviewText,
      images,
      reviewedUser: reviewedUser,
      receiverPicture: receiverPicture
    });

    let reviewerStatus = passedStatus == "seller" ? "buyer" : "seller";
   
    fetch(`${ip}/tua_marketplace/leaveReview.php`, {
      method: "POST",
       headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          item_id: passedID,
          rating,
          reviewText,
          images,
          reviewedUser: reviewedUser,
          reviewedUserID: reviewedUserID,
          reviewerStatus: reviewerStatus,
        }),
        credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
          console.log("Server response:", data);  // Log raw response
         MySwal.fire({
            icon: 'success',
            title: 'Review Submitted',
            text: data.message,
            showConfirmButton: false,
            timer: 1500
            }); // Display raw response to user
        navigate("/messages");
          })
      .catch((error) => {
        console.error("Review Submit Error:", error);
        alert("Error submitting review: " + error.message);
      })


  };

 
  return (
    <div className="reviewcontainer">
      <div className="reviewBox">
      <div className="reviewheader">
        <h1 className="reviewtitle">Leave a Review</h1>
      </div>
      <div className="reviewcontent">
        <form className="reviewform" onSubmit={handleSubmit}>
          <div className="reviewformgroup">
            <img className='reviewitem' src={previewPic} alt="Reviewed item" />
            {/* PUT THE PRICE HERE!! */}
            <div className="reviewitemname">{itemName}</div>
          </div>
          <hr className="review-divider" />
          <div className='review-main'>
            <h2> How was your experience with: <b style={{color:"green"}}>{reviewedUser}</b> ?</h2>
              <h4 className='review-subtitle'> Rate your interaction with this {passedStatus}</h4>
              <div className='review-stars'>
                <h4 className='review-star-label'>Rating*</h4>
                <div className="star-rating">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleStarClick(index)}
                  onMouseEnter={() => handleStarHover(index)}
                  onMouseLeave={handleStarLeave}
                  className="star-button"
                >
                  <Star
                    size={45}
                    className={`star-icon${index +1  <= (hoveredRating || rating) ?
                      ' filled' : ''}`}
                  />
                </button>
              ))}
            </div>
              </div>
            <div className='review-textarea'>
              <h4 className='review-text-label'>Review*</h4>
              <textarea
                className="review-text-input"
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                maxLength={500} // Limit to 500 characters
              />
            </div>
            <hr className="review-divider" />
            <h3>Upload Pictures</h3>
              <div className="review-picture">
                <DragNdrop onImagesChange={handleImagesFromChild} />
              </div>

            <div className='review-guidelines'>
              <h4>Review Guidelines:</h4>
              <ul>
                <li>Be honest and constructive in your feedback.</li>
                <li>Avoid personal attacks or inappropriate language.</li>
                <li>Focus on the product or service, not the individual.</li>
              </ul>
            </div>

            <div className="buttonsDisplay">
                <button type="submit" className="sell-button"  disabled={rating === 0 || reviewText.trim() === ''}><b>Submit</b></button>
                <button className="cancel-button" onClick={() => window.history.back()}><b>Cancel</b></button>
              </div>
          </div>
           <hr className="review-divider" />
        </form>
      </div>
      </div>
    </div>
  );
};


export default Reviewmod;