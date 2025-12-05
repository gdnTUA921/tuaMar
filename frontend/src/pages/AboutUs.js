import React from "react";
import "../assets/AboutUs.css";
import adviser1 from "../assets/images/adviser1.jpg";
import adviser2 from "../assets/images/adviser2.jpg";
import dean from "../assets/images/dean.jpg";
import dev1 from "../assets/images/dev1_1.JPG";
import dev2 from "../assets/images/dev2.png";
import dev3 from "../assets/images/dev3.JPG";
import dev4 from "../assets/images/dev4.jpeg";
import ceis from "../assets/images/ceis.png";


export default function AboutUs() {
  return (
    <div className="about-container">
      {/* HERO SECTION */}
      <section className="about-hero">
        <img
          src="/tuamar.png"
          alt="TUA Marketplace Logo"
          className="about-tuamar-logo"
        />
        <h1>About TUA Marketplace</h1>
        <p>
          <b>TUA Marketplace</b> is an innovative online platform developed exclusively
          for the students and faculty of Trinity University of Asia. It serves
          as a secure and user-friendly marketplace where members of the TUA
          community can buy, sell, and trade goods or services conveniently
          within a trusted environment. Designed to promote entrepreneurship,
          sustainability, and community engagement, TUA Marketplace reflects our
          commitment to empowering students through technology.
        </p>
      </section>

      {/* DEVELOPERS SECTION */}
      <section className="about-section developers">
        <h2>The Developers of TUA Marketplace</h2>
        <div className="dev-cards">
          <div className="dev-card">
            <img src={dev1} alt="Developer 1" />
            <h3>Peter Joshua Deloria</h3>
            <p>BS Information Technology - Software Engineering</p>
          </div>
          <div className="dev-card">
            <img src={dev2} alt="Developer 2" />
            <h3>Lance Christian Elane</h3>
            <p>BS Information Technology - Software Engineering</p>
          </div>
          <div className="dev-card">
            <img src={dev3} alt="Developer 3" />
            <h3>Giancarlo Nonato</h3>
            <p>BS Information Technology - Software Engineering</p>
          </div>
          <div className="dev-card">
            <img src={dev4} alt="Developer 4" />
            <h3>JB Erdie Ycong</h3>
            <p>BS Information Technology - Software Engineering</p>
          </div>
        </div>
      </section>

      {/* CEIS SECTION */}
      <section className="about-section ceis">
        <img
          src={ceis}
          alt="CEIS Department"
          className="ceis-image"
        />
        <h2>College of Engineering and Information Sciences (CEIS)</h2>
        <p>
          The College of Engineering and Information Sciences (CEIS) of Trinity
          University of Asia is dedicated to nurturing innovation, critical
          thinking, and technical excellence among its students. CEIS provides a
          strong foundation in engineering and computing disciplines, enabling
          learners to become globally competitive professionals and responsible
          contributors to society.
        </p>
      </section>

      {/* ACKNOWLEDGEMENTS SECTION */}
      <section className="about-section acknowledgements">
        <h2>Acknowledgements</h2>
        <p>
          We extend our heartfelt gratitude to our research advisers and
          department heads for their unwavering support <br />and guidance throughout
          the development of TUA Marketplace.
        </p>
        <div className="ack-cards">
          <div className="ack-card">
            <img src={"/tuamar-profile-icon.jpg" || adviser1} alt="Adviser 1" />
            <h3>Prof. Roman B. Villones, MIT</h3>
            <p>Research Adviser</p>
          </div>
          <div className="ack-card">
            <img src={"/tuamar-profile-icon.jpg" || adviser2} alt="Adviser 1" />
            <h3>Prof. Ronina C. Tayuan, MSCS</h3>
            <p>Research Adviser</p>
          </div>
          <div className="ack-card">
            <img src={"/tuamar-profile-icon.jpg" || dean} alt="Dean" />
            <h3>Dr. Ferdinand R. Bunag</h3>
            <p>Dean, CEIS</p>
          </div>
        </div>
      </section>
    </div>
  );
}
