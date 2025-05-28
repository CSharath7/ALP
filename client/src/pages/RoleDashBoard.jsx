import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/superAdmin.css";
import "../styles/View.css";
import "../styles/Therapist.css";

function RoleBasedDashboard() {
    const role = localStorage.getItem("role");

    if (role === "child") return <ChildDashboard />;
    if (role === "superadmin") return <SuperAdminDashboard />;
    if (role === "therapist") return <TherapistDashboard />;
    return <div>Invalid role. Please log in again.</div>;
}

// ------------------ CHILD DASHBOARD ------------------
function ChildDashboard() {
    const [message, setMessage] = useState("");
    const [userData, setUserData] = useState({ name: "", progress: 0 });
    const [recentActivities, setRecentActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProtectedData = async () => {
            try {
                const token = localStorage.getItem("token");
                await axios.get("http://localhost:5000/api/auth/protected", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const name = localStorage.getItem("name") || "Friend";
                setUserData({
                    name,
                    progress: Math.floor(Math.random() * 100),
                });

                setRecentActivities([
                    { game: "Math Quest", score: "85%", date: "Today" },
                    { game: "Word Wizard", score: "70%", date: "Yesterday" },
                    { game: "Memory Puzzle", score: "90%", date: "2 days ago" },
                ]);

                setMessage(`Welcome back, ${name}!`);
            } catch {
                setMessage("Oops! Something went wrong. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProtectedData();
    }, []);

    if (isLoading) return <div className="loading-container"><div className="loading-text">Loading your dashboard...</div></div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Your Learning Dashboard</h1>
                <p className="dashboard-subtitle">{message}</p>
            </header>

            <div className="grid-cols-3">
                <div className="card welcome-card">
                    <h2 className="card-title blue-title">Hello, {userData.name}!</h2>
                    <p>Ready for some fun learning today?</p>
                    <Link to="/games" className="play-btn">Play Games</Link>
                </div>

                <div className="card progress-card">
                    <h2 className="card-title green-title">Your Progress</h2>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${userData.progress}%` }}></div>
                    </div>
                    <p>Keep going! You're doing great!</p>
                </div>

                <div className="card actions-card">
                    <h2 className="card-title yellow-title">Quick Actions</h2>
                    <Link to="/games" className="quick-action">Continue Last Game</Link>
                    <Link to="/rewards" className="quick-action">View Your Rewards</Link>
                    <Link to="/settings" className="quick-action">Change Settings</Link>
                </div>
            </div>

            <div className="card">
                <h2 className="card-title purple-title">Recent Activities</h2>
                <table className="activities-table">
                    <thead>
                        <tr><th>Game</th><th>Score</th><th>When</th></tr>
                    </thead>
                    <tbody>
                        {recentActivities.map((a, i) => (
                            <tr key={i} className={i % 2 === 0 ? "striped-row" : ""}>
                                <td>{a.game}</td><td className="font-bold">{a.score}</td><td>{a.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ------------------ SUPER ADMIN DASHBOARD ------------------
function SuperAdminDashboard() {
    const [therapists, setTherapists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTherapists = async () => {
            try {
                const res = await axios.get("http://localhost:5000/superadmin/therapists");
                setTherapists(res.data);
            } catch {
                setError("Failed to fetch therapists.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTherapists();
    }, []);

    if (isLoading) return <div>Loading therapists...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="superadmin-dashboard">
            <h1>Super Admin Dashboard</h1>
            <p>Below are the details of all therapists:</p>
            <table className="therapist-table">
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Location</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {therapists.length === 0 ? (
                        <tr><td colSpan="5">No therapists found.</td></tr>
                    ) : (
                        therapists.map((t) => (
                            <tr key={t._id}>
                                <td>{t.name}</td><td>{t.email}</td><td>{t.phone}</td><td>{t.location}</td>
                                <td>
                                    <button className="view-details-btn" onClick={() => navigate(`/therapist/${t._id}`)}>
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

// // ------------------ THERAPIST DASHBOARD ------------------
// function TherapistDashboard() {
//     const [children, setChildren] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedReport, setSelectedReport] = useState(null);

//     const therapistName = localStorage.getItem('name');
//     const id = localStorage.getItem('id');

//     useEffect(() => {
//         const fetchChildren = async () => {
//             try {
//                 const res = await axios.post(`http://localhost:5000/api/getchild/${id}`);
//                 if (res.data.success) {
//                     setChildren(res.data.children);
//                 } else throw new Error(res.data.message);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchChildren();
//     }, [id]);

//     const handleViewReport = async (uid) => {
//         try {
//             const res = await axios.get(`http://localhost:5000/getchildreport/${uid}`);
//             if (res.data.success) {
//                 setSelectedReport({ uid, games: res.data.games });
//             } else {
//                 setSelectedReport({ uid, error: "No games found for this child." });
//             }
//         } catch {
//             setSelectedReport({ uid, error: "Error fetching report." });
//         }
//     };

//     if (loading) return <div className="loading">Loading children data...</div>;
//     if (error) return <div className="error">Error: {error}</div>;
//     if (children.length === 0) return <div className="no-data">No children found for therapist: {therapistName}</div>;

//     return (
//         <div className="therapist-table-container">
//             <h2>Children Assigned to Therapist: {therapistName}</h2>
            
//             <table className="therapist-children-table">
//                 <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Age</th>
//                         <th>Gender</th>
//                         <th>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {children.map((child) => (
//                         <React.Fragment key={child.uid}>
//                             <tr>
//                                 <td>{child.name}</td>
//                                 <td>{child.age}</td>
//                                 <td>{child.gender}</td>
//                                 <td>
//                                     <button 
//                                         className="view-report-btn"
//                                         onClick={() => handleViewReport(child.uid)}
//                                     >
//                                         {selectedReport?.uid === child.uid ? 
//                                             "Hide Report" : "View Report"}
//                                     </button>
//                                 </td>
//                             </tr>
                            
//                             {selectedReport && selectedReport.uid === child.uid && (
//                                 <tr className="report-row">
//                                     <td colSpan="4">
//                                         <div className="report-section">
//                                             {selectedReport.error ? (
//                                                 <p>{selectedReport.error}</p>
//                                             ) : (
//                                                 <div>
//                                                     <h4>Assigned Games & Levels</h4>
//                                                     <table className="games-table">
//                                                         <thead>
//                                                             <tr>
//                                                                 <th>Game Name</th>
//                                                                 <th>Assigned Level</th>
//                                                                 <th>Current Level</th>
//                                                             </tr>
//                                                         </thead>
//                                                         <tbody>
//                                                             {selectedReport.games.map((game, index) => (
//                                                                 <tr key={index}>
//                                                                     <td>{game.name}</td>
//                                                                     <td>{game.assignedLevel}</td>
//                                                                     <td>{game.currentLevel}</td>
//                                                                 </tr>
//                                                             ))}
//                                                         </tbody>
//                                                     </table>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             )}
//                         </React.Fragment>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }
// ------------------ THERAPIST DASHBOARD ------------------
function TherapistDashboard() {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);

    const therapistName = localStorage.getItem('name');
    const id = localStorage.getItem('id');

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await axios.post(`http://localhost:5000/api/getchild/${id}`);
                if (res.data.success) {
                    setChildren(res.data.children);
                } else throw new Error(res.data.message);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, [id]);

    const toggleReport = async (uid) => {
        // If report is already open for this child, close it
        if (selectedReport?.uid === uid) {
            setSelectedReport(null);
            return;
        }

        // Otherwise, fetch and show the report
        try {
            const res = await axios.get(`http://localhost:5000/getchildreport/${uid}`);
            setSelectedReport({
                uid,
                games: res.data.success ? res.data.games : [],
                error: res.data.success ? null : "No games found for this child."
            });
        } catch {
            setSelectedReport({ uid, error: "Error fetching report.", games: [] });
        }
    };

    if (loading) return <div className="loading">Loading children data...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (children.length === 0) return <div className="no-data">No children found for therapist: {therapistName}</div>;

    return (
        <div className="therapist-table-container">
            <h2>Children Assigned to Therapist: {therapistName}</h2>
            
            <table className="therapist-children-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {children.map((child) => (
                        <React.Fragment key={child.uid}>
                            <tr>
                                <td>{child.name}</td>
                                <td>{child.age}</td>
                                <td>{child.gender}</td>
                                <td>
                                    <button 
                                        className={`view-report-btn ${selectedReport?.uid === child.uid ? 'active' : ''}`}
                                        onClick={() => toggleReport(child.uid)}
                                    >
                                        {selectedReport?.uid === child.uid ? "Hide Report" : "View Report"}
                                    </button>
                                </td>
                            </tr>
                            
                            {selectedReport?.uid === child.uid && (
                                <tr className="report-row">
                                    <td colSpan="4">
                                        <div className="report-section">
                                            {selectedReport.error ? (
                                                <p className="error-message">{selectedReport.error}</p>
                                            ) : (
                                                <div>
                                                    <h4>Assigned Games & Levels</h4>
                                                    {selectedReport.games.length > 0 ? (
                                                        <table className="games-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Game Name</th>
                                                                    <th>Assigned Level</th>
                                                                    <th>Current Level</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {selectedReport.games.map((game, index) => (
                                                                    <tr key={index}>
                                                                        <td>{game.name}</td>
                                                                        <td>{game.assignedLevel}</td>
                                                                        <td>{game.currentLevel}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p>No games assigned yet</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default RoleBasedDashboard;
