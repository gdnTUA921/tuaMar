import React, { useState, useEffect } from 'react';
import "../assets/Reviewmod.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Star } from "lucide-react";
import DragNdrop from '../components/DragNdrop';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig"; // Adjust path if needed
import { v4 as uuidv4 } from "uuid";

const Reviewmod = () => {
  const MySwal = withReactContent(Swal);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState([]); // File objects

  const handleStarClick = (index) => setRating(index + 1);
  const handleStarHover = (index) => setHoveredRating(index + 1);
  const handleStarLeave = () => setHoveredRating(0);
  const handleImagesFromChild = (imageData) => setImages(imageData);

  const location = useLocation();
  const { passedID, previewPic, itemName, reviewedUser, reviewedUserID, receiverPicture, passedStatus } = location.state || {};
  const ip = process.env.REACT_APP_LAPTOP_IP;
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${ip}/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (!data.user_id) navigate("/");
      })
      .catch(console.error);
  }, [ip, navigate]);


  //upload images to firebase storage
  const uploadImagesToFirebase = async () => {
    const uploadPromises = images.map(async (file) => {
      if (file instanceof File) {
        const storageRef = ref(storage, `reviews/${uuidv4()}_${file.name}`);
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
      const uploadedImageURLs = await uploadImagesToFirebase();

      const reviewerStatus = passedStatus === "seller" ? "buyer" : "seller";

      const response = await fetch(`${ip}/leaveReview.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          item_id: passedID,
          rating,
          reviewText,
          images: uploadedImageURLs, // now actual URLs
          reviewedUserID,
          reviewerStatus,
        }),
      });

      const data = await response.json();

      MySwal.fire({
        icon: 'success',
        title: 'Review Submitted',
        text: data.message,
        showConfirmButton: false,
        timer: 1500
      });

      navigate("/messages");

    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review: " + error.message);
    }
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
              <div className="reviewitemname">{itemName}</div>
            </div>
            <hr className="review-divider" />
            <div className='review-main'>
              <h2>How was your experience with: <b style={{ color: "green" }}>{reviewedUser}</b>?</h2>
              <h4 className='review-subtitle'>Rate your interaction with this {passedStatus}</h4>
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
                        className={`star-icon${index + 1 <= (hoveredRating || rating) ? ' filled' : ''}`}
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
                  maxLength={500}
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
                <button type="submit" className="sell-button" disabled={rating === 0 || reviewText.trim() === ''}>
                  <b>Submit</b>
                </button>
                <button type="button" className="cancel-button" onClick={() => window.history.back()}>
                  <b>Cancel</b>
                </button>
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
