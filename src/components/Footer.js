import React from 'react';
import "./Footer.css";


function Footer() {
  return (
    <div className='Footer'>
      <div className="footerCard1">
        <h2>Contact us at:</h2>
        <div className="conDetails">
          <i className="bi bi-telephone-fill phone"/>
          <a href=""><h3>09151234567</h3></a>
        </div>
        <div className="conDetails">
          <i className="bi bi-envelope-at-fill envelope"/>
          <a href=""><h3>tuamarketplace.support@gmail.com</h3></a>
        </div>
        <div className="conDetails">
          <i className="bi bi-geo-alt-fill location"/>
          <a href=""><h3>TUA - Student Affairs Center<br/>SSC Building (2nd Floor)</h3></a>
        </div>         
      </div>

      <div className="footerCard2">
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Trinity_University_of_Asia_seal.svg/1200px-Trinity_University_of_Asia_seal.svg.png" alt="TUA Logo"/>
          <div>
            <h2>TUA Marketplace</h2>
            <p>&#169;2025 TUA Marketplace</p>
          </div>
      </div>
    </div>
    
  )
}

export default Footer