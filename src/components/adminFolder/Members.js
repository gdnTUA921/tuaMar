import React, { useEffect, useState } from "react";
import "./Members.css"; // Don't forget the CSS!
import UserListingsPopup from "./UserListingsPopup.js";
import { database } from '../../firebaseConfig';
import { ref, onValue, push, set, get, update} from 'firebase/database';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function Members() {
  const ip = process.env.REACT_APP_LAPTOP_IP; // IP address (see env file for set up);
  const [activeTab, setActiveTab] = useState("All Users"); // State to manage active tab

  const MySwal = withReactContent(Swal); //for alerts
  
  // State to manage search term
  // This will be used to filter users based on their ID or name
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState([]); // State to hold the list of users
  const [userCounts, setUserCounts] = useState({}); // State to hold user counts

  const [selectedUserListings, setSelectedUserListings] = useState([]);
  const [showListingsPopup, setShowListingsPopup] = useState(false);

  const [editUser, setEditUser] = useState(null); // selected user to edit
  const [editedData, setEditedData] = useState({});


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

  const handleDeleteUser = async (user_id) => {
  const confirmDelete = window.confirm(`Are you sure you want to delete this user (ID: ${user_id})?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${ip}/tua_marketplace/deleteUser.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    });

    const result = await response.json();
    if (result.success) {
      alert("User deleted successfully.");
      setUsers((prev) => prev.filter((u) => u.id !== user_id));
    } else {
      alert("Failed to delete user: " + result.message);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("An error occurred while deleting the user.");
  }
};


  return (
    <div className="userscontainer">

      <div className="members-container">
        <h2>Users</h2>

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
            <p>Staff</p>
            <h3>{userCounts.Staff}</h3>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="tabs-search">
          <div className="tabs">
            {["Student", "Faculty", "Staff", "All Users"].map((tab) => (
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
        <div className="user-table-card">
          <div className="user-table-scroll-wrapper">
            <table className="user-table">
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
                  <td><button className="view-btn" 
                  onClick={() => {fetch(`${ip}/tua_marketplace/getmemberslistings.php?user_id=${user.id}`)
                  .then(res => res.json())
                  .then(data => {
                    setSelectedUserListings(data);
                    setShowListingsPopup(true);})
                  .catch(err => {
                    console.error("Error fetching user listings:", err);
                    setSelectedUserListings([]);
                    setShowListingsPopup(true);});}}>View Lists</button></td>
                  <td><button className="update-btn" onClick={() => {
                      fetch(`${ip}/tua_marketplace/updateuserdetails.php?user_id=${user.id}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.error) {
                            alert("Failed to load user: " + data.error);
                          } else {
                            setEditUser(data);
                            setEditedData({
                              user_id: data.id,
                              first_name: data.first_name,
                              last_name: data.last_name,
                              email: data.email,
                              id_number: data.id_number,
                              department: data.department,
                              user_type: data.type,
                            });
                          }
                        })
                        .catch((err) => {
                          console.error("Fetch failed:", err);
                          alert("Something went wrong while fetching user details.");
                        });
                    }}
                  >
                    Update
                  </button></td>
                  <td>
                  <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Remove</button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    

    {showListingsPopup && (
    <UserListingsPopup
      listings={selectedUserListings}
      onClose={() => setShowListingsPopup(false)}
    />
    )}

    {editUser && (
        <div className="popup-overlay" onClick={() => setEditUser(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>
            <form
              className="edit-user-form"
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  // 1. Update MySQL backend
                  const res = await fetch(`${ip}/tua_marketplace/updateUser.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      user_id: editUser.id,
                      first_name: editedData.first_name?.trim() || "",
                      last_name: editedData.last_name?.trim() || "",
                      email: editedData.email?.trim() || "",
                      id_number: editedData.id_number || "",
                      department: editedData.department?.trim() || "",
                      user_type: editedData.user_type?.trim() || "",
                    }),
                  });

                  const result = await res.json();

                  if (!result.success) {
                    alert("Update failed: " + result.message);
                    return;
                  }

                  // 2. Refresh user list
                  setEditUser(null);
                  const userRes = await fetch(`${ip}/tua_marketplace/fetchListUsers.php`);
                  const userData = await userRes.json();
                  if (Array.isArray(userData)) {
                    setUsers(userData);
                  }

                  // 3. Firebase update (optional — if item update needed for chatsList)
                  const originalFullName = `${editUser.first_name} ${editUser.last_name}`.trim();
                  const updatedFullName = `${editedData.first_name} ${editedData.last_name}`.trim();

                  const chatListRef = ref(database, 'chatsList');
                  const snapshot = await get(chatListRef);

                  if (snapshot.exists()) {
                    const updates = {};

                    snapshot.forEach(childSnapshot => {
                      const chatKey = childSnapshot.key;
                      const chatData = childSnapshot.val();

                      // Match by either seller name or buyer name (adjust as needed)
                        if (String(chatData.buyer_name) === String(originalFullName)){
                            updates[`/chatsList/${chatKey}/buyer_name`] = updatedFullName;
                        }
                        if (String(chatData.seller_name) === String(originalFullName)){
                            updates[`/chatsList/${chatKey}/seller_name`] = updatedFullName;
                        }
                    });

                    if (Object.keys(updates).length > 0) {
                      await update(ref(database), updates);
                    }
                  }

                  await MySwal.fire({
                    title: "UPDATED!",
                    text: "Changes have been saved successfully.",
                    icon: "success",
                    confirmButtonColor: "#547B3E",
                  });

                } catch (error) {
                  console.error("Update error:", error);
                  alert("An error occurred during update. Please try again.");
                }
              }}
            >
              <div className="form-row">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  value={editedData.first_name}
                  onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-row">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editedData.last_name}
                  onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-row">
                <label>Email:</label>
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  placeholder="Enter Email"
                />
              </div>

              <div>
                <label>ID Number: </label>
                <input
                  type="number"
                  value={editedData.id_number}
                  onChange={(e) => setEditedData({ ...editedData, id_number: e.target.value })}
                  placeholder="Enter ID number"
                />
              </div>

              <div className="form-row">
                <label>Department</label>
                <select
                  value={editedData.department || ""}
                  onChange={(e) => setEditedData({ ...editedData, department: e.target.value })}
                >
                  <option value="" disabled hidden>Select Department</option>
                  {["CASE", "CAHS", "CMT", "CEIS", "IBAM", "SLCN", "Others"].map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>User Type</label>
                <select
                  value={editedData.user_type || ""}
                  onChange={(e) => setEditedData({ ...editedData, user_type: e.target.value })}
                >
                  <option value="" disabled hidden>Select User Type</option>
                  {["Student", "Faculty", "Staff"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="update-btn">Save Changes</button>
                <button type="button" className="delete-btn" onClick={() => setEditUser(null)}>Cancel</button>
              </div>
            </form>

          </div>
        </div>
    )}


    </div>
    
  );
}