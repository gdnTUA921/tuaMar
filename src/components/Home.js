//import './App.css';
import React, {useEffect, useState} from 'react';
import './Home.css';
import { Link, useNavigate} from "react-router-dom";

function Home() {

  const navigate = useNavigate();
  const [userID, setUserID] = useState("");
  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)

   useEffect(() => {
    //Checking if logged in, if not redirected to log-in
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
  }, [ip]);

  return (
   <>
    
  <main>
  <div className="background-wrapper">
    {/* Background Image  */}
    <div className="background"></div>

    {/* Text  */}
    <div className="welcome">
      <b>Welcome To TUA Marketplace</b>
    </div>

   {/* Text  */}
      <div className="welcome2">
        <h2>A secure platform where everything a Trinitian needs is at their fingertips.</h2>
      </div>
    
      <div className="button1">
      <Link to="/browseItems"><button>Start Shopping</button></Link>
      </div>
          
      <div className="button2">
        <Link to="/sell"><button>Start Selling</button></Link>
      </div>

  </div>
</main>

   </>
  );
}

export default Home;