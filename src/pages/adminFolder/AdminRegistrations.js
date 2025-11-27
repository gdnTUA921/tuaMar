import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './AdminRegistrations.css';


const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const ip = process.env.REACT_APP_LAPTOP_IP;
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchRegistrations();
  }, [filter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ip}/getPendingRegistrations.php?status=${filter}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setRegistrations(data.registrations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId, email) => {
    MySwal.fire({
      title: 'Approve Registration?',
      html: `
        <p>This will approve the registration for:</p>
        <p><strong>${email}</strong></p>
        <p>The user will be able to login with their approved email.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#456a31'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${ip}/approveRegistration.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              registration_id: registrationId
            }),
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.success) {
            MySwal.fire({
              icon: 'success',
              title: 'Approved!',
              text: 'User registration approved successfully. User can now login.',
              confirmButtonColor: '#456a31'
            });
            fetchRegistrations();
          } else {
            MySwal.fire({
              icon: 'error',
              title: 'Error',
              text: data.message,
              confirmButtonColor: '#456a31'
            });
          }
        } catch (error) {
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to approve registration.',
            confirmButtonColor: '#456a31'
          });
        }
      }
    });
  };

  const handleReject = async (registrationId, email) => {
    MySwal.fire({
      title: 'Reject Registration?',
      html: `
        <p>You are about to reject the registration for:</p>
        <p><strong>${email}</strong></p>
        <textarea id="rejection-reason" class="swal2-textarea" placeholder="Enter reason for rejection (required)" required></textarea>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      preConfirm: () => {
        const reason = document.getElementById('rejection-reason').value;
        if (!reason) {
          Swal.showValidationMessage('Rejection reason is required');
          return false;
        }
        return { reason };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${ip}/rejectRegistration.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              registration_id: registrationId,
              reason: result.value.reason
            }),
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.success) {
            MySwal.fire({
              icon: 'info',
              title: 'Rejected',
              text: 'Registration has been rejected.',
              confirmButtonColor: '#456a31'
            });
            fetchRegistrations();
          } else {
            MySwal.fire({
              icon: 'error',
              title: 'Error',
              text: data.message,
              confirmButtonColor: '#456a31'
            });
          }
        } catch (error) {
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to reject registration.',
            confirmButtonColor: '#456a31'
          });
        }
      }
    });
  };

  if (loading) return <div className="loading">Loading registrations...</div>;

  return (
    <div className="admin-registrations">
      <div className="registrations-header">
        <h1>User Registrations</h1>
        <div className="filter-buttons">
          <button 
            className={filter === 'PENDING' ? 'active' : ''} 
            onClick={() => setFilter('PENDING')}
          >
            Pending
          </button>
          <button 
            className={filter === 'APPROVED' ? 'active' : ''} 
            onClick={() => setFilter('APPROVED')}
          >
            Approved
          </button>
          <button 
            className={filter === 'REJECTED' ? 'active' : ''} 
            onClick={() => setFilter('REJECTED')}
          >
            Rejected
          </button>
          <button 
            className={filter === 'ALL' ? 'active' : ''} 
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
        </div>
      </div>
      
      {registrations.length === 0 ? (
        <div className="no-registrations">
          <p>No {filter.toLowerCase()} registrations found.</p>
        </div>
      ) : (
        <div className="registrations-list">
          {registrations.map((reg) => (
            <div key={reg.registration_id} className="registration-card">
              <div className={`status-badge status-${reg.status.toLowerCase()}`}>
                {reg.status}
              </div>
              
              <div className="reg-info">
                <h3>{reg.first_name} {reg.last_name}</h3>
                <p><strong>Email:</strong> {reg.email}</p>
                <p><strong>Department:</strong> {reg.department}</p>
                <p><strong>School ID:</strong> {reg.school_id}</p>
                <p><strong>Submitted:</strong> {new Date(reg.created_at).toLocaleString()}</p>
                {reg.reviewed_at && (
                  <p><strong>Reviewed:</strong> {new Date(reg.reviewed_at).toLocaleString()}</p>
                )}
                {reg.rejection_reason && (
                  <p className="rejection-reason"><strong>Rejection Reason:</strong> {reg.rejection_reason}</p>
                )}
              </div>
              
              <div className="school-id-preview">
                <h4>School ID:</h4>
                <img src={reg.school_id_image} alt="School ID" />
              </div>
              
              {reg.status === 'PENDING' && (
                <div className="reg-actions">
                  <button 
                    className="approve-btn" 
                    onClick={() => handleApprove(reg.registration_id, reg.email)}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-btn" 
                    onClick={() => handleReject(reg.registration_id, reg.email)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;