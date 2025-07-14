import React, {useState} from 'react';
import './Header.css';
import './LogIn.css';
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signOut} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CountdownTimer from './CountdownTimer';

function LogIn() {

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


     const [eyeBtn, setEyeBtn] = useState("bi bi-eye-fill inputIcon");
     const [passType, setPassType] = useState("password");
     const [passType2, setPassType2] = useState("password");
     const [user, setUser] = useState("");
     const [password, setPassword] = useState("");

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
                MySwal.fire({
                icon: 'success',
                title: 'Login Successful',
                showConfirmButton: false,
                timer: 1500
                });
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

    // Google Auth using Firebase
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const email = user.email;
            const uid = user.uid;
            //const displayName = user.displayName;
            let displayPic = user.photoURL;

            if (displayPic) {
                displayPic = displayPic.replace(/=s\d+-c$/, '=s1000-c');
            }
    
            console.log("Logged in user email:", email);
            console.log("Display Picture:", displayPic);
    
            // Check if email ends with "@tua.edu.ph"
            if (!email.endsWith("@tua.edu.ph")) {
                MySwal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: "Only users with a TUA email address are allowed.",
                confirmButtonColor: 'green'
                });
                {/*alert("Access denied: Only users with a TUA email address are allowed.");*/}
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
                body: JSON.stringify({ email, displayPic, uid }),
                credentials: "include", // Important for sending cookies/session ID
            });
    
            MySwal.fire({
                icon: 'success',
                title: 'Login Successful',
                showConfirmButton: false,
                timer: 1500
            });
            navigate("/home"); // Redirect to the home page after login
    
        } catch (error) {
            console.error("Error during Google login", error);
        }
    };


    //For forgot password
    const [otp, setOTP] = useState(""); //for OTP input
    const [sentStatus, setSentStatus] = useState(false);
    const [otpVerified, setOTPVerified] = useState(false);
    const [newPass, setNewPass] = useState(false);
    const [confirmPass, setConfirmPass] = useState(false);

    const handleNewUserPass = (event) => setNewPass(event.target.value);
    const handleConfirmUserPass = (event) => setConfirmPass(event.target.value);
    const handleOTPChange = (event) => setOTP(event.target.value);


    const handleForgotPass = (event) => {
        event.preventDefault();
        requestOTP();
    }

    const handleOTPSubmit = (event) => {
        event.preventDefault();
        fetch(`${ip}/tua_marketplace/verifyOTP.php`, {
            method: "POST",
            body: JSON.stringify({email: user, otp: otp})
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


    const handleRequestNewOTP = (event) => {
        event.preventDefault();
        requestOTP();
    }

    //request OTP Function common for handleRequestNewOTP and handleForgotPass
    const requestOTP = () => {
        fetch(`${ip}/tua_marketplace/generateOTP.php`, {
            method: "POST",
            body: JSON.stringify({email: user})
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
        fetch(`${ip}/tua_marketplace/resetPassword.php`, {
            method: "POST",
            body: JSON.stringify({email: user, newPass: newPass, confirmPass: confirmPass})
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
                    <img src="/tuamar.png" alt="TUA Logo" className="logInLogo" style={{display: adminLogIn === "none" && adminForgotPass === "none" && adminOTP === "none" && resetPass === "none" ? "flex" : "none"}}/>
                    <button className='adminLogIn' onClick={adminLogs} style={{display: adminLogIn === "none" && adminForgotPass === "none" && adminOTP === "none" && resetPass === "none" ? "flex" : "none"}}>
                        <img src="/tuamar.png" alt='TUA Logo' className='gLogo'/>
                        Login as Admin
                    </button>
                    <button className='googleLogIn' onClick={handleGoogleLogin} style={{display: adminLogIn === "none" && adminForgotPass === "none" && adminOTP === "none" && resetPass === "none" ? "flex" : "none"}}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png" alt='Google Logo' className='gLogo'/>
                        Continue with Google
                    </button>
                </div>
                <div className="logInContents_admin" style={{display: adminLogIn === "none" ? "none" : "flex"}}>
                    <div className="adminLogInHeader">
                        <img src="/tuamar.png" alt="TUA Logo" />
                        <h2>Admin Login</h2>
                    </div>
                    <form className="logInForm" onSubmit={handleLogIn}>
                        <div className="inputWrapper">
                            <i className="bi bi-person-fill inputIcon"></i>
                            <input
                                id="userName"
                                type="text"
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
                                id="userName"
                                type="text"
                                name="username"
                                placeholder="Email"
                                onChange={handleUserChange}
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
                                type="text"
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
                                id="logInPass"
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
                                id="logInPass"
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