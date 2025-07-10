import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Error.css'; // Import the CSS file

const Error = () => {

  const ip = process.env.REACT_APP_LAPTOP_IP; //set ip address

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(redirectPage);
  };

  const [redirectPage, setRedirectPage] = useState();


useEffect(() => {
      // Checking if logged in, if not redirected to log-in
      fetch(`${ip}/tua_marketplace/fetchSession.php`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.user_id) {
            setRedirectPage("/home");
          }
          else if (data.admin_id){
            setRedirectPage("/admin");
          }
          else{
            setRedirectPage("/");
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
        });
}, [ip, navigate]);


  return (
    <div className="error-container">
        <div className='error-container-inside'>
            <img src="/tuamar.png" className="error-image"/>
            <h1 className="error-heading-1">404</h1>
            <h1 className="error-heading-2">Page Not Found</h1>
            <p className="error-message">
                Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="error-buttons">
                <button className="error-button" onClick={handleGoBack}>
                Go Back
                </button>
                <button className="error-button" onClick={handleGoHome}>
                Go Home
                </button>
            </div>
        </div>
    </div>
  );
};

export default Error;
