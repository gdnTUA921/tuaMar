import React, {useEffect, useState} from 'react';
import '../assets/Header.css';
import '../assets/LogIn.css';
import { useNavigate, Link} from "react-router-dom";
import { signInWithPopup, signOut} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CountdownTimer from '../components/CountdownTimer';

function LogIn({setLoggedIn}) {

    const MySwal = withReactContent(Swal);

     const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)

     const [adminLogIn, setAdminLogIn] = useState("none");
     const [adminForgotPass, setAdminForgotPass] = useState("none");
     const [adminOTP, setAdminOTP] = useState("none");
     const [resetPass, setResetPass] = useState("none");

     //For Log In Block Change
     const adminLogs = (event) => {
        setAdminLogIn("flex");
        setAdminForgotPass("none");
        setAdminOTP("none");
     }
     
     const backtoLogin = (event) => {
        setAdminLogIn("none");
        setAdminForgotPass("none");
        setAdminOTP("none");
     }

     const forgotPass = (event) => {
        setAdminForgotPass("flex");
        setAdminLogIn("none");
        setAdminOTP("none");
     }

     //Reload the page upon start up -- beneficial for clearing CSS properties of popup boxes for both admin and user accounts
     //This is to ensure that the CSS properties for popup box does not affect each account types upon switching accounts.
    useEffect(() => {
        if (sessionStorage.getItem("reloaded")) {
            return; // If already reloaded, do nothing
        }
        window.location.reload();
        sessionStorage.setItem("reloaded", true);
     }, []);


     //For Log In Functionality (setting up states for username and password details)
     //setting up eyes, password type, and user details
     const [eyeBtn, setEyeBtn] = useState("bi bi-eye-fill inputIcon");
     const [passType, setPassType] = useState("password");
     const [passType2, setPassType2] = useState("password");
     const [user, setUser] = useState("");
     const [password, setPassword] = useState("");


     // Toggle password visibility function
     const togglePassword = (eyeType, passwordType) => {

        if (eyeType == "bi bi-eye-fill inputIcon"){
            setEyeBtn("bi bi-eye-slash-fill inputIcon");
            
            if (passwordType === "password"){
                setPassType("text");
            } else if (passwordType === "confirm_password"){
                setPassType2("text");
            }
        }

        else if (eyeType == "bi bi-eye-slash-fill inputIcon"){
            setEyeBtn("bi bi-eye-fill inputIcon");

            if (passwordType === "password"){
                setPassType("password");
            } else if (passwordType === "confirm_password"){
                setPassType2("password");
            }
        }
     }

    //For supplying states of username and password for log in
    const handleUserChange = (event) => setUser(event.target.value);
    const handleUserPassword = (event) => setPassword(event.target.value);

    
    const navigate = useNavigate(); //for navigation to other pages

    //For Admin Log In
    //This function handles the log in of the admin account
     const handleLogIn = (event) => {
        event.preventDefault();
    
        fetch(`${ip}/handleLogIn.php`, {
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
                MySwal.fire({
                icon: 'success',
                title: 'Login Successful',
                showConfirmButton: false,
                timer: 1500
                });
                sessionStorage.removeItem("reloaded"); // Clear the reload session storage
                navigate("/admin");
            } else {
                MySwal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: data.message,
                confirmButtonColor: 'green'
                });
            }
        })
          .catch((error) => console.error("Error:", error));
      };

    
    // For Google Log In
    // This function handles the Google authentication process for user accounts.
    // It checks if the user has a TUA email and handles the session creation
    // If the user is unauthorized, it deletes the user from Firebase and signs them out.
    // If the user is banned, it shows an error message and signs them out
    // Log In is done through Google Auth using Firebase
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const email = user.email;
            const idToken = await user.getIdToken();

            // Check for @tua.edu.ph email
            if (!email.endsWith("@tua.edu.ph")) {
                await MySwal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: "Only users with a TUA email address are allowed.",
                    confirmButtonColor: 'green'
                });

                try {
                    await user.delete();
                    console.log("Unauthorized user deleted from Firebase.");
                } catch (deleteError) {
                    console.warn("Failed to delete user:", deleteError);
                }

                await signOut(auth);
                return;
            }

            // Send data to PHP to verify and create session
            const response = await fetch(`${ip}/handleGoogleLogIn.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ idToken }),
                credentials: "include",
            });

            const resultData = await response.json();

            if (resultData.status === "banned") {
                await MySwal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: "Your account has been banned from TUA Marketplace.",
                    confirmButtonColor: 'green'
                });

                await signOut(auth);
                return;
            }

            if (resultData.status === "success") {
                MySwal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    showConfirmButton: false,
                    timer: 1500
                });
                setLoggedIn(true);
                sessionStorage.removeItem("reloaded"); // Clear the reload session storage
                navigate("/");
            } else {
                await MySwal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: resultData.message || "Unexpected error occurred.",
                    confirmButtonColor: 'green'
                });
                await signOut(auth);
            }

        } catch (error) {
            console.error("Error during Google login", error);
            await MySwal.fire({
                icon: 'error',
                title: 'Login Error',
                text: "An unexpected error occurred during login.",
                confirmButtonColor: 'green'
            });
        }
    };


    //For forgot password
    const [user2, setUser2] = useState(""); 

    const [otp, setOTP] = useState(""); //for OTP input
    const [sentStatus, setSentStatus] = useState(false);
    const [otpVerified, setOTPVerified] = useState(false);
    const [newPass, setNewPass] = useState(false);
    const [confirmPass, setConfirmPass] = useState(false);

    const handleUserChange2 = (event) => setUser2(event.target.value);

    const handleNewUserPass = (event) => setNewPass(event.target.value);
    const handleConfirmUserPass = (event) => setConfirmPass(event.target.value);
    const handleOTPChange = (event) => setOTP(event.target.value);


    //Once the user supplies their email address, this function will send a request to the backend to generate an OTP
    const handleForgotPass = (event) => {
        event.preventDefault();
        requestOTP();
    }

    //For OTP Verification
    const handleOTPSubmit = (event) => {
        event.preventDefault();
        fetch(`${ip}/verifyOTP.php`, {
            method: "POST",
            body: JSON.stringify({email: user2, otp: otp})
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.message == "OTP Verified"){
                MySwal.fire({
                    icon: 'success',
                    title: 'One-Time Code Verified.',
                    text: data.message,
                    showConfirmButton: false,
                    timer: 1500
                });
                setSentStatus(false);
                setOTPVerified(true);
                setAdminForgotPass("none");
                setAdminLogIn("none");
                setAdminOTP("none");
                setResetPass("flex");
            }
            else{
                MySwal.fire({
                    icon: 'error',
                    title: 'Error Verifying OTP',
                    text: data.error,
                    confirmButtonColor: 'green'
                });
            }
        })
        .catch((error) => console.error("Error:", error));
    }

    //For requesting a new OTP
    const handleRequestNewOTP = (event) => {
        event.preventDefault();
        requestOTP();
    }

    //request OTP Function common for handleRequestNewOTP and handleForgotPass
    const requestOTP = () => {
        fetch(`${ip}/generateOTP.php`, {
            method: "POST",
            body: JSON.stringify({email: user2})
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.message == "One-Time Pin sent successfully."){
                MySwal.fire({
                    icon: 'success',
                    title: 'One-Time Pin sent successfully.',
                    text: data.message,
                    showConfirmButton: false,
                    timer: 1500
                });
                setSentStatus(true);
                setAdminOTP("flex");
                setAdminForgotPass("none");
            }
            else{
                MySwal.fire({
                    icon: 'error',
                    title: 'Error Sending One-Time-Pin',
                    text: data.error,
                    confirmButtonColor: 'green'
                });
            }
        })
        .catch((error) => console.error("Error:", error));
    }

    //For OTP Expiry Countdown 
    const handleExpire = () => {
        MySwal.fire({
            icon: 'error',
            title: 'OTP Expired',
            text: 'Your one-time pin has expired. Please request a new one.',
            showConfirmButton: true,
            confirmButtonColor: 'green'
        });
        setSentStatus(false); // Disable the "Resend OTP" button
    };


    //For Password Reset
    const handlePasswordReset = (event) =>{
        event.preventDefault();
        fetch(`${ip}/resetPassword.php`, {
            method: "POST",
            body: JSON.stringify({email: user2, newPass: newPass, confirmPass: confirmPass})
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.message == "Password Reset Successful"){
                MySwal.fire({
                    icon: 'success',
                    title: 'Password Reset Successful.',
                    text: data.message,
                    showConfirmButton: false,
                    timer: 1500
                });
                setOTPVerified(false);
                setAdminForgotPass("none");
                setAdminLogIn("none");
                setAdminOTP("none");
                setResetPass("none");
            }
            else{
                MySwal.fire({
                    icon: 'error',
                    title: 'Error Password Reset.',
                    text: data.error,
                    confirmButtonColor: 'green'
                });
            }
        })
        .catch((error) => console.error("Error:", error));
    }



  return (
    <>
    <div className="pageWrapper">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <header className="headerLogIn">
            <div className="logo">
                <img 
                src="/tuamar.png" 
                alt="TUA Logo" 
                />
            </div>
            <h1>TUA Marketplace</h1>
        </header>
        </Link>

        <div className="logInBG">
            <div className="logInBox">
                <div className="logInContents">
                    <h1 className="logInTitle">Welcome to TUA Marketplace</h1>
                    <img src="/tuamar.png" alt="TUA Logo" className="logInLogo" style={{display: adminLogIn === "none" && adminForgotPass === "none" && adminOTP === "none" && resetPass === "none" ? "flex" : "none"}}/>
                    <button className='adminLogIn' onClick={adminLogs} style={{display: adminLogIn === "none" && adminForgotPass === "none" && adminOTP === "none" && resetPass === "none" ? "flex" : "none"}}>
                        <img src="/tuamar.png" alt='TUA Logo' className='gLogo'/>
                        Login as Admin
                    </button>
                    <button className='googleLogIn' onClick={handleGoogleLogin} style={{display: adminLogIn === "none" && adminForgotPass === "none" && adminOTP === "none" && resetPass === "none" ? "flex" : "none"}}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png" alt='Google Logo' className='gLogo'/>
                        Continue with Google
                    </button>
                                                 <p className="register-link">
                            Don't have an account? <Link to="/register">Register here</Link>
                            </p>
                </div>

                {/*Admin Log In*/}
                <div className="logInContents_admin" style={{display: adminLogIn === "none" ? "none" : "flex"}}>
                    <div className="adminLogInHeader">
                        <img src="/tuamar.png" alt="TUA Logo" />
                        <h2>Admin Login</h2>
                    </div>
                    <form className="logInForm" onSubmit={handleLogIn}>
                        <div className="inputWrapper">
                            <i className="bi bi-person-fill inputIcon"></i>
                            <input
                                className="userName"
                                id="userName"
                                type="email"
                                name="username"
                                placeholder="Email"
                                onChange={handleUserChange}
                                required
                            />
                        </div>

                        <div className="passwordWrapper">
                            <i className="bi bi-key-fill inputIcon"></i>
                            <input
                                className="password"
                                type={passType === "password" ? "password" : "text"}
                                name="password"
                                placeholder="Password"
                                id="logInPass"
                                onChange={handleUserPassword}
                                required
                            />
                            <i
                                className={`bi ${passType === "password" ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                                id="eyeBtn1"
                                onClick={() => togglePassword(eyeBtn, "password")}
                                role="button"
                            ></i>
                        </div>
                                <br/><br/>
                                <button type="submit" className='signInButton'>Sign In</button>
                                <button type="submit" className="signInButton cancel" onClick={(e) => {e.preventDefault(); backtoLogin()}}><b>Cancel</b></button>
                    </form>
                    <div className='forgotPass' onClick={forgotPass}>Forgot Password?</div>
                </div>


                {/*Forgot Password*/}
                <div className="logInContents_admin" style={{display: adminForgotPass == "none" ? "none" : "flex"}}>
                    <div className="adminLogInHeader">
                        <img src="/tuamar.png" alt="TUA Logo" />
                        <h2>Forgot Password</h2>
                    </div>
                    <p className='forgotPassInstruction'>Enter your email address and we'll send you a one-time pin (OTP)</p>
                    <form className="logInForm" onSubmit={handleForgotPass}>
                        <div className="inputWrapper">
                            <i className="bi bi-person-fill inputIcon"></i>
                            <input
                                className="userName"
                                id="userName2"
                                type="email"
                                name="username"
                                placeholder="Email"
                                onChange={handleUserChange2}
                                required
                            />
                        </div>
                        <br/><br/>
                        <button type="submit" className='signInButton'>Submit</button>
                        <button type="submit" className="signInButton cancel" onClick={(e) => {e.preventDefault(); setAdminForgotPass("none"); setAdminLogIn("flex");}}><b>Cancel</b></button>
                    </form>
                </div>


                {/*Enter One-Time-Pin*/}
                <div className="logInContents_admin" style={{display: adminOTP == "none" ? "none" : "flex"}}>
                    <div className="adminLogInHeader">
                        <img src="/tuamar.png" alt="TUA Logo" />
                        <h2>Enter One-Time Pin</h2>
                    </div>
                    <p className='forgotPassInstruction'>Enter the 6-digit OTP sent to your email address</p>
                    {sentStatus === true ? <CountdownTimer duration={300} onExpire={handleExpire} /> : ""}
                    <form className="logInForm" onSubmit={handleOTPSubmit}>
                        <div className="inputWrapper">
                            <i className="bi bi-shield-lock-fill inputIcon"></i>
                            <input
                                id="otpCode"
                                type="number"
                                name="otp"
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                pattern="[0-9]{6}"
                                onChange={handleOTPChange}
                                required
                            />
                        </div>
                        <br/><br/>
                        <button type="submit" className='signInButton'>Verify OTP</button>
                        <button type="button" className="signInButton reqNewOTP" onClick={handleRequestNewOTP} style={{backgroundColor: '#6c757d', marginTop: '10px'}} disabled={sentStatus == true}>
                            Request New OTP
                        </button>
                        <button type="button" className="signInButton cancel" onClick={(e) => {e.preventDefault(); setAdminForgotPass("none"); setAdminOTP("none"); setAdminLogIn("flex");}}><b>Cancel</b></button>
                    </form>
                </div>


                {/*Password Reset*/}
                <div className="logInContents_admin" style={{display: !otpVerified && resetPass === "none" ? "none" : "flex"}}>
                    <div className="adminLogInHeader">
                        <img src="/tuamar.png" alt="TUA Logo" />
                        <h2>Reset Password</h2>
                    </div>
                    <form className="logInForm" onSubmit={handlePasswordReset}>
                        <div className="passwordWrapper">
                            <i className="bi bi-key-fill inputIcon"></i>
                            <input
                                className="password"
                                type={passType === "password" ? "password" : "text"}
                                name="password"
                                placeholder="Enter New Password"
                                id="newUserPass"
                                onChange={handleNewUserPass}
                                required
                            />
                            <i
                                className={`bi ${passType === "password" ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                                id="eyeBtn1"
                                onClick={() => togglePassword(eyeBtn, "password")}
                                role="button"
                            ></i>
                        </div>


                        <div className="passwordWrapper">
                            <i className="bi bi-key-fill inputIcon"></i>
                            <input
                                className="password"
                                type={passType2 === "password" ? "password" : "text"}
                                name="password"
                                placeholder="Confirm New Password"
                                id="confirmUserPass"
                                onChange={handleConfirmUserPass}
                                required
                            />
                            <i
                                className={`bi ${passType2 === "password" ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                                id="eyeBtn1"
                                onClick={() => togglePassword(eyeBtn, "confirm_password")}
                                role="button"
                            ></i>
                        </div>
                                <br/><br/>
                                <button type="submit" className='signInButton'>Submit</button>
                                <button type="submit" className="signInButton cancel" onClick={(e) => {e.preventDefault(); setAdminForgotPass("none"); setAdminOTP("none"); setResetPass("none"); setOTPVerified(false); setAdminLogIn("flex");}}><b>Cancel</b></button>

                    </form>
                </div>
            </div>
        </div>
    </div>
    </>
  );
}

export default LogIn;