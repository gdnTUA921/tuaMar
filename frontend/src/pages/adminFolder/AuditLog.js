import React, { useEffect, useState } from "react";
import { FaArrowRightToBracket, FaArrowRightFromBracket, FaArrowsRotate, FaDownload } from "react-icons/fa6";
import { exportToCSV, exportToPDF, formatDateForExport } from '../../utils/exportHelpers';

export default function AuditLog({ ip }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [userTypeFilter, setUserTypeFilter] = useState(null); // null = all, 'admin', 'user'
  const itemsPerPage = 20;

  useEffect(() => {
    fetchAuditLogs();
  }, [ip, currentPage, userTypeFilter]);

  const fetchAuditLogs = () => {
    setLoading(true);
    const offset = (currentPage - 1) * itemsPerPage;
    let url = `${ip}/fetchUnifiedAuditLogs.php?limit=${itemsPerPage}&offset=${offset}`;

    if (userTypeFilter) {
      url += `&user_type=${userTypeFilter}`;
    }

    fetch(url, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setLogs(data.logs);
          setTotal(data.total);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching audit logs:", error);
        setLoading(false);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = logs.map(log => ({
      'User ID': log.user_id,
      'Email': log.user_email,
      'User Type': log.user_type?.toUpperCase() || 'N/A',
      'Action': log.action,
      'Login Time': formatDateForExport(log.login_datetime),
      'Logout Time': log.logout_datetime ? formatDateForExport(log.logout_datetime) : 'Active',
      'Duration': formatDuration(log.session_duration),
      'IP Address': log.ip_address || 'N/A',
      'Browser': log.browser || 'N/A'
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filterSuffix = userTypeFilter ? `-${userTypeFilter}` : '';
    exportToCSV(exportData, `audit-logs${filterSuffix}-${timestamp}.csv`);
  };

  const handleExportPDF = () => {
    if (logs.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = logs.map(log => ({
      'Email': log.user_email,
      'Type': log.user_type?.toUpperCase() || 'N/A',
      'Action': log.action,
      'Login Time': formatDateForExport(log.login_datetime),
      'Logout Time': log.logout_datetime ? formatDateForExport(log.logout_datetime) : 'Active',
      'Duration': formatDuration(log.session_duration)
    }));

    const filterTitle = userTypeFilter ? ` (${userTypeFilter.charAt(0).toUpperCase() + userTypeFilter.slice(1)} Only)` : '';
    exportToPDF(
      `Audit Logs${filterTitle}`,
      ['Email', 'Type', 'Action', 'Login Time', 'Logout Time', 'Duration'],
      exportData,
      'audit-logs.pdf'
    );
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="audit-log-container">
      <div className="audit-header">
        <h2>Audit Log</h2>
        <div className="audit-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${userTypeFilter === null ? 'active' : ''}`}
              onClick={() => { setUserTypeFilter(null); setCurrentPage(1); }}
            >
              All Logs
            </button>
            <button
              className={`filter-btn ${userTypeFilter === 'admin' ? 'active' : ''}`}
              onClick={() => { setUserTypeFilter('admin'); setCurrentPage(1); }}
            >
              Admin Logs
            </button>
            <button
              className={`filter-btn ${userTypeFilter === 'user' ? 'active' : ''}`}
              onClick={() => { setUserTypeFilter('user'); setCurrentPage(1); }}
            >
              User Logs
            </button>
          </div>
          <div className="action-buttons">
            <button className="refresh-btn" onClick={fetchAuditLogs} disabled={loading}>
              <FaArrowsRotate /> Refresh
            </button>
            <button className="export-btn" onClick={handleExportCSV}>
              <FaDownload /> CSV
            </button>
            <button className="export-btn" onClick={handleExportPDF}>
              <FaDownload /> PDF
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="no-data">No audit logs found</div>
      ) : (
        <>
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Action</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>Duration</th>
                  <th>IP Address</th>
                  <th>Browser</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.audit_id}>
                    <td>
                      <strong>{log.user_email}</strong>
                      <br />
                      <small>ID: {log.user_id}</small>
                    </td>
                    <td>
                      <span className={`user-type-badge ${log.user_type}`}>
                        {log.user_type?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {log.action === "LOGIN" ? (
                        <span className="action-badge login">
                          <FaArrowRightToBracket /> LOGIN
                        </span>
                      ) : (
                        <span className="action-badge logout">
                          <FaArrowRightFromBracket /> LOGOUT
                        </span>
                      )}
                    </td>
                    <td>{formatDate(log.login_datetime)}</td>
                    <td>{log.logout_datetime ? formatDate(log.logout_datetime) : "Active"}</td>
                    <td>{formatDuration(log.session_duration)}</td>
                    <td>
                      <code>{log.ip_address || "N/A"}</code>
                    </td>
                    <td>
                      <small title={log.browser}>{log.browser?.substring(0, 50)}...</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages} (Total: {total} logs)
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
