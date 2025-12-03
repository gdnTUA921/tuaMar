import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import "./Reports.css";
import { display, flex } from "@mui/system";

const PrintableContent = React.forwardRef(({ report }, ref) => (
  <div ref={ref} className="print-layout" style={{ position: "fixed", zIndex: "-9999", left: "-30px" }}>
    <div className="print-logo">
      <img src="/tuamar.png" alt="TUA Logo" />
      <div className="print-logo-text">
        <h1>TUA Marketplace</h1>
        <p>275 E. Rodriguez Sr. Blvd., Cathedral Heights, Quezon City</p>
      </div>
    </div>

    <div className="print-header">
      <h1>Marketplace Report</h1>
    </div>

    <div className="print-info">
      <h3>Report Information:</h3>
      <p><strong>Report ID:</strong> {report.id}</p>
      <p><strong>Report Date:</strong> {report.date}</p>
      <p><strong>Report Type:</strong> {report.type}</p>
      {report.user && report.type === "User" && <p><strong>Reported User:</strong> {report.user}</p>}
      {report.item_name && report.type === "Item" && <p><strong>Listing Reported:</strong> {report.item_name}</p>}
      {report.type === "User" && <p><strong>Department:</strong> {report.department}</p>}
      <p><strong>Reported By:</strong> {report.reporter}</p>
    </div>

    <div className="print-description">
      <div className="print-description-reason">
        <p><strong>Report Reason:</strong></p>
        <p>{report.reason}</p>
      </div>
      <p><strong>Report Description:</strong></p>
      <p>{report.description}</p>

      <div className="print-images-section">
        <p><strong>Supporting Images:</strong></p>
        <div className="print-images-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0px' }}>
          {report.images && report.images.length > 0 ? (
            report.images.map((imgSrc, index) => (
              <img
                key={index}
                src={imgSrc}
                alt={`Report Image ${index + 1}`}
                className="print-image"
                style={{ width: 'auto', height: '90px', objectFit: 'cover', borderRadius: '6px' }}
              />
            ))
          ) : (
            <p>No images provided.</p>
          )}
        </div>
      </div>
    </div>

    <div className="print-report-status">
      <h3>Status:</h3>
      <h3 style={{ backgroundColor: report.status === "RESOLVED" ? "#4CAF50" : report.status === "DISMISSED" ? "#F44336" : "#FFEB3B", color: report.status != "PENDING" ? "white" : "black" }}>{report.status}</h3>
    </div>
  </div>
));


export default function Reports() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [popupContent, setPopupContent] = useState({});
  const [showPopup, setShowPopup] = useState(false);


  //New state for large image viewing modal
  const [showEnlargeImg, setShowEnlargeImg] = useState(false);
  const [enlargedImg, setEnlargeImg] = useState("");

  //close view modal popup
  const closeViewModalPopup = () => {
    setShowEnlargeImg(false);
    setEnlargeImg("");
  };


  const ip = process.env.REACT_APP_LAPTOP_IP; //ip address of computer or hosting machine


  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Report_${popupContent.id}`,
  });


  useEffect(() => {
    fetch(`${ip}/fetch_reports.php`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((r) => ({
          id: r.report_id,
          date: new Date(r.reported_at).toLocaleString(),
          user: r.reported_user,
          type: r.report_type.charAt(0).toUpperCase() + r.report_type.slice(1) || "",
          reason: r.report_reason,
          description: r.report_desc || "No description provided.",
          status: r.status || "",
          department: r.department || "N/A",
          item_name: r.item_name || "",
          reporter: r.reporter || "Unknown",
          images: JSON.parse(r.images || "[]"),
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

    fetch(`${ip}/update_report_status.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ report_id: id, status: newStatus }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        alert(`Remarks updated to "${newStatus}"`);
        // client-side log for visibility and reliability
        try { await import('../../utils/adminLogHelper').then(mod => mod.logAdminActivity(`Updated report ${id} status to ${newStatus}`)); } catch (err) { /* ignore */ }
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
        <label>SORT BY:</label>
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
                      setPopupContent(report);
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
                      onChange={(e) =>
                        handleStatusChange(report.id, e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="RESOLVED">RESOLVED</option>
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

      {/* Printable content always in DOM */}
      <PrintableContent ref={componentRef} report={popupContent} />

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
            <span className="popup-close" onClick={() => setShowPopup(false)}>
              &times;
            </span>
            <h2>Report Details</h2>

            <h3 style={{ marginTop: '35px' }}>Content Information</h3>
            <p><strong>Report ID:</strong> {popupContent.id}</p>
            <p><strong>Report Date:</strong> {popupContent.date}</p>
            <p><strong>Report Type:</strong> {popupContent.type}</p>
            {popupContent.user && popupContent.type === "User" && <p><strong>Reported User:</strong> {popupContent.user}</p>}
            {popupContent.item_name && popupContent.type === "Item" && <p><strong>Listing Reported:</strong> {popupContent.item_name}</p>}
            {popupContent.type === "User" && <p><strong>Department:</strong> {popupContent.department}</p>}
            <p><strong>Reported By:</strong> {popupContent.reporter}</p>

            <h3 style={{ marginTop: '50px' }}>Report Reason</h3>
            <p>{popupContent.reason}</p>

            <h3 style={{ marginTop: '40px' }}>Report Description</h3>
            <p>{popupContent.description}</p>

            <h3 style={{ marginTop: '40px' }}>Supporting Images</h3>
            <div className="popup-images">
              {popupContent.images && popupContent.images.length > 0 ? (
                popupContent.images.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Report Image ${index + 1}`}
                    className="popup-image"
                    onClick={() => { setShowEnlargeImg(true); setEnlargeImg(imgSrc) }}
                  />
                ))
              ) : (
                <p>No images provided.</p>
              )}
            </div>
            <br />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <button className="popup-button" onClick={handlePrint}>
                🖨️ Print
              </button>
              <button className="popup-button" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* View Image Modal */}
      {showEnlargeImg && (
        <div className="image-preview-overlay" onClick={() => { closeViewModalPopup(); }}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="image-preview-header">
              <h3></h3>
              <button className="close-preview-btn" onClick={() => { closeViewModalPopup(); }}>
                ×
              </button>
            </div>
            <div className="image-preview-content">
              <img src={enlargedImg || "/default-image.png"} alt="Preview" className="popup-preview-image" onError={(e) => (e.target.src = "/default-image.png")} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}