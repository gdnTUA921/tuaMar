import React from 'react';
import styled from 'styled-components';
import "../assets/Loader.css"; // Assuming you have a separate CSS file for styles


const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <img src="tuamar.png" alt="TUA Logo" className="loader-logo" />
        <div className="loading-text">
          Loading<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
        </div>
        <div className="loading-bar-background">
          <div className="loading-bar">
            <div className="white-bars-container">
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
              <div className="white-bar" />
            </div>
          </div>
        </div>
        <div className="loading-text-message">
          Please wait, this may take a few seconds...<br />
          Thank you for your patience!
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 5px;
  }

  .loading-text {
    color: black;
    font-size: 20pt;
    font-weight: 600;
    margin-left: 10px;
    margin-bottom: 15px;
  }

  .dot {
    margin-left: 3px;
    animation: blink 1.5s infinite;
  }
  .dot:nth-child(2) {
    animation-delay: 0.3s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.6s;
  }

  .loading-bar-background {
    --height: 30px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 5px;
    width: 200px;
    height: var(--height);
    background-color: #212121 /*change this*/;
    box-shadow: #0c0c0c -2px 2px 4px 0px inset;
    border-radius: calc(var(--height) / 2);
  }

  .loading-bar {
    position: relative;
    display: flex;
    justify-content: center;
    flex-direction: column;
    --height: 20px;
    width: 0%;
    height: var(--height);
    overflow: hidden;
    background: #247327;
    background: linear-gradient(
      0deg,
      rgb(2, 183, 50) 0%,
      rgb(16, 111, 3) 100%
    );
    border-radius: calc(var(--height) / 2);
    animation: loading 4s ease-out infinite;
  }

  .white-bars-container {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .white-bar {
    background: rgb(255, 255, 255);
    background: linear-gradient(
      -45deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0) 70%
    );
    width: 10px;
    height: 45px;
    opacity: 0.3;
    rotate: 45deg;
  }

  @keyframes loading {
    0% {
      width: 0;
    }
    80% {
      width: 100%;
    }
    100% {
      width: 100%;
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }`;

export default Loader;
