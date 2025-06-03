import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminPanel.css";

function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://alp-rjd5.onrender.com/api/admin");
        if (isMounted) {
          setRequests(response.data);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`https://alp-rjd5.onrender.com/api/admin/approve/${id}`, {});
      setRequests(requests.filter((req) => req._id !== id));
      alert("Therapist Approved!");
    } catch (error) {
      console.error("Error approving therapist:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`https://alp-rjd5.onrender.com/api/admin/reject/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
      alert("Therapist Rejected!");
    } catch (error) {
      console.error("Error rejecting therapist:", error);
    }
  };
  return (
    <div className="admin-panel-container dark-theme">
      <h2 className="admin-panel-title">Admin Panel - Pending Therapists</h2>
      <div className="admin-panel-content">
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="no-requests-text">No pending requests.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.name}</td>
                  <td>{request.specialization}</td>
                  <td>{request.contact}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(request._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(request._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;