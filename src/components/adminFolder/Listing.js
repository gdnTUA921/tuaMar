import React, { useState, useEffect} from "react";
import "./Listing.css";

function MyProfile() {
  const [activeTab, setActiveTab] = useState("myListings");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);

  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)
  useEffect(() => {
  
    //fetching items posted in the marketplace
    fetch(`${ip}/tua_marketplace/browseItems.php`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data); // Log the data to see the structure
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error('Fetched data is not an array:', data);
          setItems([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setItems([]); // Fallback to an empty array
      });
    }, []);

  // Filter items based on search input
  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

const handleDelete = async (itemId) => {
  const confirmDelete = window.confirm(
    `Do you really want to delete this listing (ID: ${itemId})?`
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${ip}/tua_marketplace/deleteItem.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item_id: itemId }),
    });

    const text = await response.text();  // Read raw response as text
    console.log('Raw response:', text);

    const result = JSON.parse(text);      // Parse manually so we can catch errors

    if (result.success) {
      alert("Listing deleted successfully.");
      setItems((prevItems) => prevItems.filter((item) => item.item_id !== itemId));
    } else {
      alert("Failed to delete listing: " + result.message);
    }
  } catch (error) {
    console.error("Error deleting listing:", error);
    alert("An error occurred while deleting the listing.");
  }
};



  return (
    <>
    <div className="admin-listing-wrapper">
      <main>
        <div className="profile-container">

          {/* Listings Tab */}
          <div className="myListings" style={{ display: activeTab === "myListings" ? "block" : "none", overflow: "scroll"}}>
            <div className="listingCard">
              <h2>Listings</h2>
              <div className="search-container">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                />
              </div>

              <div className="items">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div className="itemCard" key={item.id}>
                      <img
                        src={item.preview_pic}
                        style={{
                          width: "180px",
                          height: "180px",
                          border: "3px solid green",
                          borderRadius: "12px",
                          alignItems: "center",
                        }}
                        alt="Item"
                      />
                      <div className="itemDeets">
                        <div className="itemTitle">
                          <h3>{item.item_name}</h3>
                        </div>
                        <p>&#8369;{item.price}</p>
                        <i className="bi bi-heart-fill heart"></i>
                        <p><b>0</b></p>
                        <p>&#x2022; {item.item_condition}</p>
                        <button className="editListButton" onClick={() => handleDelete(item.item_id)}> DELETE LISTING </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No items found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
    </main>
    </div>
</>
  );
}

export default MyProfile;