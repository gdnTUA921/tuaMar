import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Header.css';
import { Link } from "react-router-dom";
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { LogIn, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import RatingModal from './RatingModal';

function Header({ loggedIn, setLoggedIn }) {
  const [userData, setUserData] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  //for IP address
  const ip = process.env.REACT_APP_LAPTOP_IP;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Step 1: Check session
        const sessionRes = await fetch(`${ip}/fetchSession.php`, {
          method: "GET",
          credentials: "include",
        });
        const sessionData = await sessionRes.json();

        // Step 2: Fetch user profile details
        const profileRes = await fetch(`${ip}/fetchMyProfileDeets.php`, {
          method: "GET",
          credentials: "include",
        });

        const profileData = await profileRes.json();
        setUserData(profileData); // This contains the profile_pic

        // Step 3: Check if user has already rated
        if (sessionData.user_id) {
          const ratingRes = await fetch(`${ip}/checkUserRating.php`, {
            method: "GET",
            credentials: "include",
          });
          const ratingData = await ratingRes.json();
          setHasRated(ratingData.has_rated || false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, [ip]);

  const MySwal = withReactContent(Swal);

  const navigate = useNavigate();

  const handleLogOut = async (event) => {
    event.preventDefault();

    // Check if user has rated, if not show rating modal
    if (!hasRated) {
      setShowRatingModal(true);
      return;
    }

    // Proceed with logout if user has already rated
    performLogout();
  }

  const performLogout = async () => {
    try {
      // Record user logout in audit log
      if (userData?.user_id && userData?.email) {
        fetch(`${ip}/recordUnifiedAuditLog.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userData.user_id,
            user_email: userData.email,
            user_type: "user",
            action: "LOGOUT",
            browser: navigator.userAgent
          }),
          credentials: "include"
        }).catch(err => console.error("Audit log error:", err));
      }

      await signOut(auth);

      const response = await fetch(`${ip}/logOut.php`, {
        credentials: "include", // This is important for cookies!
      });

      const data = await response.json();

      if (data.message) {
        MySwal.fire({
          icon: 'success',
          title: 'Log-Out Successful',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          setLoggedIn(false);
          navigate("/login");
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      MySwal.fire({
        icon: 'error',
        title: 'Log-Out Failed',
        text: 'Something went wrong while logging out.',
      });
    }
  }

  const handleRatingSubmit = async (rating, feedback) => {
    try {
      const response = await fetch(`${ip}/submitRating.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: rating,
          feedback: feedback
        })
      });

      const data = await response.json();

      if (data.success) {
        setHasRated(true);
        // Don't call performLogout here - let the RatingModal show success message first
        // performLogout will be called by handleRatingClose after user clicks OK
      } else {
        throw new Error(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      throw error;
    }
  }

  const handleRatingClose = () => {
    setShowRatingModal(false);
    // Small delay to allow modal to close, then show success alert
    setTimeout(() => {
      MySwal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your feedback has been submitted successfully.',
        confirmButtonColor: '#456a31',
        confirmButtonText: 'OK'
      }).then(() => {
        performLogout();
      });
    }, 100);
  }

  const handleLogIn = async (event) => {
    event.preventDefault();
    navigate("/login");
  }


  return (
    <header>
      <Link to="/" className="homeLogo">
        <div className="logo">
          <img
            src="/tuamar.png"
            alt="TUA Logo"
          />
        </div>
        <h1>TUA Marketplace</h1>
      </Link>

      <nav>
        <Link to="/" className="nav-link"><h2>Home</h2></Link>
        <Link to="/browseItems" className="nav-link"><h2>Browse Items</h2></Link>
        <Link to="/sell" className="nav-link"><h2>Sell Item</h2></Link>
        <Link to="/messages" className="nav-link"><h2>Messages</h2></Link>
        <Link to="/myProfile" className="nav-link"><h2>My Profile</h2></Link>
      </nav>

      <div className="container">
        {loggedIn ? <div className="profile-icon" id="headerIcon">
          <Link to="/myProfile">
            <img src={userData.profile_pic}
              onError={(e) => (e.currentTarget.src = "tuamar-profile-icon.jpg")}
            />
          </Link>
        </div> : <i className="bi bi-person-fill" id="headerIcon"></i>}
        <div className="productDropDown">
          <Link onClick={loggedIn ? handleLogOut : handleLogIn}>{loggedIn ? <LogIn /> : <LogOut />}&nbsp;&nbsp;&nbsp;{loggedIn ? "Log Out" : "Log In"}</Link>
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          onSubmit={handleRatingSubmit}
          onClose={handleRatingClose}
        />
      )}

    </header>
  );
}

export default Header;