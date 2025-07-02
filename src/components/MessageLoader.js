import React from 'react';
import './MessageLoader.css'; // Make sure to import the CSS

const MessageLoader = () => {
  return (
    <div className="message-loader-container">
      <div className="message-loader-circle" />
      <div className="message-loader-texts">
        <div className="message-loader-line short" />
        <div className="message-loader-line long" />
        <div className="message-loader-line short" />
      </div>
    </div>
  );
}

export default MessageLoader;
