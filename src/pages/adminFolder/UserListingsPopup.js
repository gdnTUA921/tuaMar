import React, { useState } from "react";
import "./UserListingsPopup.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function UserListingsPopup({ listings, onClose }) {
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [currentListings, setCurrentListings] = useState(listings);
  const [items, setItems] = useState([]);
  const MySwal = withReactContent(Swal); // For Alert

  const ip = process.env.REACT_APP_LAPTOP_IP;
  const first = listings[0];
  

  const handleDelete = async (itemId) => {
    const confirmResult = await MySwal.fire({
      title: `Delete this listing (ID: ${itemId})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: "#547B3E",
      cancelButtonColor: "#d33",
    });

    if (!confirmResult.isConfirmed) return;
    const { value: reason } = await MySwal.fire({
      title: 'Reason for deletion',
      input: 'text',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value.trim()) return 'You must provide a reason!';
      }
    });

    if (!reason) return; // cancelled or blank

    try {
      const res = await fetch(`${ip}/tua_marketplace/deleteItem.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, reason: reason.trim() }),
      });

      const result = await res.json();

      if (result.success) {
        await MySwal.fire({
          icon: 'success',
          title: 'Deleted',
          showConfirmButton: false,
          timer: 1500,
        });

        setItems((prev) => prev.filter((i) => i.item_id !== itemId));
      } else {
        await MySwal.fire({
          icon: 'error',
          title: 'Failed to delete listing',
          text: result.message || 'Unknown error occurred.',
        });
      }
    } catch (e) {
      await MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while deleting the listing.',
      });
    }
  };

  const filteredListings = currentListings.filter((item) => {
    const categoryMatch = filterCategory === "All" || item.category === filterCategory;
    const statusMatch = filterStatus === "All" || item.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const categories = Array.from(new Set(listings.map(item => item.category)));
  const statuses = Array.from(new Set(listings.map(item => item.status)));

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h3>User Listings</h3>
        {first && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <img
              src={first.profile_pic || "/tuamar-profile-icon.jpg"} 
              onError={(e) => (e.target.src = "/tuamar-profile-icon.jpg")}
              alt="Profile"
              style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 10, padding: 0}}
            />
            <span style={{ fontWeight: 'bold' }}>
              {first.first_name} {first.last_name}
            </span>
          </div>
        )}

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            {statuses.map((stat, i) => (
              <option key={i} value={stat}>{stat}</option>
            ))}
          </select>
        </div>

        {filteredListings.length === 0 ? (
          <p>No listings match your filters.</p>
        ) : (
          <ul className="listings-list">
            {filteredListings.map((item, index) => (
              <li key={index} className="listing-item" onClick={() => toggleExpand(index)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={item.images[0] || "/default-image.png"}
                    onError={(e) => (e.target.src = "/default-image.png")}
                    alt="Item"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, padding: 0}}
                  />
                  <div>
                    <strong>{item.item_name}</strong><br />
                    <small>{item.category} • {item.item_condition}</small><br />
                    <span style={{ fontWeight: 'bold', color: '#547B3E' }}>₱{item.price}</span>
                  </div>
                </div>
                {expandedIndex === index && (
                  <div style={{ marginTop: '10px', paddingLeft: '70px', fontSize: '0.9rem' }}>
                    <p><strong>Status:</strong> {item.status}</p>
                    <p><strong>Listed On:</strong> {new Date(item.listing_date).toLocaleString()}</p>
                    <p><strong>Description:</strong><br />{item.description}</p>

                    {/* Scrollable Image Preview */}
                    {item.images?.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        overflowX: 'auto',
                        padding: '10px 0'
                      }}>
                        {item.images.map((img, i) => (
                          <img
                            key={i}
                            src={img || "/default-image.png"}
                            onError={(e) => (e.target.src = "/default-image.png")}
                            alt={`preview-${i}`}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 6,
                              flexShrink: 0, 
                              padding: 0
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <button
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.item_id);
                      }}
                    >
                      Delete Listing
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
