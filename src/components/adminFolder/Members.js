import React, { useEffect, useState } from "react";
import "./Members.css"; // Don't forget the CSS!

export default function Members() {
  const ip = process.env.REACT_APP_LAPTOP_IP; // IP address (see env file for set up);
  const [activeTab, setActiveTab] = useState("All Users"); // State to manage active tab
  
  // State to manage search term
  // This will be used to filter users based on their ID or name
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState([]); // State to hold the list of users
  const [userCounts, setUserCounts] = useState({}); // State to hold user counts


//Fetching list of users from the server
  useEffect(() => {
      fetch(`${ip}/tua_marketplace/fetchListUsers.php`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
              console.log('Fetched users:', data); // Log the fetched users
              if (Array.isArray(data)) {
                // Assuming data is an array of user objects
                setUsers(data);
              } else {
                console.error('Fetched data is not an array:', data);
                setUsers([]); // Fallback to an empty array if data is not as expected
              }
        })
        .catch((error) => {
          console.error("Error fetching list of users:", error);
        });
    }, [ip]);

    //Fetching user count for each type
    useEffect(() => {
      fetch(`${ip}/tua_marketplace/fetchUserCount.php`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Fetched user counts:', data);
          if (data && typeof data === "object" && !Array.isArray(data)) {
            setUserCounts(data); // Set it if it's a plain object
          } else {
            console.error('Unexpected user count data format:', data);
          }
        })
        .catch((error) => {
          console.error("Error fetching user counts:", error);
        });
    }, [ip]);



  // Filtering users based on active tab and search term
  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "All Users" || user.type === activeTab;
    const matchesSearch = 
    user.id.toString().includes(searchTerm) || user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="userscontainer">

      <div className="members-container">
        <h2>Members</h2>

        {/* Counter Cards */}
        <div className="counters">
          <div className="counter-card">
            <p>Student</p>
            <h3>{userCounts.Student}</h3>
          </div>
          <div className="counter-card">
            <p>Faculty</p>
            <h3>{userCounts.Faculty}</h3>
          </div>
          <div className="counter-card">
            <p>NTP</p>
            <h3>{userCounts.Staff}</h3>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="tabs-search">
          <div className="tabs">
            {["Student", "Faculty", "NTP", "All Users"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* User Table */}
        <div className="user-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>User ID</th>
                <th>Name</th>
                <th>Type of User</th>
                <th>Listings</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>👤</td>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.type}</td>
                  <td><button className="view-btn">View Lists</button></td>
                  <td><button className="update-btn">Update</button></td>
                  <td><button className="delete-btn">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}