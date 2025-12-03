import React, { useEffect, useState } from "react";
import {
  FaUsers, FaChartBar, FaList,
  FaUserPlus, FaUser, FaChevronLeft, FaChevronRight, FaEye,
  FaEyeSlash, FaBan, FaArrowRightToBracket, FaClipboardQuestion
} from "react-icons/fa6";
import {FaArchive, FaOutdent} from "react-icons/fa";
import { FaTachometerAlt, FaCog } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "./TuaMarAdmin.css";
import Reports from "./Reports.js";
import Logs from "./Logs.js";
import Listings from "./Listing.js";
import Members from "./Members.js";
import PendingListing from "./PendingListing.js";
import ArchivedItems from "./ArchivedItems.js";
import Dashboard from "./Dashboard.js";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import BannedUsers from './BannedUsers.js'
import AdminRegistrations from "./AdminRegistrations.js";


export default function Admin() {

  //ip address of computer / server
  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)


  
  useEffect(() => {
    //Checking if logged in, if not redirected to log-in
    fetch(`${ip}/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.admin_id) {
          navigate("/login"); // Redirect to login if not authenticated
        }
        else {
          setAdminInfo(data); // Store admin info for later use
        }
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });
  }, [ip]);


  //alerts
  const MySwal = withReactContent(Swal);

  
  //to be used in case there are updates in data
  const [refresh, setRefresh] = useState(false);
  const [adminInfo, setAdminInfo] = useState([]);


  // for Sidebar
  const [active, setActive] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowdashboards] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showListing, setShowlistings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPendingListing, setShowPendingListings] = useState(false);
  const [showArchivedItems, setShowArchivedItems] = useState(false);
  const [showBannedUsers, setShowBannedUsers] = useState(false);
  const [showLogs, setShowLogs] = useState(false);


  const menuItems = [
  { name: "Dashboard", icon: <FaTachometerAlt /> },
  { name: "Registrations", icon: <FaUserPlus /> },
  { name: "Users", icon: <FaUsers /> },
  { name: "Reports", icon: <FaChartBar /> },
  { name: "Listings", icon: <FaList /> },
  { name: "Pending Listings", icon: <FaOutdent /> },
  { name: "Archived Items", icon: <FaArchive /> },
  { name: "Logs", icon: <FaClipboardQuestion /> },
  { name: "Banned Users", icon: <FaBan /> },
  { name: "Settings", icon: <FaCog /> }
];


  const handleMenuClick = (itemName) => {
    setActive(itemName);
    setShowSettings(itemName === "Settings");
    setShowdashboards(itemName === "Dashboard");
    setShowRegistration(itemName === "Registrations");
    setShowReports(itemName === "Reports");
    setShowlistings(itemName === "Listings");
    setShowMembers(itemName === "Users");
    setShowPendingListings(itemName === "Pending Listings");
    setShowArchivedItems(itemName === "Archived Items");
    setShowBannedUsers(itemName === "Banned Users");
    setShowLogs(itemName === "Logs");
    setRefresh(!refresh);
    // record UI navigation
    try { logActivity(`Opened panel: ${itemName}`); } catch (err) { /* if not yet initialized */ }
  };

  // Helper: record admin activity (tries server endpoint first; falls back to localStorage)
 async function logActivity(activity) {
  const datetime = new Date(); // for backend or formatting
  const entry = { 
    admin_id: adminInfo.admin_id || email || 'unknown', 
    activity, 
    ip_address: await getPublicIP() 
  };

  if (ip) {
    try {
      await fetch(`${ip}/recordAdminLog.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(entry)
      });
      return;
    } catch (err) {
      console.error('Server logging failed', err);
    }
  }

  // fallback: localStorage
  try {
    const raw = localStorage.getItem('adminLogs');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ...entry, datetime: datetime.toISOString() });
    localStorage.setItem('adminLogs', JSON.stringify(arr));
  } catch (err) {
    console.error('Failed to save admin log locally', err);
  }
}

