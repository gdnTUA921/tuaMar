import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function AutoLogout({ loggedIn, setLoggedIn, ip }) {
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const TIME_LIMIT = 5 * 60 * 1000; // 5 minutes
  const typingRef = useRef(false);
  const uploadingRef = useRef(false);
  const timerRef = useRef(null);

  // 🔵 PUBLIC GLOBAL FUNCTIONS (accessible from ANY component)
  window.__startTyping = () => { typingRef.current = true; };
  window.__stopTyping  = () => { typingRef.current = false; resetTimer(); };

  window.__startUpload = () => { uploadingRef.current = true; };
  window.__stopUpload  = () => { uploadingRef.current = false; resetTimer(); };

  // --------------------------
  // MAIN AUTO LOGOUT LOGIC
  // --------------------------
  const resetTimer = () => {
    // If typing or uploading → do NOT start timer
    if (typingRef.current || uploadingRef.current) {
      clearTimeout(timerRef.current);
      return;
    }

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // Call backend logout
      await fetch(`${ip}/logOut.php`, {
        method: "POST",
        credentials: "include",
      });

      setLoggedIn(false);

      // Auto popup
      MySwal.fire({
        icon: "info",
        title: "Logged Out",
        text: "You have been logged out due to inactivity.",
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    }, TIME_LIMIT);
  };

  useEffect(() => {
    console.log("AutoLogout mounted. loggedIn =", loggedIn);

    if (!loggedIn) return;

    const activity = () => {
      if (!typingRef.current && !uploadingRef.current) {
        resetTimer();
      }
    };

    // User activity listeners
    window.addEventListener("mousemove", activity);
    window.addEventListener("keydown", activity);
    window.addEventListener("click", activity);
    window.addEventListener("scroll", activity);

    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", activity);
      window.removeEventListener("keydown", activity);
      window.removeEventListener("click", activity);
      window.removeEventListener("scroll", activity);
    };
  }, [loggedIn, ip, navigate]);

  return null;
}