import React from 'react';
import "./Footer.css";


function Footer() {
  return (
    <div className='Footer'>
      <div className="footerCard1">
        <h2>Contact us at:</h2>
        <div className="conDetails">
          <i className="bi bi-telephone-fill phone"/>
          <a href="#"><h3>09151234567</h3></a>
        </div>
        <div className="conDetails">
          <i className="bi bi-envelope-at-fill envelope"/>
          <a href="#"><h3>tuamarketplace.support@gmail.com</h3></a>
        </div>
        <div className="conDetails">
          <i className="bi bi-geo-alt-fill location"/>
          <a href="#"><h3>TUA - University Student Council<br/>SSC Building (2nd Floor)</h3></a>
        </div>         
      </div>

      <div className="footerCard2">
        <img src="/tuamar.png" alt="TUA Logo"/>
          <div className='footerTitle'>
            <h2>TUA Marketplace</h2>
            <p>&#169;{new Date().getFullYear()} TUA Marketplace</p>
          </div>
      </div>
    </div>
    
  )
}

export default Footer