async function getPublicIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) return (await res.json()).ip;
  } catch {}
  return '';
}


  //LOG OUT 
  const navigate = useNavigate();

  const handleLogOut = (event) => {
    event.preventDefault();

    // Record admin logout in audit log
    if (adminInfo?.admin_id && adminInfo?.email) {
        fetch(`${ip}/recordUnifiedAuditLog.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: adminInfo.admin_id,
                user_email: adminInfo.email,
                user_type: "admin",
                action: "LOGOUT",
                browser: navigator.userAgent
            }),
            credentials: "include"
        }).catch(err => console.error("Audit log error:", err));
    }

    fetch(`${ip}/logOut.php`, {
      credentials: "include", // This is important for cookies!
    })
    .then((response) => response.json())
    .then((data) => {
      MySwal.fire({
        icon: 'success',
        title: 'Log-Out Successful',
        showConfirmButton: false,
        timer: 1500
      }).then(async () => {
        await logActivity('Log-Out');
        navigate("/login");
      });
    })
    .catch((error) => console.error("Error fetching data:", error));
  }


  //For Register Page
  const [typeUser, setTypeUser] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleTypeUserChange = (event) => setTypeUser(event.target.value);
  const handleFirstNameChange = (event) => setFirstName(event.target.value);
  const handleLastNameChange = (event) => setLastName(event.target.value);
  const handleIdNumChange = (event) => setIdNumber(event.target.value);
  const handleDepartmentChange = (event) => setDepartment(event.target.value);
  const handleEmailChange = (event) => setEmail(event.target.value);


  const handleRegisterSubmit = (event) => {
    event.preventDefault();

    fetch(`${ip}/register_submit.php`, {
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify ({
        typeUser,
        firstName,
        lastName,
        idNumber,
        department,
        email, 
      }),
      credentials: 'include',
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == "Success"){
        MySwal.fire({
              title: "REGISTERED!",
              text: data.message,
              icon: "success",
              confirmButtonColor: "#547B3E",
          }).then(async (result) => {
              if (result.isConfirmed){
                try { await logActivity(`Registered user: ${email}`); } catch (err) { /* ignore */ }
                window.location.reload();
              }
          });
      }
      else {
        MySwal.fire({
              title: "FAILED!",
              html: "Failed to Register." + "<br>" + data.message,
              icon: "error",
              confirmButtonColor: "#547B3E",
          }).then((result) => {
              if (result.isConfirmed){
                //window stays the same
              }
          });
      }
    })
    .catch((error) => console.error("Error:", error));

  }

  //For Password Update
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const handlePasswordUpdate = () => {

      console.log(adminInfo.email);
      console.log(oldPassword);
      console.log(newPassword);

      if (newPassword !== confirmPassword) {
        Swal.fire("Error", "New passwords do not match", "error");
        return;
      }

      fetch(`${ip}/updateadminpassword.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: adminInfo.email,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.status === "success") {
            Swal.fire("Success", data.message, "success");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            try { await logActivity('Updated password'); } catch (err) { /* ignore */ }
          } else {
            Swal.fire("Error", data.message, "error");
          }
        })
        .catch((err) => {
          console.error("Error:", err);
          Swal.fire("Error", "Server error occurred", "error");
        });
    };






  return (
    <div>
      <header>
        <div className="logo">
                <img 
                src="/tuamar.png" 
                alt="TUA Logo" 
                />
        </div>
        <div className="menuBurger-admin" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>&#9776;</div>
        <h1 className="headerTitle">TUA Marketplace</h1>

        <div className="brand-container">
          <div className="admin-menu">
          <button className="admin-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <FaUser/>Admin
          </button>
          {dropdownOpen && (
            <div className="admin-dropdown">
              <button onClick={handleLogOut}><FaArrowRightToBracket />Log Out</button>
            </div>
          )}
        </div>
        </div>
      </header>

      <div className="admin-wrapper">
        <div className="container">
          <nav className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
              <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
              </button>
              {!sidebarCollapsed && <h1 className="title">Navigation</h1>}
            </div>

            <ul>
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  className={`menu-item ${active === item.name ? "active" : ""}`}
                  onClick={() => handleMenuClick(item.name)}
                >
                  {item.icon} {!sidebarCollapsed && <span>{item.name}</span>}
                </li>
              ))}
            </ul>
          </nav>

          <main className="content"> 
          {showSettings ? (
            <div className="backgroundsettingscontainer">
              <div className="settings-container">
                <h1>ADMIN SETTINGS</h1>
                <div className="settings-box">
                  <div className="email-display">
                    <p><strong>Email:</strong> {adminInfo.email || "Loading..."}</p>
                  </div>
                  
                  <div className="password-section">
                    <h3>Change Password</h3>
                    
                    <div className="password-field">
                      <label>Enter Old Password:</label>
                      <div className="input-group">
                        <input 
                          type = {!showOldPass? "password" : "text"}
                          placeholder="Enter Old Password" 
                          value={oldPassword} 
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <div className="eye-icon" onClick={() => {setShowOldPass(!showOldPass)}}>
                          {!showOldPass ? <FaEye/> : <FaEyeSlash/>}
                        </div>
                      </div>
                    </div>

                    <div className="password-field">
                      <label>Enter New Password:</label>
                      <div className="input-group">
                        <input 
                          type = {!showNewPass? "password" : "text"}
                          placeholder="Enter New Password" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className="eye-icon" onClick={() => {setShowNewPass(!showNewPass)}}>
                          {!showNewPass ? <FaEye/> : <FaEyeSlash/>}
                        </div>
                      </div>
                    </div>

                    <div className="password-field">
                      <label>Confirm New Password:</label>
                      <div className="input-group">
                        <input 
                          type = {!showConfirmPass? "password" : "text"}
                          placeholder="Confirm New Password" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <div className="eye-icon" onClick={() => {setShowConfirmPass(!showConfirmPass)}}>
                          {!showConfirmPass ? <FaEye/> : <FaEyeSlash/>}
                        </div>
                      </div>
                    </div>

                    <button className="update-btn" onClick={handlePasswordUpdate}>
                      UPDATE PASSWORD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : showDashboard ? (
              <Dashboard ip={ip} refresh={refresh} />
            ) : showRegistration ? <AdminRegistrations/> /*(
              <div className="registration-container">
                <h1>TUA Marketplace Registration</h1>
                <div className="actualreg-container">
                  <form className="registration-form" onSubmit={handleRegisterSubmit}>
                    <div className="form-row">
                      <label>Type of User</label>
                      <select onChange={handleTypeUserChange} required>
                        <option value="" disabled selected hidden>Select Type</option>
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </div>
                    <div className="form-row split-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" placeholder="First Name" onChange={handleFirstNameChange} required/>
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" placeholder="Last Name" onChange={handleLastNameChange} required/>
                      </div>
                    </div>
                    <div className="form-row">
                      <label>ID Number</label>
                      <input type="text" placeholder="ID Number" onChange={handleIdNumChange} required/>
                    </div>
                    <div className="form-row">
                      <label>Department</label>
                      <select onChange={handleDepartmentChange} required>
                        <option value="" disabled selected hidden>Select Department</option>
                        <option value="CASE">CASE</option>
                        <option value="CAHS">CAHS</option>
                        <option value="CMT">CMT</option>
                        <option value="CEIS">CEIS</option>
                        <option value="IBAM">IBAM</option>
                        <option value="SLCN">SLCN</option>
                        <option value="">Others</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Email</label>
                      <input type="email" placeholder="Email" onChange={handleEmailChange} required/>
                    </div>
                    <div className="form-row">
                      <div className="alignsubbutton">
                        <button type="submit" className="submit-btn">SUBMIT</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
          )*/ : 
          showReports ? (
            <Reports />
          ) : 
          showListing ? (
            <Listings />
          ) : 
          showMembers ? (
            <Members /> 
          ) :
          showPendingListing ? (
            <PendingListing /> 
          ) :
          showArchivedItems ? (
            <ArchivedItems/> 
          ) :
          showLogs ? (
            <Logs ip={ip} />
          ) :
          showBannedUsers ? (
            <BannedUsers/> 
          ) : (
            <h2 className="heading">{active}</h2>
          )}
        </main>
      </div>
      </div>
  </div>
);
}