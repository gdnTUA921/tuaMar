import React, { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaChartBar, FaList,
  FaUserPlus, FaCog, FaUser, FaChevronLeft, FaChevronRight, FaEye
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "./TuaMarAdmin.css";
import Reports from "./Reports.js";
import Listings from "./Listing.js";
import Members from "./Members.js";
import PendingListing from "./PendingListing.js";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import UsersByCollegeChart from './UsersByCollegeChart';
import ItemsByCategoryChart from './ItemsByCategoryChart';


export default function Admin() {

  //ip address of computer / server
  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)


  
  useEffect(() => {
    //Checking if logged in, if not redirected to log-in
    fetch(`${ip}/tua_marketplace/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.admin_id) {
          navigate("/"); // Redirect to login if not authenticated
        }
        else {
          setEmail(data.email);
        }
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });
  }, [ip]);


  //alerts
  const MySwal = withReactContent(Swal);


  // for Sidebar
  const [active, setActive] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowdashboards] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showReports, setShowReports] = useState(false); // New state for Reports UI
  const [showListing, setShowlistings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPendingListing, setShowPendingListings] = useState(false);

  const menuItems = [
  { name: "Dashboard", icon: <FaTachometerAlt /> },
  { name: "Registrations", icon: <FaUserPlus /> },
  { name: "Users", icon: <FaUsers /> },
  { name: "Reports", icon: <FaChartBar /> },
  { name: "Listings", icon: <FaList /> },
  { name: "PendingListings", icon: <FaList /> },
  { name: "Settings", icon: <FaCog /> }
];


  const handleMenuClick = (itemName) => {
    setActive(itemName);
    setShowSettings(itemName === "Settings");
    setShowdashboards(itemName === "Dashboard");
    setShowRegistration(itemName === "Registrations");
    setShowReports(itemName === "Reports"); // Handle Reports UI visibility
    setShowlistings(itemName === "Listings");
    setShowMembers(itemName === "Users");
    setShowPendingListings(itemName === "PendingListings");
    
  };


  //LOG OUT 
  const navigate = useNavigate();

  const handleLogOut = (event) => {
    event.preventDefault();

    fetch(`http://localhost/tua_marketplace/logOut.php`, {
      credentials: "include", // This is important for cookies!
    })
    .then((response) => response.json())
    .then((data) => {
      MySwal.fire({
        icon: 'success',
        title: 'Log-Out Successful',
        showConfirmButton: false,
        timer: 1500
      });
        navigate("/");
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

  const [collegeData, setCollegeData] = useState([]);
  const [itemCategoryData, setItemCategoryData] = useState([]);

  const handleTypeUserChange = (event) => setTypeUser(event.target.value);
  const handleFirstNameChange = (event) => setFirstName(event.target.value);
  const handleLastNameChange = (event) => setLastName(event.target.value);
  const handleIdNumChange = (event) => setIdNumber(event.target.value);
  const handleDepartmentChange = (event) => setDepartment(event.target.value);
  const handleEmailChange = (event) => setEmail(event.target.value);


  const handleRegisterSubmit = (event) => {
    event.preventDefault();

    fetch(`${ip}/tua_marketplace/register_submit.php`, {
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
          }).then((result) => {
              if (result.isConfirmed){
                window.location.reload();
              }
          });
      }
      else {
        MySwal.fire({
              title: "FAILED!",
              html: data.status + "<br>" + data.message,
              icon: "error",
              confirmButtonColor: "#547B3E",
          }).then((result) => {
              if (result.isConfirmed){
                window.location.reload();
              }
          });
      }
    })
    .catch((error) => console.error("Error:", error));

  }


    const handlePasswordUpdate = () => {
      if (newPassword !== confirmPassword) {
        Swal.fire("Error", "New passwords do not match", "error");
        return;
      }

      fetch(`${ip}/tua_marketplace/updateadminpassword.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            Swal.fire("Success", data.message, "success");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } else {
            Swal.fire("Error", data.message, "error");
          }
        })
        .catch((err) => {
          console.error("Error:", err);
          Swal.fire("Error", "Server error occurred", "error");
        });
    };


  //fetch total number of users and total items
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetch(`${ip}/tua_marketplace/fetchTotalUsers.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setTotalUsers(data.total_users);
        } else {
          console.error("Error fetching total users:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching total users:", error);
      });

    fetch(`${ip}/tua_marketplace/fetchTotalItems.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setTotalItems(data.total_items);
        } else {
          console.error("Error fetching total items:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching total items:", error);
      });
  }, [ip]);

  useEffect(() => {
    fetch(`${ip}/tua_marketplace/getCollegeStats.php`)
      .then(res => res.json())
      .then(data => setCollegeData(data))
      .catch(err => console.error('Failed to fetch college data:', err));
  }, []);

  useEffect(() => {
  fetch(`${ip}/tua_marketplace/getItemCategoryStats.php`)
    .then(res => res.json())
    .then(data => setItemCategoryData(data))
    .catch(err => console.error('Failed to fetch item category data:', err));
  }, []);


  return (
    <div>
      <header>
        <div className="logo">
                <img 
                src="/tuamar.png" 
                alt="TUA Logo" 
                />
        </div>
        <h1 className="headerTitle">TUA Marketplace</h1>

        <div className="brand-container">
          <div className="admin-menu">
          <button className="admin-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <FaUser/>Admin
          </button>
          {dropdownOpen && (
            <div className="admin-dropdown">
              <button onClick={handleLogOut}>Log Out</button>
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
                    <p><strong>Email:</strong> {email || "Loading..."}</p>
                    <h3>Change Password:</h3>
                    <div className="password-field">
                      <label>Enter Old Password:</label>
                      <div className="input-group">
                        <input type="password" placeholder="Enter Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}/>
                      </div>
                    </div>
                    <div className="password-field">
                      <label>Enter New Password:</label>
                      <div className="input-group">
                        <input type="password" placeholder="Enter New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                      </div>
                    </div>
                    <div className="password-field">
                      <label>Confirm New Password:</label>
                      <div className="input-group">
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                    </div>
                    <button className="update-btn" onClick={handlePasswordUpdate}>UPDATE</button>
                  </div>
                </div>
              </div>
            ) : showDashboard ? (
              <div className="dashboard-container">
                <h1>Dashboard</h1>
                <div className="filter-container">
                  <label></label>
                </div>
                <div className="stats-section">
                  <div className="stat-box">
                    <FaUsers className="stat-icon" />
                    <div>
                      <p className="stat-title">Total Users</p>
                      <p className="stat-number">{totalUsers}</p>
                      <p className="stat-description">Registered users across all colleges</p>
                    </div>
                  </div>
                  <div className="stat-box">
                    <FaList className="stat-icon" />
                    <div>
                      <p className="stat-title">Total Items</p>
                      <p className="stat-number">{totalItems}</p>
                      <p className="stat-description">Listed items across all categories</p>
                    </div>
                  </div>
                </div>
                <div className="chart-container">
                  <h3>Users by College</h3>
                  <UsersByCollegeChart data={collegeData} />
                  <h3>Items by Category</h3>
                  <ItemsByCategoryChart data={itemCategoryData} />
                </div>
              </div>
            ) : showRegistration ? (
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
          ) : 
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
          ) : (
            <h2 className="heading">{active}</h2>
          )}
        </main>
      </div>
      </div>
  </div>
);
}