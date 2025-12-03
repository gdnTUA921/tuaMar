import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../assets/RatingModal.css';

const RatingModal = ({ onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const MySwal = withReactContent(Swal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Rating Required',
        text: 'Please select a rating before submitting.',
        confirmButtonColor: '#456a31'
      });
      return;
    }

    try {
      await onSubmit(rating, feedback);
      MySwal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your feedback has been submitted successfully.',
        confirmButtonColor: '#456a31',
        timer: 2000
      });
      onClose();
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit rating. Please try again.',
        confirmButtonColor: '#456a31'
      });
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <button className="rating-modal-close" onClick={handleSkip}>×</button>
        
        <div className="rating-modal-header">
          <img src="/tuamar.png" alt="TUA Marketplace" className="rating-logo" />
          <h2>Rate Your Experience</h2>
          <p>Help us improve TUA Marketplace by sharing your feedback</p>
        </div>

        <form onSubmit={handleSubmit} className="rating-form">
          <div className="rating-stars-container">
            <label>How would you rate your experience?</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="rating-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="feedback-container">
            <label>Additional Comments (Optional)</label>
            <textarea
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="4"
              maxLength="500"
            />
            <small>{feedback.length}/500 characters</small>
          </div>

          <div className="rating-actions">
            <button type="button" className="skip-btn" onClick={handleSkip}>
              Skip
            </button>
            <button type="submit" className="submit-rating-btn">
              Submit Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;