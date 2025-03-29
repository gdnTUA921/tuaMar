import React from 'react';
import './Header.css';
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <Link to="/" className="homeLogo">
      <div className="logo">
        <img 
          src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Trinity_University_of_Asia_seal.svg/1200px-Trinity_University_of_Asia_seal.svg.png" 
          alt="TUA Logo" 
        />
      </div>
      <h1>TUA Marketplace</h1>
      </Link>

      <nav>
        <Link to="/" className="nav-link"><h2>Home</h2></Link>
        <Link to="/browseItems" className="nav-link"><h2>Browse Items</h2></Link>
        <Link to="/sell" className="nav-link"><h2>Sell Item</h2></Link>
        <Link to="/" className="nav-link"><h2>Messages</h2></Link>
        <Link to="/myProfile" className="nav-link"><h2>My Profile</h2></Link>
      </nav>

      <div class="container">
        <i className="bi bi-person-fill" id="headerIcon"></i>
        <div class="productDropDown">
          <a href="#"><i class="bi bi-box-arrow-right logOut">&nbsp;&nbsp;&nbsp;Log Out</i></a>
        </div>
      </div>
      
    </header>
  );
}

export default Header;
