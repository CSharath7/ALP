import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/View.css";

const View = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const therapistName = localStorage.getItem('name');
  const id = localStorage.getItem('id');

  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        if (!therapistName) throw new Error('Therapist name not found in local storage');
        const response = await axios.post(`http://localhost:5000/api/getchild/${id}`);
        if (response.data.success) {
          setChildren(response.data.children);
        } else {
          throw new Error(response.data.message || 'Failed to fetch children data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, [therapistName]);

  const handleViewReport = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:5000/getchildreport/${uid}`);
      if (res.data.success) {
        setSelectedReport({ uid, games: res.data.games });
      } else {
        setSelectedReport({ uid, error: "No games found for this child." });
      }
    } catch (err) {
      setSelectedReport({ uid, error: "Error fetching report." });
    }
  };

  if (loading) return <div className="loading">Loading children data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (children.length === 0) return <div className="no-data">No children found for therapist: {therapistName}</div>;

  return (
    <div className="children-container">
      <h2>Children Assigned to Therapist: {therapistName}</h2>
      <div className="children-list">
        {children.map((child) => (
          <div key={child.uid} className="child-card">
            <h3>{child.name}</h3>
            <div className="child-details">
              <p><strong>Age:</strong> {child.age}</p>
              <p><strong>Gender:</strong> {child.gender}</p>
              <button onClick={() => handleViewReport(child.uid)}>View Report</button>
            </div>

            {selectedReport && selectedReport.uid === child.uid && (
              <div className="report-section">
                {selectedReport.error ? (
                  <p>{selectedReport.error}</p>
                ) : (
                  <div>
                    <h4>Assigned Games & Levels</h4>
                    {Array.isArray(selectedReport.games) && selectedReport.games.length > 0 ? (
                      <ul>
                        {selectedReport.games.map((game, index) => (
                          <li key={index}>
                            <strong>{game.name}</strong> — Assigned Level: <strong>{game.assignedLevel}</strong>, Current Level: <strong>{game.currentLevel}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No games data available.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default View;
