import React, { useState, useEffect } from "react";
import "./Listing.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function ArchivedItems() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // for popup

  const ip = process.env.REACT_APP_LAPTOP_IP;

  const MySwal = withReactContent(Swal); // For Alert

  const [numLikes, setNumLikes] = useState([]);

  useEffect(() => {
      const fetchData = async () => {
        try {
          // Fetch item listings
          const itemRes = await fetch(`${ip}/fetchArchivedItems.php`);
          const itemData = await itemRes.json();
  
          if (Array.isArray(itemData)) {
            setItems(itemData);
          } else {
            console.error('Fetched data is not an array:', itemData);
            setItems([]);
          }
  
          // Fetch like count (add handling logic as needed)
          const likeCountRes = await fetch(`${ip}/fetchLikeCount.php`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ myListings: itemData }),
          });
  
          const likeCounts = await likeCountRes.json();
          setNumLikes(likeCounts);
  
        } catch (error) {
          console.error("Error fetching data:", error);
          setItems([]);
        }
      };
  
      fetchData(); // Call the async function
  }, [ip]); // Include `ip` in dependencies if it’s a dynamic variable


  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //For restoring items
  const handleRestore = async (itemId) => {
    const confirmRestore = await MySwal.fire({
      title: `Restore this item?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, restore it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: "#547B3E",
      cancelButtonColor: "#d33",
    });

    if (!confirmRestore.isConfirmed) return;

    try {
      const res = await fetch(`${ip}/restoreItem.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });

      const result = await res.json();

      if (result.success) {
        await MySwal.fire({
          icon: 'success',
          title: 'Item restored',
          timer: 1500,
          showConfirmButton: false,
        });

        setItems((prev) => prev.filter((item) => item.item_id !== itemId));
        setSelectedItem(null);
      } else {
        await MySwal.fire({
          icon: 'error',
          title: 'Failed to restore',
          text: result.message || "Unknown error",
        });
      }
    } catch (e) {
      console.error("Restore error:", e);
      await MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to communicate with the server.',
      });
    }
  };

  //For deleting items permanently
    const handleDelete = async (itemId) => {
    const confirmRestore = await MySwal.fire({
      title: `Delete this item permanently?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: "#547B3E",
      cancelButtonColor: "#d33",
    });

    if (!confirmRestore.isConfirmed) return;

    try {
      const res = await fetch(`${ip}/permDeleteItem.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
        credentials: 'include',
      });

      const result = await res.json();

      if (result.success) {
        await MySwal.fire({
          icon: 'success',
          title: 'Item Deleted Permanently',
          timer: 1500,
          showConfirmButton: false,
        });

        setItems((prev) => prev.filter((item) => item.item_id !== itemId));
        setSelectedItem(null);
      } else {
        await MySwal.fire({
          icon: 'error',
          title: 'Failed to delete',
          text: result.message || "Unknown error",
        });
      }
    } catch (e) {
      console.error("Deletion error:", e);
      await MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to communicate with the server.',
      });
    }
  };

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
            <div
              className="myListings"
              style={{
                overflow: "scroll",
              }}
            >
              <div className="listingCard">
                <h2>Archived Items</h2>
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
                      <div className="itemCard" key={item.item_id}>
                        <div className="soldBanner" style={{display: item.status === "SOLD" ? "block" : "none"}}> {/*set this up if item is considered SOLD*/}
                          SOLD
                        </div>
                        <div className="reservedBanner" style={{display: item.status === "RESERVED" ? "block" : "none"}}> {/*set this up if item is considered RESERVED*/}
                          RESERVED
                        </div>
                        <div className="reviewBanner" style={{display: item.status === "IN REVIEW" ? "block" : "none"}}> {/*set this up if item is considered UNDER REVIEW*/}
                          IN REVIEW
                        </div>
                        <img
                          src={item.preview_pic || '/default-image.png'}
                          onError={(e) => (e.target.src = '/default-image.png')}
                          style={{
                            width: "180px",
                            height: "180px",
                            border: "3px solid green",
                            borderRadius: "12px",
                            alignItems: "center",
                            objectFit: "cover",
                          }}
                          alt="Item"
                        />
                        <div className="itemDeets">
                          <div className="itemTitle">
                            <h3>{item.item_name}</h3>
                          </div>

                          <i className="bi bi-heart-fill heart1"></i>
                          <p className="heartCount1">{numLikes[item.item_id]}</p>
                          
                          <div className="price-condition">
                            <p></p>
                            <p>&#8369;{item.price}</p>
                            <p>&#x2022; {item.item_condition}</p>
                          </div>
                          <button className="listButton" onClick={() => handleViewDetails(item)}>VIEW DETAILS</button>
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

      {/* Popup Component */}
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
                (selectedItem.images?.[0] ?? '/default-image.png')
              }
              alt="Preview"
              onError={(e) => (e.target.src = '/default-image.png')}
              style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover", padding: 0}}
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
          <p><strong>Reason:</strong><br />{selectedItem.reason || "No reason provided."}</p>

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
                  src={img || '/default-image.png'}
                  onError={(e) => (e.target.src = '/default-image.png')}
                  alt={`img-${i}`}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 6,
                    flexShrink: 0,
                    padding: 0
                  }}
                />
              ))}
            </div>
          )}
          <p><strong>Listed By:</strong></p>
          <div className="itemSeller">
            <img 
              src={selectedItem.profile_pic || "/tuamar-profile-icon.jpg"} 
              alt="Seller" 
              onError={(e) => (e.target.src = "/tuamar-profile-icon.jpg")}
            />
            <p>{selectedItem.first_name + " " + selectedItem.last_name}</p>
          </div>
          <br/>
          <button className="listButton" onClick={() => handleRestore(selectedItem.item_id)}>RESTORE ITEM</button>
          <button className="listButton" style={{backgroundColor: "#F44336"}} onClick={() => handleDelete(selectedItem.item_id)}>DELETE ITEM</button>
        </div>
      </div>
    )}
    </>
  );
}

export default ArchivedItems;