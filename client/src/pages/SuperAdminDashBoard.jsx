import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/superAdmin.css"  // Style for the dashboard

function SuperAdminDashboard() {
    const [therapists, setTherapists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Fetch therapists when component mounts
    useEffect(() => {
        const fetchTherapists = async () => {
            try {
                const response = await axios.get("http://localhost:5000/superadmin/therapists");
                setTherapists(response.data);
            } catch (err) {
                setError("Failed to fetch therapists.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTherapists();
    }, []);

    // If no therapists are available, show an empty state
    if (isLoading) {
        return <div>Loading therapists...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="superadmin-dashboard">
            <h1>Super Admin Dashboard</h1>
            <p>Below are the details of all therapists:</p>

            <table className="therapist-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {therapists.length === 0 ? (
                        <tr>
                            <td colSpan="5">No therapists found.</td>
                        </tr>
                    ) : (
                        therapists.map((therapist) => (
                            <tr key={therapist._id}>
                                <td>{therapist.name}</td>
                                <td>{therapist.email}</td>
                                <td>{therapist.phone}</td>
                                <td>{therapist.location}</td>
                                <td>
                                    <button
                                        className="view-details-btn"
                                        onClick={() => navigate(`/therapist/${therapist._id}`)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SuperAdminDashboard;
