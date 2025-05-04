

import React, { useRef, useEffect, useState } from 'react';
import * as cam from "@mediapipe/camera_utils";
import { FaceMesh, FACEMESH_TESSELATION } from "@mediapipe/face_mesh";
import * as drawing from "@mediapipe/drawing_utils";

const FacialExpression = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const landmarkBuffer = useRef(null); // Only store latest landmarks
    const indexRef = useRef(0);
    const [emotion, setEmotion] = useState('Neutral');
    const lastLoggedRef = useRef(0); // For controlled debug logging

    useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => `/node_modules/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];

                const canvasCtx = canvasRef.current.getContext('2d');
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                drawing.drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
                    color: '#C0C0C070',
                    lineWidth: 1,
                });

                landmarkBuffer.current = {
                    index: indexRef.current++,
                    points: landmarks.slice(0, 468).map(pt => ({ x: pt.x, y: pt.y, z: pt.z })),
                };

                // Log once every 5 seconds
                const now = Date.now();
                if (now - lastLoggedRef.current > 5000) {
                    console.log(`[INFO] Landmark captured [index: ${landmarkBuffer.current.index}] at ${new Date().toLocaleTimeString()}`);
                    lastLoggedRef.current = now;
                }
            }
        });

        if (videoRef.current !== null) {
            const camera = new cam.Camera(videoRef.current, {
                onFrame: async () => {
                    await faceMesh.send({ image: videoRef.current });
                },
                width: 640,
                height: 480,
            });
            camera.start();
        }

        const interval = setInterval(async () => {
            if (landmarkBuffer.current) {
                const payload = { landmarks: landmarkBuffer.current };
                console.log(`[SEND] Sending landmark [index: ${payload.landmarks.index}] at ${new Date().toLocaleTimeString()}`);

                try {
                    const response = await fetch('http://localhost:8000/predict', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'success' && data.emotion) {
                            setEmotion(data.emotion);
                            console.log(`[RECV] Emotion: ${data.emotion}`);
                        } else {
                            console.error("[ERROR] Invalid response format:", data);
                        }
                    } else {
                        const errorData = await response.json();
                        console.error("[ERROR] Server response error:", response.status, errorData);
                    }

                    landmarkBuffer.current = null;
                } catch (error) {
                    console.error("[ERROR] Failed to send landmarks:", error);
                }
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ position: 'relative', display: 'none' }}>
            <video
                ref={videoRef}
                style={{ width: 640, height: 480 }}
                autoPlay
                muted
                playsInline
            />
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{ position: 'absolute', top: 0, left: 0 }}
            />
            <h2>Detected Emotion: {emotion}</h2>
        </div>
    );
};

export default FacialExpression;
