import React, { useState, useEffect} from "react";
import "./Listing.css";
import "../MyProfile.css"; 

function MyProfile() {
  const [activeTab, setActiveTab] = useState("myListings");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);

  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)
  useEffect(() => {
  
    //fetching items posted in the marketplace
    fetch(`${ip}/tua_marketplace/itemlistingsadmin.php`)
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
  const [selectedItem, setSelectedItem] = useState(null); // for popup

  const handleViewDetails = (item) => {
    setSelectedItem(item);
  };

  const closePopup = () => {
    setSelectedItem(null);
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
                        <button className="listButton" onClick={() => handleDelete(item.item_id)}> DELETE LISTING </button>
                        <button className="listButton" onClick={() => handleViewDetails(item)}> VIEW DETAILS</button>
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

      {selectedItem && (
      <div className="popup-overlay" onClick={closePopup}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={closePopup}>
            &times;
          </button>

          <h3>Item Details</h3>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <img
              src={
                selectedItem.preview_pic ||
                (selectedItem.images?.[0] ?? "/default-image.jpg")
              }
              alt="Preview"
              onError={(e) => (e.target.src = "/default-image.jpg")}
              style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }}
            />
            <div>
              <strong>{selectedItem.item_name}</strong>
              <br />
              <span style={{ fontSize: "14px", color: "#666" }}>
                {selectedItem.category} • {selectedItem.item_condition}
              </span>
              <br />
              <span style={{ fontWeight: "bold", color: "#4CAF50" }}>
                ₱{selectedItem.price}
              </span>
            </div>
          </div>

          <p><strong>Status:</strong> {selectedItem.status}</p>
          <p><strong>Listed On:</strong> {new Date(selectedItem.listing_date).toLocaleString()}</p>
          <p><strong>Description:</strong><br />{selectedItem.description || "No description provided."}</p>

          {selectedItem.images?.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                padding: "10px 0",
              }}
            >
              {selectedItem.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`img-${i}`}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 6,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )}
</>
  );
}

export default MyProfile;