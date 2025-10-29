import React from "react";
import "../assets/Footer.css";

function Footer() {
  return (
    <footer className="Footer">
      <div className="footer-content">
        {/* 🔹 Left Section: Contact Info */}
        <div className="footer-section contact">
          <h2>Contact Us</h2>
          <div className="conDetails" style={{marginTop:"20px"}}>
            <i className="bi bi-telephone-fill"></i>
            <a href="tel:09279142603">09279142603</a>
          </div>
          <div className="conDetails" style={{marginTop:"20px"}}>
            <i className="bi bi-envelope-at-fill"></i>
            <a href="mailto:tuamarketplace.support@gmail.com">
              tuamarketplace.support@gmail.com
            </a>
          </div>
          <div className="conDetails">
            <i className="bi bi-geo-alt-fill"></i>
            <p>
              TUA - CEIS <br />
              SSC Building (4th Floor)
            </p>
          </div>
        </div>

        {/* 🔹 Middle Section: Quick Links */}
        <div className="footer-section quick-links">
          <h2>Quick Links</h2>
          <ul>
            <li><a href="/aboutUs">About Us</a></li>
            <li><a href="/faq">FAQs</a></li>
            <li><a href="#">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* 🔹 Right Section: TUA Links */}
        <div className="footer-section tua-links">
          <h2>Trinity University of Asia</h2>
          <ul>
            <li>
              <a href="https://www.tua.edu.ph/" target="_blank" rel="noreferrer">
                Official Website
              </a>
            </li>
            <li>
              <a href="https://www.mytuaportal.com/" target="_blank" rel="noreferrer">
                TUA Portal
              </a>
            </li>
            <li>
              <a href="https://tualearning.com/" target="_blank" rel="noreferrer">
                TUA Learning Cloud
              </a>
            </li>
          </ul>
        </div>

        {/* 🔹 Social Media Section */}
        <div className="footer-section social-media">
          <h2>Follow TUA</h2>
          <div className="social-icons">
            <a href="https://www.facebook.com/OfficialTUAPage" target="_blank" rel="noreferrer">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="https://www.instagram.com/officialtuapage/" target="_blank" rel="noreferrer">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="https://x.com/officialtuapage" target="_blank" rel="noreferrer">
              <i className="bi bi-twitter-x"></i>
            </a>
          </div>
        </div>
      </div>

      {/* 🔹 Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-logo">
          <img src="/tuamar.png" alt="TUA Logo" />
          <div>
            <h3>TUA Marketplace</h3>
            <p>© {new Date().getFullYear()} TUA Marketplace. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
