import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin");
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
     await axios.post(`http://localhost:5000/api/admin/approve/${id}`, {}); // ✅ Send empty object
     setRequests(requests.filter((req) => req._id !== id));
     alert("Therapist Approved!");
   } catch (error) {
     console.error("Error approving therapist:", error);
   }
 };


  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/reject/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
      alert("Therapist Rejected!");
    } catch (error) {
      console.error("Error rejecting therapist:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Admin Panel - Pending Therapists
      </h2>
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-600">No pending requests.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Specialization</th>
                <th className="p-3 border">Contact</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="text-center border-b">
                  <td className="p-3 border">{request.name}</td>
                  <td className="p-3 border">{request.specialization}</td>
                  <td className="p-3 border">{request.contact}</td>
                  <td className="p-3 border flex justify-center gap-3">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition transform hover:scale-105"
                      onClick={() => handleApprove(request._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition transform hover:scale-105"
                      onClick={() => handleReject(request._id)}
                    >
                      Reject
                    </button>
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
