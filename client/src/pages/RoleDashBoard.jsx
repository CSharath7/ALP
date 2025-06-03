import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/superAdmin.css";
import "../styles/View.css";
import "../styles/Therapist.css";
import "../styles/ChildDashboard.css";

function RoleBasedDashboard() {
    const role = localStorage.getItem("role");

    if (role === "child") return <ChildDashboard />;
    if (role === "superadmin") return <SuperAdminDashboard />;
    if (role === "therapist") return <TherapistDashboard />;
    return <div className="error-message">Invalid role. Please log in again.</div>;
}

// ------------------ CHILD DASHBOARD ------------------

import "../styles/Games.css"; // Reuse styles from Games component


function ChildDashboard() {
    const [message, setMessage] = useState("");
    const [userData, setUserData] = useState({ name: "", progress: 0 });
    const [games, setGames] = useState([]);
    const [gamesMessage, setGamesMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('games'); // 'games' or 'sessions'
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const uid = localStorage.getItem("uid");
                await axios.get("https://alp-rjd5.onrender.com/api/auth/protected", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const name = localStorage.getItem("name") || "Friend";
                setUserData({
                    name,
                    progress: Math.floor(Math.random() * 100),
                });

                setMessage(`Welcome back, ${name}!`);

                // Fetch selected games
                const res = await axios.get(`https://alp-rjd5.onrender.com/child/${uid}`);
                const allGameInfo = {
                    "Shape Pattern": { path: "/pattern", color: "bg-indigo-500", icon: "🔵🟡" },
                    "Story Time": { path: "/story", color: "bg-green-500", icon: "📖" },
                    "Math Quest": { path: "/math", color: "bg-purple-500", icon: "➕➖" },
                    "Memory Puzzle": { path: "/Memory", color: "bg-red-500", icon: "🧩" },
                    "Memory Matrix": { path: "/MemoryMatrix", color: "bg-blue-500", icon: "🧠" },
                    "Spell Bee": { path: "/SpellBee", color: "bg-yellow-500", icon: "🐝" },
                    "Word Wizard": { path: "/wordwizard", color: "bg-pink-500", icon: "🧙" },
                    "Word Detective": { path: "/WordDetective", color: "bg-orange-500", icon: "🔍" },
                };

                const selected = res.data.selectedGames.map(({ name, level }) => ({
                    name,
                    level,
                    ...allGameInfo[name],
                }));

                if (selected.length === 0) {
                    setGamesMessage("🎉 You have completed all of your games! Please visit your consulted therapist for further instructions.");
                } else {
                    setGames(selected);
                }

                // Fetch session history
                const sessionRes = await axios.get(`https://alp-rjd5.onrender.com/child/sessions/${uid}`);
                setSessions(sessionRes.data.sessions || []);
            } catch (error) {
                setMessage("Oops! Something went wrong. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) return (
        <div className="loading-container">
            <div className="loading-text">Loading your dashboard...</div>
        </div>
    );

    return (
        <div className="dashboard-container dyslexia-child-dashboard">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Your Learning Dashboard</h1>
                <p className="dashboard-subtitle">{message}</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="card welcome-card">
                    <h2 className="card-title accent-primary">Hello, {userData.name}!</h2>
                    <p>Ready for some fun learning today?</p>
                </div>
                <div className="card actions-card">
                    <h2 className="card-title text-primary">Quick Actions</h2>
                    <Link to="/games" className="quick-action">Continue Last Game</Link>
                    <Link to="/profile" className="quick-action">View your profile</Link>
                </div>
            </div>

            <div className="card">
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
                        onClick={() => setActiveTab('games')}
                    >
                        Your Games
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sessions')}
                    >
                        Session History
                    </button>
                </div>

                {activeTab === 'games' ? (
                    <>
                        {gamesMessage ? (
                            <p className="therapy-message">{gamesMessage}</p>
                        ) : (
                            <div className="games-grid">
                                {games.map((game, index) => (
                                    <Link key={index} to={game.path} className={`game-card ${game.color}`}>
                                        <span className="game-icon">{game.icon}</span>
                                        <span className="game-name">{game.name}</span>
                                        <span className="game-level">Level: {game.level}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="session-history">
                        {sessions.length > 0 ? (
                            <table className="session-table">
                                <thead>
                                    <tr>
                                        <th>Game</th>
                                        <th>Level</th>
                                        <th>Score</th>
                                        <th>Date</th>
                                        <th>Emotion State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((session, index) => (
                                        <tr key={index}>
                                            <td>{session.gameName}</td>
                                            <td>{session.level}</td>
                                            <td>{session.score}</td>
                                            <td>{new Date(session.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {session.minEmotion && session.maxEmotion ? (
                                                    `${session.minEmotion} → ${session.maxEmotion}`
                                                ) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-sessions">No session history available yet. Play some games to see your progress here!</p>
                        )}
                    </div>
                )}
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
                const res = await axios.get("https://alp-rjd5.onrender.com/superadmin/therapists");
                setTherapists(res.data);
            } catch {
                setError("Failed to fetch therapists.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTherapists();
    }, []);

    if (isLoading) return <div className="loading">Loading therapists...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="superadmin-dashboard dark-theme">
            <h1 className="text-primary">Super Admin Dashboard</h1>
            <p className="text-secondary">Below are the details of all therapists:</p>
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
                        <tr><td colSpan="5" className="no-data">No therapists found.</td></tr>
                    ) : (
                        therapists.map((t) => (
                            <tr key={t._id}>
                                <td>{t.name}</td>
                                <td>{t.email}</td>
                                <td>{t.phone}</td>
                                <td>{t.location}</td>
                                <td>
                                    <button
                                        className="view-details-btn accent-primary-bg"
                                        onClick={() => navigate(`/therapist/${t._id}`)}
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

// ------------------ THERAPIST DASHBOARD ------------------
function TherapistDashboard() {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [activeTab, setActiveTab] = useState('children'); // 'children' or 'sessions'

    const therapistName = localStorage.getItem('name');
    const id = localStorage.getItem('id');

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await axios.post(`https://alp-rjd5.onrender.com/api/getchild/${id}`);
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
        if (selectedReport?.uid === uid) {
            setSelectedReport(null);
            return;
        }

        try {
            const res = await axios.get(`https://alp-rjd5.onrender.com/getchildreport/${uid}`);
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
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="therapist-dashboard-container dark-theme">
            <h1 className="dashboard-title">Therapist Dashboard</h1>
            {/* <p className="dashboard-subtitle">Welcome, {therapistName}</p> */}

            <div className="therapist-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'children' ? 'active' : ''}`}
                    onClick={() => setActiveTab('children')}
                >
                    My Children
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sessions')}
                >
                    Session History
                </button>
            </div>

            {activeTab === 'children' ? (
                <div className="therapist-table-container">
                    <h2 className="text-primary">Children Assigned to You</h2>

                    {children.length === 0 ? (
                        <div className="no-data">No children assigned yet</div>
                    ) : (
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
                                                                <h4 className="text-primary">Assigned Games & Levels</h4>
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
                                                                    <p className="no-data">No games assigned yet</p>
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
                    )}
                </div>
            ) : (
                <div className="session-history-container">
                    <h2 className="text-primary">Session History</h2>
                    {children.length === 0 ? (
                        <div className="no-data">No sessions recorded yet</div>
                    ) : (
                        <div className="session-list">
                            {children.flatMap(child => 
                                child.session?.map((session, index) => (
                                    <div key={`${child.uid}-${index}`} className="session-card">
                                        <div className="session-header">
                                            <h3>{child.name}</h3>
                                            <span className="session-date">{new Date(session.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="session-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Game:</span>
                                                <span className="detail-value">{session.gameName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Level:</span>
                                                <span className="detail-value">{session.level}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Score:</span>
                                                <span className="detail-value">{session.score}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Emotion State:</span>
                                                <span className="detail-value">
                                                    {session.minEmotion && session.maxEmotion ? 
                                                        `${session.minEmotion} → ${session.maxEmotion}` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ------------------ THERAPIST DETAILS ------------------
function TherapistDetails() {
    const { id } = useParams();
    const [therapist, setTherapist] = useState(null);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const Res = await axios.get(`https://alp-rjd5.onrender.com/superadmin/children/${id}`);
                setChildren(Res.data.children);
                setTherapist(Res.data.therapist);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch data");
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!therapist) return <div className="no-data">Therapist not found</div>;

    return (
        <div className="therapist-details-container">
            <h1>Therapist Management</h1>
            
            <div className="details-layout">
                <div className="therapist-sidebar">
                    <div className="sidebar-content">
                        <h2>Therapist Profile</h2>
                        <div className="therapist-avatar">
                            <div className="avatar-placeholder">
                                {therapist.name.charAt(0).toUpperCase()}
                            </div>
                            <h3>{therapist.name}</h3>
                            <p className="specialization">{therapist.specialization}</p>
                        </div>
                        
                        <div className="therapist-meta">
                            <div className="meta-item">
                                <span className="meta-label">Email:</span>
                                <span className="meta-value">{therapist.email}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Contact:</span>
                                <span className="meta-value">{therapist.contact}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Experience:</span>
                                <span className="meta-value">{therapist.experience} years</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Gender:</span>
                                <span className="meta-value">{therapist.gender}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Age:</span>
                                <span className="meta-value">{therapist.age}</span>
                            </div>
                        </div>
                        
                        <div className="stats-card">
                            <div className="stat-item">
                                <span className="stat-number">{children.length}</span>
                                <span className="stat-label">Assigned Children</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">
                                    {children.reduce((acc, child) => acc + (child.selectedGames?.length || 0), 0)}
                                </span>
                                <span className="stat-label">Total Games Assigned</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="children-content">
                    <div className="content-header">
                        <h2>Assigned Children</h2>
                        <p className="subtitle">Showing {children.length} children under this therapist's care</p>
                    </div>

                    {children.length === 0 ? (
                        <div className="empty-state">
                            <p>No children assigned to this therapist yet</p>
                        </div>
                    ) : (
                        <div className="children-list">
                            {children.map(child => (
                                <div key={child._id} className="child-card">
                                    <div className="child-header">
                                        <div className="child-avatar">
                                            {child.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="child-info">
                                            <h3>{child.name}</h3>
                                            <div className="child-meta">
                                                <span>Age: {child.age}</span>
                                                <span>Gender: {child.gender}</span>
                                                <span>Games: {child.selectedGames?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="assigned-games">
                                        {child.selectedGames && child.selectedGames.length > 0 ? (
                                            <table className="child-table">
                                                <thead>
                                                    <tr>
                                                        <th>Game Name</th>
                                                        <th>Assigned Level</th>
                                                        <th>Current Level</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {child.selectedGames.map((game, index) => (
                                                        <tr key={index}>
                                                            <td>{game.name}</td>
                                                            <td>{game.assignedLevel}</td>
                                                            <td>{game.currentLevel}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="no-data">No games assigned</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RoleBasedDashboard;