import React from 'react';
import FacialExpression from '../components/FacialExpression';

const LiveFeed = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            <h2>Live Facial Expression Detection</h2>
            <FacialExpression />
        </div>
    );
};

export default LiveFeed;
