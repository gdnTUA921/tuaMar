import React, { useState, useEffect } from "react";

function CountdownTimer({ duration = 300, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <p className="forgotPassInstruction" style={{ color: "#e74c3c", fontSize: "14px", marginTop: "10px" }}>
      Code expires in: <span id="otpTimer">{formatTime(secondsLeft)}</span>
    </p>
  );
}

export default CountdownTimer;
