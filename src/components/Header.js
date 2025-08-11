import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Header.css';
import { Link } from "react-router-dom";
import { signInWithPopup, signOut} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function Header() {

    //for IP address
    const ip = process.env.REACT_APP_LAPTOP_IP;

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
              navigate("/");
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


  return (
    <header>
      <Link to="/home" className="homeLogo">
      <div className="logo">
        <img 
          src="/tuamar.png" 
          alt="TUA Logo" 
        />
      </div>
      <h1>TUA Marketplace</h1>
      </Link>

      <nav>
        <Link to="/home" className="nav-link"><h2>Home</h2></Link>
        <Link to="/browseItems" className="nav-link"><h2>Browse Items</h2></Link>
        <Link to="/sell" className="nav-link"><h2>Sell Item</h2></Link>
        <Link to="/messages" className="nav-link"><h2>Messages</h2></Link>
        <Link to="/myProfile" className="nav-link"><h2>My Profile</h2></Link>
      </nav>

      <div className="container">
        <i className="bi bi-person-fill" id="headerIcon"></i>
        <div className="productDropDown">
          <Link onClick={handleLogOut}><i className="bi bi-box-arrow-right logOut">&nbsp;&nbsp;&nbsp;Log Out</i></Link>
        </div>
      </div>
      
    </header>
  );
}

export default Header;
