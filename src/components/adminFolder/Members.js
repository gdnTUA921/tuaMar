import React, { useState } from "react";
import "./Members.css"; // Don't forget the CSS!

export default function Members() {
  const [activeTab, setActiveTab] = useState("Faculty");
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: 1, name: "bisaya", type: "Student" },
    { id: 2, name: "al", type: "Student" },
    { id: 3, name: "123", type: "Faculty" },
    { id: 4, name: "d", type: "Faculty" },
    { id: 5, name: "yu", type: "NTP" },
    { id: 6, name: "User's Name", type: "NTP" },
  ];

  // Filtering users based on active tab and search term
  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "All Users" || user.type === activeTab;
    const matchesSearch = 
    user.id.toString().includes(searchTerm);
    user.name.toLowerCase().includes(searchTerm.toLowerCase());
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
            <h3>180</h3>
          </div>
          <div className="counter-card">
            <p>Faculty</p>
            <h3>180</h3>
          </div>
          <div className="counter-card">
            <p>NTP</p>
            <h3>180</h3>
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