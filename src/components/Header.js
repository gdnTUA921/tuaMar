import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Header.css';
import { Link } from "react-router-dom";
import { signInWithPopup, signOut} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { LogIn, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import AutoLogout from "./AutoLogout";


function Header({loggedIn, setLoggedIn}) {
  const [userData, setUserData] = React.useState({});
  
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

      if (!sessionData.user_id) {
        return; // User not logged in, exit early
      }
      // Step 2: Fetch user profile details
      const profileRes = await fetch(`${ip}/fetchMyProfileDeets.php`, {
        method: "GET",
        credentials: "include",
      });
      const profileData = await profileRes.json();

      if (profileData){
        setUserData(profileData); // This contains the profile_pic
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


      try{
          await signOut(auth);


          const response = await fetch(`${ip}/logOut.php`, {
            credentials: "include", // This is important for cookies!
          });


          const data = await response.json();


          if (data.message){
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


    const handleLogIn = async (event) => {
      event.preventDefault();
      navigate("/login");
    }


  return (
    <header>
      <AutoLogout loggedIn={loggedIn} setLoggedIn={setLoggedIn} ip={ip} />
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
        {loggedIn ? <div className ="profile-icon" id="headerIcon">
          <Link to="/myProfile">
            <img src = {userData.profile_pic}
              onError= {(e) => (e.currentTarget.src = "tuamar-profile-icon.jpg")}
            />
        </Link>
        </div> : <i className="bi bi-person-fill" id="headerIcon"></i>}
        <div className="productDropDown">
          <Link onClick={loggedIn ? handleLogOut : handleLogIn}>{loggedIn ? <LogIn/> : <LogOut/>}&nbsp;&nbsp;&nbsp;{loggedIn ? "Log Out" : "Log In"}</Link>
        </div>
      </div>
         
    </header>
  );
}


export default Header;
