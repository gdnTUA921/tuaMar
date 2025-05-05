import React, {useState} from 'react';
import './Header.css';
import './LogIn.css';
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signOut} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';

function LogIn() {

     const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)

     const [adminLogIn, setAdminLogIn] = useState("none");

     const adminLogs = (event) => setAdminLogIn("flex");
     const backtoLogin = (event) => setAdminLogIn("none");


     const [eyeBtn, setEyeBtn] = useState("bi bi-eye-fill");
     const [passType, setPassType] = useState("password");
     const [user, setUser] = useState("");
     const [password, setPassword] = useState("");

     const togglePassword = (eyeType) => {

        if (eyeType == "bi bi-eye-fill"){
            setEyeBtn("bi bi-eye-slash-fill");
            setPassType("text");
        }

        else if(eyeType == "bi bi-eye-slash-fill"){
            setEyeBtn("bi bi-eye-fill");
            setPassType("password");
        }
     }

    const handleUserChange = (event) => setUser(event.target.value);
    const handleUserPassword = (event) => setPassword(event.target.value);

    const navigate = useNavigate();

     const handleLogIn = (event) => {
        event.preventDefault();
    
        fetch(`${ip}/tua_marketplace/handleLogIn.php`, {
          method: "POST",
          body: JSON.stringify({
            user,
            password
          }),
          credentials: 'include'
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Server response:", data);
            if (data.status === "success") {
                alert("Log In Successful.");
                navigate("/admin");
            } else {
                alert("Login failed: " + data.message);
            }
        })
          .catch((error) => console.error("Error:", error));
      };

    // Google Auth using Firebase
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const email = user.email;
            const displayName = user.displayName;
    
            console.log("Logged in user email:", email);
    
            // Check if email ends with "@tua.edu.ph"
            if (!email.endsWith("@tua.edu.ph")) {
                alert("Access denied: Only users with a TUA email address are allowed.");
                // Try to delete the user from Firebase Auth
                try {
                    await user.delete(); // Only works if auth is fresh
                    console.log("Unauthorized user deleted from Firebase.");
                } catch (deleteError) {
                    console.warn("Failed to delete user:", deleteError);
                }

                // Sign out just in case
                await signOut(auth);
                return;
            }
    
            // Send email to PHP session for processing
            await fetch(`${ip}/tua_marketplace/handleGoogleLogIn.php`, {
                method: "POST",
                body: JSON.stringify({ email }),
                credentials: "include", // Important for sending cookies/session ID
            });
    
            alert("Log In Successful.");
            navigate("/home"); // Redirect to the home page after login
    
        } catch (error) {
            console.error("Error during Google login", error);
        }
    };

  return (
    <>
    <div className="pageWrapper">
        <header className="headerLogIn">
            <div className="logo">
                <img 
                src="/tuamar.png" 
                alt="TUA Logo" 
                />
            </div>
            <h1>TUA Marketplace</h1>
        </header>

        <div className="logInBG">
            <div className="logInBox">
                <div className="logInContents">
                    <h1 className="logInTitle">Welcome to TUA Marketplace</h1>
                    <img src="/tuamar.png" alt="TUA Logo" className="logInLogo" style={{display: adminLogIn == "none" ? "flex" : "none"}}/>
                    <button className='adminLogIn' onClick={adminLogs} style={{display: adminLogIn == "none" ? "flex" : "none"}}>
                        <img src="/tuamar.png" alt='TUA Logo' className='gLogo'/>
                        Login as Admin
                    </button>
                    <button className='googleLogIn' onClick={handleGoogleLogin} style={{display: adminLogIn == "none" ? "flex" : "none"}}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png" alt='Google Logo' className='gLogo'/>
                        Continue with Google
                    </button>
                </div>
                <div className="logInContents_admin" style={{display: adminLogIn == "none" ? "none" : "flex"}}>
                    <form onSubmit={handleLogIn}>
                                <i className="bi bi-person-fill" id="iconLogo"></i>
                                <input id="userName" type="text" name="username" placeholder="Email" onChange={handleUserChange} required/>
                                <br/><br/>
                                <i className="bi bi-key-fill" id="iconLogo"></i>
                                <input className="password" type={passType=="password" ? "password" : "text"} name="password" placeholder="Password" id="logInPass" onChange={handleUserPassword} required/>
                                <i className={eyeBtn=="bi bi-eye-fill" ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"} id="eyeBtn1" onClick={() => togglePassword(eyeBtn)}/>
                                <br/><br/>
                                <button type="submit" className='signInButton'>Sign In</button>
                                <button type="submit" className="signInButton cancel" onClick={(e) => {e.preventDefault(); backtoLogin()}}><b>Cancel</b></button>
                    </form>
                    <a href="" className='forgotPass'>Forgot Password?</a>
                </div>
            </div>
        </div>
    </div>
    </>
  );
}

export default LogIn;