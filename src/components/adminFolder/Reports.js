import React, { useState } from "react";
import "./Reports.css";

export default function Reports() {
  const initialReports = [
    { id: 1, date: "09/11/2025", type: "User", status: "Resolved" },
    { id: 2, date: "09/21/2025", type: "Listing", status: "Pending" },
    { id: 3, date: "10/30/2025", type: "User", status: "Dismissed" },
    { id: 4, date: "12/25/2025", type: "User", status: "Resolved" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [reports, setReports] = useState(initialReports);
  const [editingId, setEditingId] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    const updatedReports = reports.map((report) =>
      report.id === id ? { ...report, status: newStatus } : report
    );
    setReports(updatedReports);
    setEditingId(null); // Exit editing mode after selection
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    if (sortBy === "type") return a.type.localeCompare(b.type);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  const filteredReports = sortedReports.filter((report) =>
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
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
        <select onChange={(e) => setSortBy(e.target.value)} className="sort-dropdown">
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
                  <button className="view-btn">VIEW</button>
                </td>
                <td onClick={() => setEditingId(report.id)}>
                  {editingId === report.id ? (
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      onBlur={() => setEditingId(null)} // Exit editing mode if focus is lost
                    >
                      <option value="Resolved">Resolved</option>
                      <option value="Pending">Pending</option>
                      <option value="Dismissed">Dismissed</option>
                    </select>
                  ) : (
                    <span className={`status ${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
