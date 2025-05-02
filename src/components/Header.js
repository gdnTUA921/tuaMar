import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { Link } from "react-router-dom";

function Header() {

    const navigate = useNavigate();

    const handleLogOut = (event) => {
      event.preventDefault();

      fetch(`http://localhost/tua_marketplace/logOut.php`, {
        credentials: "include", // This is important for cookies!
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          navigate("/");
        })
        .catch((error) => console.error("Error fetching data:", error));

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
