import React, { useState, useEffect } from "react";
import "./Reports.css";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [popupContent, setPopupContent] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch("http://localhost/tua_marketplace/fetch_reports.php")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((r) => ({
          id: r.report_id,
          date: new Date(r.reported_at).toLocaleDateString(),
          type: r.report_reason,
          description: r.report_desc,
          status: r.status || "",
        }));
        setReports(formatted);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleStatusChange = (id, newStatus) => {
    const updatedReports = reports.map((report) =>
      report.id === id ? { ...report, status: newStatus } : report
    );
    setReports(updatedReports);
    setEditingId(null);

    fetch("http://localhost/tua_marketplace/update_report_status.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        report_id: id,
        status: newStatus,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Server response:", data);
        // ✅ Show confirmation
        alert(`Remarks updated to "${newStatus}"`);
      })
      .catch((err) => {
        console.error("Update failed:", err);
        alert("Failed to update remarks. Please try again.");
      });
  };


  const sortedReports = [...reports].sort((a, b) => {
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    if (sortBy === "type") return a.type.localeCompare(b.type);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

 const filteredReports = sortedReports.filter((report) =>
  report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
  report.id.toString().includes(searchTerm)
);


  return (
    <div className="reports-container">
      <h1>REPORTS MENU</h1>

      <div className="reports-header">
        <input
          type="text"
          placeholder="Search"
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label> SORT BY: </label>
        <select
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-dropdown"
        >
          <option value="">Select</option>
          <option value="date">Date</option>
          <option value="type">Type of Concern</option>
          <option value="status">Remarks</option>
        </select>
      </div>

      <div className="reports-content">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Date</th>
              <th>Type of Concern</th>
              <th>Details</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.date}</td>
                <td>{report.type}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => {
                      setPopupContent(report.description);
                      setShowPopup(true);
                    }}
                  >
                    VIEW
                  </button>
                </td>
                <td>
                  {editingId === report.id ? (
                    <select
                      value={report.status}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleStatusChange(report.id, e.target.value);
                      }}
                      onBlur={() => setEditingId(null)}
                    >
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="DISMISSED">DISMISSED</option>
                    </select>
                  ) : (
                    <span
                      className={`status ${report.status.toLowerCase()}`}
                      onClick={() => setEditingId(report.id)}
                    >
                      {report.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div
            className="popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="popup-close" onClick={() => setShowPopup(false)}>
              &times;
            </span>
            <h2>Report Details</h2>
            <p>{popupContent}</p>
            <button className="popup-button" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}