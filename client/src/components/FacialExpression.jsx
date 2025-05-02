// THIS CODE IS FOR MODEL TALKING
// import React, { useRef, useEffect, useState } from 'react';
// import * as cam from "@mediapipe/camera_utils";
// import { FaceMesh } from "@mediapipe/face_mesh";
// import * as drawing from "@mediapipe/drawing_utils";

// const FacialExpression = () => {
//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);
//     const [emotion, setEmotion] = useState('Neutral');
//     const [confidence, setConfidence] = useState(0);

//     useEffect(() => {
//         const faceMesh = new FaceMesh({
//             locateFile: (file) => `/node_modules/@mediapipe/face_mesh/${file}`,
//         });

//         faceMesh.setOptions({
//             maxNumFaces: 1,
//             refineLandmarks: true,
//             minDetectionConfidence: 0.5,
//             minTrackingConfidence: 0.5,
//         });

//         faceMesh.onResults(async (results) => {
//             if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
//                 const landmarks = results.multiFaceLandmarks[0];

//                 // Log how many landmarks points we have
//                 console.log("Number of landmarks points:", landmarks.length);
//                 console.log("landmarks:", landmarks);

//                 // Draw face landmarks
//                 const canvasCtx = canvasRef.current.getContext('2d');
//                 canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//                 drawing.drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });

//                 // Send landmarks to NodeJS server
//                 try {
//                     const response = await fetch('http://localhost:8000/predict', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             landmarks: landmarks.map(pt => ({ x: pt.x, y: pt.y, z: pt.z })),
//                         }),
//                     });

//                     if (response.ok) {
//                         const data = await response.json();
//                         setEmotion(data.emotion);
//                         setConfidence(data.confidence);
//                     } else {
//                         console.error("Failed to get response from server", response);
//                     }
//                 } catch (error) {
//                     console.error("Error sending landmarks to server:", error);
//                 }
//             }
//         });

//         if (videoRef.current !== null) {
//             const camera = new cam.Camera(videoRef.current, {
//                 onFrame: async () => {
//                     await faceMesh.send({ image: videoRef.current });
//                 },
//                 width: 640,
//                 height: 480,
//             });
//             camera.start();
//         }
//     }, []);

//     return (
//         <div style={{ position: 'relative' }}>
//             <video ref={videoRef} style={{ width: 640, height: 480 ,display: 'none'}} autoPlay muted playsInline />
//             <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0 }} />
//             <h2>Detected Emotion: {emotion}</h2>
//             <p>Confidence: {confidence}</p>
//         </div>
//     );
// };

// export default FacialExpression;

import React, { useRef, useEffect } from 'react';
import * as cam from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as drawing from "@mediapipe/drawing_utils";

const FacialExpression = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

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

        faceMesh.onResults(async (results) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];

                // Draw landmarks on canvas
                const canvasCtx = canvasRef.current.getContext('2d');
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                drawing.drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_TESSELATION, {
                    color: '#C0C0C070',
                    lineWidth: 1,
                });

                // Send only landmarks, ignore server response
                try {
                    await fetch('http://localhost:8000/predict', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            landmarks: landmarks.map(pt => ({
                                x: pt.x,
                                y: pt.y,
                                z: pt.z,
                            })),
                        }),
                    });
                } catch (error) {
                    console.error("Error sending landmarks to server:", error);
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
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            <video
                ref={videoRef}
                style={{ width: 640, height: 480, display: 'none' }}
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
        </div>
    );
};

export default FacialExpression;
