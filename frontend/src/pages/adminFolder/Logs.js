import React, { useEffect, useState } from 'react';
import './TuaMarAdminLogs.css';

export default function Logs({ ip }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Try to fetch logs from backend; fallback to localStorage
  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      setLoading(true);
      // try backend endpoint
      try {
        if (ip) {
          const res = await fetch(`${ip}/fetchAdminLogs.php`, {
            method: 'GET',
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled && Array.isArray(data)) {
              setLogs(data);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        // ignore backend errors and fall through to local storage
      }

      // localStorage fallback
      try {
        const stored = localStorage.getItem('adminLogs');
        const parsed = stored ? JSON.parse(stored) : [];
        if (!cancelled) {
          setLogs(parsed);
          setLoading(false);
        }
      } catch (err) {
        setLogs([]);
        setLoading(false);
      }
    }

    loadLogs();
    return () => { cancelled = true; };
  }, [ip]);

  async function clearLogs() {
    if (window.confirm('Clear all admin logs from database? This cannot be undone.')) {
      try {
        const res = await fetch(`${ip}/clearAdminLogs.php`, {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();

        if (data.success) {
          setLogs([]);
          localStorage.removeItem('adminLogs');
          alert('Admin logs cleared successfully');
        } else {
          alert('Failed to clear logs: ' + (data.message || 'Unknown error'));
        }
      } catch (err) {
        alert('Error clearing logs: ' + err.message);
      }
    }
  }

  function exportCsv() {
    if (!logs || logs.length === 0) return;
    const header = ['DateTime', 'AdminId', 'Activity', 'IpAddress'];
    const rows = logs.map(l => [l.datetime, l.admin_id, l.activity, l.ip_address]);
    const csv = [header, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-logs.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="logs-container">
      <h1>Admin Logs</h1>
      <div className="logs-actions">
        <button className="export-btn" onClick={exportCsv} disabled={!logs || logs.length === 0}>Export CSV</button>
        <button className="clear-btn" onClick={clearLogs} disabled={!logs || logs.length === 0}>Clear Logs</button>
      </div>

      {loading ? (
        <div className="logs-empty">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="logs-empty">No logs available</div>
      ) : (
        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Admin ID</th>
                <th>Activity</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, idx) => (
                <tr key={idx}>
                  <td>{l.datetime}</td>
                  <td>{l.admin_id}</td>
                  <td>{l.activity}</td>
                  <td>{l.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}