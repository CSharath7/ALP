    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import { useParams } from 'react-router-dom';
    import "../styles/TherapistDetails.css";

    function TherapistDetails() {
        const { id } = useParams();
        const [therapist, setTherapist] = useState(null);
        const [children, setChildren] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [activeChildTab, setActiveChildTab] = useState({}); // Stores active tab per child

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const Res = await axios.get(`https://alp-rjd5.onrender.com/superadmin/children/${id}`);
                    setChildren(Res.data.children);
                    setTherapist(Res.data.therapist);
                    
                    // Initialize tabs for each child
                    const tabs = {};
                    Res.data.children.forEach(child => {
                        tabs[child._id] = 'games'; // Default to games tab
                    });
                    setActiveChildTab(tabs);
                    
                    setLoading(false);
                } catch (err) {
                    setError(err.response?.data?.message || "Failed to fetch data");
                    setLoading(false);
                }
            };

            fetchData();
        }, [id]);

        const switchChildTab = (childId, tab) => {
            setActiveChildTab(prev => ({
                ...prev,
                [childId]: tab
            }));
        };

        if (loading) return <div className="loading">Loading...</div>;
        if (error) return <div className="error">{error}</div>;
        if (!therapist) return <div className="no-data">Therapist not found</div>;

        return (
            <div className="therapist-details-container">
                <h1>Therapist Management</h1>
                
                <div className="details-layout">
                    {/* Therapist Profile Sidebar (unchanged) */}
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

                    {/* Children Details Section (updated) */}
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
                                                    <span>Sessions: {child.session?.length || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="child-tabs">
                                            <button 
                                                className={`tab-btn ${activeChildTab[child._id] === 'games' ? 'active' : ''}`}
                                                onClick={() => switchChildTab(child._id, 'games')}
                                            >
                                                Assigned Games
                                            </button>
                                            <button 
                                                className={`tab-btn ${activeChildTab[child._id] === 'sessions' ? 'active' : ''}`}
                                                onClick={() => switchChildTab(child._id, 'sessions')}
                                            >
                                                Session History
                                            </button>
                                        </div>

                                        <div className="tab-content">
                                            {activeChildTab[child._id] === 'games' ? (
                                                child.selectedGames && child.selectedGames.length > 0 ? (
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
                                                )
                                            ) : (
                                                child.session && child.session.length > 0 ? (
                                                    <table className="child-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Game</th>
                                                                <th>Level</th>
                                                                <th>Score</th>
                                                                <th>Emotion State</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {child.session.map((session, index) => (
                                                                <tr key={index}>
                                                                    <td>{session.gameName}</td>
                                                                    <td>{session.level}</td>
                                                                    <td>{session.score}</td>
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
                                                    <p className="no-data">No sessions recorded</p>
                                                )
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

    export default TherapistDetails;