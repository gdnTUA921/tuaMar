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

  const [refresh, setRefresh] = useState(false);

  // Hook to track screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //Fetching list of users from the server
  useEffect(() => {
      fetch(`${ip}/fetchListUsers.php`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
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
    }, [ip, refresh]);

    //Fetching user count for each type
    useEffect(() => {
      fetch(`${ip}/fetchUserCount.php`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && typeof data === "object" && !Array.isArray(data)) {
            setUserCounts(data); // Set it if it's a plain object
          } else {
            console.error('Unexpected user count data format:', data);
          }
        })
        .catch((error) => {
          console.error("Error fetching user counts:", error);
        });
    }, [ip, refresh]);

  // Filtering users based on active tab and search term
  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "All Users" || user.type === activeTab;
    const matchesSearch = 
    user.id.toString().includes(searchTerm) || user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleViewListings = (user) => {
    fetch(`${ip}/getmemberslistings.php?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedUserListings(data);
        setShowListingsPopup(true);
      })
      .catch(err => {
        console.error("Error fetching user listings:", err);
        setSelectedUserListings([]);
        setShowListingsPopup(true);
      });
  };

  const handleUpdateUser = (user) => {
    fetch(`${ip}/updateuserdetails.php?user_id=${user.id}`)
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
  };

  const handleDeleteUser = async (user_id) => {
    MySwal.fire({
      title: `Remove User ID: ${user_id}?`,
      text: `Are you sure you want to delete this user (ID: ${user_id})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#547B3E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then(async (result) => {

      if (result.isConfirmed) {
        try {
          const response = await fetch(`${ip}/deleteUser.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id }),
          });

          const result = await response.json();
          if (result.success) {
            MySwal.fire({
              title: `User Deleted Successfully`,
              icon: "success",
              confirmButtonColor: "#547B3E",
              confirmButtonText: "OK"
            })
            setUsers((prev) => prev.filter((u) => u.id !== user_id));
            setRefresh(!refresh);
          } else {
            MySwal.fire({
              title: `Failed to Delete User`,
              text: "Failed to delete user: " + result.message,
              icon: "error",
              confirmButtonColor: "#547B3E",
              confirmButtonText: "OK"
            })
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          alert("An error occurred while deleting the user.");
        }
      }
      else{
        return;
      }
    })
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Update MySQL backend
      const res = await fetch(`${ip}/updateUser.php`, {
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
      const userRes = await fetch(`${ip}/fetchListUsers.php`);
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
  };

  const renderMobileUserCard = (user) => (
    <div key={user.id} className="mobile-user-card">
      <div className="user-info">
        <div className="user-avatar">👤</div>
        <div className="user-details">
          <h4>{user.name}</h4>
          <p>ID: {user.id}</p>
        </div>
      </div>
      <div className="user-meta">
        <span>Type: {user.type}</span>
      </div>
      <div className="user-actions">
        <button className="view-btn" onClick={() => handleViewListings(user)}>
          View Lists
        </button>
        <button className="user-update-btn" onClick={() => handleUpdateUser(user)}>
          Update
        </button>
        <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>
          Remove
        </button>
      </div>
    </div>
  );

  const renderDesktopTable = () => (
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
              <td>
                <button className="view-btn" onClick={() => handleViewListings(user)}>
                  View Lists
                </button>
              </td>
              <td>
                <button className="user-update-btn" onClick={() => handleUpdateUser(user)}>
                  Update
                </button>
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="userscontainer">
      <div className="members-container">
        <h2>Users</h2>

        {/* Counter Cards */}
        <div className="counters">
          <div className="counter-card">
            <p>Student</p>
            <h3>{userCounts.Student || 0}</h3>
          </div>
          <div className="counter-card">
            <p>Faculty</p>
            <h3>{userCounts.Faculty || 0}</h3>
          </div>
          <div className="counter-card">
            <p>Staff</p>
            <h3>{userCounts.Staff || 0}</h3>
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
          <div className="search-bar-members">
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* User Table/Cards */}
        <div className="user-table-card">
          {/* Desktop Table */}
          {renderDesktopTable()}

          {/* Mobile Cards */}
          {isMobile && (
            <div className="mobile-users-container">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(renderMobileUserCard)
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No users found matching your search criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Listings Popup */}
      {showListingsPopup && (
        <UserListingsPopup
          listings={selectedUserListings}
          onClose={() => setShowListingsPopup(false)}
        />
      )}

      {/* Edit User Popup */}
      {editUser && (
        <div className="popup-overlay" onClick={() => setEditUser(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>
            <form className="edit-user-form" onSubmit={handleFormSubmit}>
              <div className="form-row">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  value={editedData.first_name || ''}
                  onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-row">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editedData.last_name || ''}
                  onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  value={editedData.email || ''}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  placeholder="Enter Email"
                />
              </div>

              <div className="form-row">
                <label>ID Number</label>
                <input
                  type="number"
                  value={editedData.id_number || ''}
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
                  <option value="" disabled>Select Department</option>
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
                  <option value="" disabled>Select User Type</option>
                  {["Student", "Faculty", "Staff"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="user-update-btn">Save Changes</button>
                <button type="button" className="delete-btn" onClick={() => setEditUser(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}