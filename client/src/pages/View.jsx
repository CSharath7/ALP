import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/View.css";

const View = () => {
  // State to store children data and loading status
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get therapist name from localStorage
  const therapistName = localStorage.getItem('name');
  const id = localStorage.getItem('id');

  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        if (!therapistName) {
          throw new Error('Therapist name not found in local storage');
        }

        // Make API call to your backend endpoint
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

  if (loading) {
    return <div className="loading">Loading children data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (children.length === 0) {
    return <div className="no-data">No children found for therapist: {therapistName}</div>;
  }

  return (
    <div className="children-container">
      <h2>Children Assigned to Therapist: {therapistName}</h2>
      
      <div className="children-list">
        {children.map((child) => (
          <div key={child._id} className="child-card">
            <h3>{child.name}</h3>
            <div className="child-details">
              <p><strong>Age:</strong> {child.age}</p>
              <p><strong>Gender:</strong> {child.gender}</p>
              {/* Add more fields as needed */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default View;