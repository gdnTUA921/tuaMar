import { useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaChartBar, FaList,
  FaUserPlus, FaCog, FaUser, FaChevronLeft, FaChevronRight, FaEye
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./TuaMarAdmin.css";
import Reports from "./Reports.js";
import Listings from "./Listing.js";

export default function Admin() {
  const [active, setActive] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowdashboards] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showReports, setShowReports] = useState(false); // New state for Reports UI
  const [showListing, setShowlistings] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Users", icon: <FaUsers /> },
    { name: "Reports", icon: <FaChartBar /> },
    { name: "Listings", icon: <FaList /> },
    { name: "Registrations", icon: <FaUserPlus /> },
    { name: "Settings", icon: <FaCog /> }
  ];

  const handleMenuClick = (itemName) => {
    setActive(itemName);
    setShowSettings(itemName === "Settings");
    setShowdashboards(itemName === "Dashboard");
    setShowRegistration(itemName === "Registrations");
    setShowReports(itemName === "Reports"); // Handle Reports UI visibility
    setShowlistings(itemName === "Listings");
  };

  const navigate = useNavigate();

  const handleLogOut = () => {
    alert("Logging out..."); 
    navigate("/");
  }

  return (
    <div>
      <header className="header">
      <div className="logo">
                <img 
                src="/tuamar.png" 
                alt="TUA Logo" 
                />
        </div>
        <h1>TUA Marketplace</h1>
        <div className="brand-container"></div>
        <div className="admin-menu">
          <button className="admin-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <FaUser /> Admin
          </button>
          {dropdownOpen && (
            <div className="admin-dropdown">
              <button onClick={handleLogOut}>Log Out</button>
            </div>
          )}
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
                <h1>ACCOUNT SETTINGS</h1>
                <div className="settings-container">
                  <div className="settings-box">
                    <p><strong>Account Type:</strong> admin</p>
                    <p><strong>User ID:</strong> 1</p>
                    <p><strong>Email:</strong> tuamarketplace.support@gmail.com</p>
                    <hr />
                    <h3>Change Password:</h3>
                    <div className="password-field">
                      <label>Enter Old Password:</label>
                      <div className="input-group">
                        <input type="password" />
                        <FaEye className="eye-icon" />
                      </div>
                    </div>
                    <div className="password-field">
                      <label>Enter New Password:</label>
                      <div className="input-group">
                        <input type="password" />
                        <FaEye className="eye-icon" />
                      </div>
                    </div>
                    <div className="password-field">
                      <label>Confirm New Password:</label>
                      <div className="input-group">
                        <input type="password" />
                        <FaEye className="eye-icon" />
                      </div>
                    </div>
                    <button className="update-btn">UPDATE</button>
                  </div>
                </div>
              </div>
            ) : showDashboard ? (
              <div className="dashboard-container">
                <h1>Dashboard</h1>
                <div className="filter-container">
                  <label></label>
                  <select>
                    <option>Last 30 Days</option>
                    <option>Last 60 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <div className="stats-section">
                  <div className="stat-box">
                    <FaUsers className="stat-icon" />
                    <div>
                      <p className="stat-title">Total Users</p>
                      <p className="stat-number">5,067 (placeholder)</p>
                      <p className="stat-description">Registered users across all colleges</p>
                    </div>
                  </div>
                  <div className="stat-box">
                    <FaList className="stat-icon" />
                    <div>
                      <p className="stat-title">Total Items</p>
                      <p className="stat-number">600 (placeholder)</p>
                      <p className="stat-description">Listed items across all categories</p>
                    </div>
                  </div>
                </div>
                <div className="chart-container">
                  <h3>Users by College</h3>
                  <div className="chart-placeholder">[Graph Placeholder]</div>
                </div>
              </div>
            ) : showRegistration ? (
              <div className="registration-container">
                <h1>TUA Marketplace Registration</h1>
                <div className="actualreg-container">
                  <form className="registration-form">
                    <div className="form-row">
                      <label>Type of User</label>
                      <select>
                        <option>Student</option>
                        <option>Faculty</option>
                        <option>Staff</option>
                      </select>
                    </div>
                    <div className="form-row split-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" placeholder="First Name" />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" placeholder="Last Name" />
                      </div>
                    </div>
                    <div className="form-row">
                      <label>ID Number</label>
                      <input type="text" placeholder="ID Number" />
                    </div>
                    <div className="form-row">
                      <label>Department</label>
                      <select>
                        <option>CEIS</option>
                        <option>IBAM</option>
                        <option>CASE</option>
                        <option>SLCN</option>
                        <option>CMT</option>
                        <option>Others</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Email</label>
                      <input type="email" placeholder="Email" />
                    </div>
                    <div className="form-row">
                      <div className="alignsubbutton">
                        <button type="submit" className="submit-btn">SUBMIT</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
          ) : showReports ? (
            <Reports />
          ) : showListing ? (
            <Listings />
          ) : (
            <h2 className="heading">{active}</h2>
          )}
        </main>
      </div>
      </div>
  </div>
);
}
