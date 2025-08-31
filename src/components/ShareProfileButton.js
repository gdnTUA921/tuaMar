import React, { useState } from 'react';
import styled from 'styled-components';
import { Check } from "lucide-react";
import { FaShare } from "react-icons/fa";

const ShareProfileButton = ({fullName}) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleShareClick = () => {

        console.log(fullName);
        const urlToCopy = window.location.hostname + "/userprofile/" + encodeURIComponent(fullName);

        // Copy the url to clipboard
        navigator.clipboard.writeText(urlToCopy);
        
        // Trigger animation
        setIsClicked(true);
        
        // Reset after animation
        setTimeout(() => {
            setIsClicked(false);
        }, 2000);
    }

    return (
        <StyledWrapper>
            <div className="centralize">
                <div>
                    <button 
                        onClick={handleShareClick}
                        className={isClicked ? 'clicked' : ''}
                    >
                        <span className="first">
                            <FaShare width={15} height={15}/>&nbsp;&nbsp;Share
                        </span>
                        <span className="second">
                            <Check width={15} height={15}/>&nbsp;Link Copied
                        </span>
                    </button>
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .centralize {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button {
    background-color: #547B3E;
    width: 120px;
    height: 40px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    position: relative;
    transition-duration: 700ms;
  }

  button span {
    position: absolute;
    top: 50%;
    left: 50%;
    color: white;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  button span.first {
    transform: translate(-50%, -50%);
    transition-duration: 500ms;
  }

  button span.second {
    opacity: 0;
    transform: translate(100%, -50%);
    transition-duration: 500ms;
  }

  button.clicked {
    background-color: #547B3E;
    width: 160px;
    transition-delay: 100ms;
    transition-duration: 500ms;
  }

  button.clicked span.first {
    transform: translate(-50%, -150%);
    opacity: 0;
    transition-duration: 500ms;
  }

  button.clicked span.second {
    transform: translate(-50%, -50%);
    opacity: 1;
    transition-delay: 300ms;
    transition-duration: 500ms;
  }

  @media (max-width: 500px) {
    
    .first {
      font-size: 14px;
    }

    .second {
      font-size: 14px;
    }

  }
`;

export default ShareProfileButton;