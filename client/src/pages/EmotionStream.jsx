// src/components/EmotionStream.jsx
import React from 'react';

const EmotionStream = () => {
    return (
        <div>
            <h2>Live Emotion Detection</h2>
            <img
                src="http://localhost:3000/video"
                alt="Emotion Stream"
                style={{ width: '100%', maxWidth: '800px', border: '2px solid green' }}
            />
        </div>
    );
};

export default EmotionStream;
