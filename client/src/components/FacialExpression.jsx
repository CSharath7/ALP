import React, { useRef, useEffect } from 'react';
import * as cam from "@mediapipe/camera_utils";
import { FaceMesh, FACEMESH_TESSELATION } from "@mediapipe/face_mesh";
import * as drawing from "@mediapipe/drawing_utils";

const FacialExpression = ({ onEmotionDetected, isActive }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkBuffer = useRef(null);
  const indexRef = useRef(0);
  const lastLoggedRef = useRef(0);
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      // Stop camera and interval if not active
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

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

        const now = Date.now();
        if (now - lastLoggedRef.current > 5000) {
          console.log(`[INFO] Landmark captured [index: ${landmarkBuffer.current.index}] at ${new Date().toLocaleTimeString()}`);
          lastLoggedRef.current = now;
        }
      }
    });

    if (videoRef.current !== null) {
      cameraRef.current = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && isActive) {
            await faceMesh.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start().catch(error => {
        console.error("[ERROR] Failed to start camera:", error);
      });
    }

    intervalRef.current = setInterval(async () => {
      if (landmarkBuffer.current && isActive) {
        const payload = { landmarks: landmarkBuffer.current };
        console.log(`[SEND] Sending landmark [index: ${payload.landmarks.index}]`);

        try {
          const response = await fetch('https://alp-model.onrender.com/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.emotion) {
              if (onEmotionDetected) {
                onEmotionDetected(data.emotion);
              }
              console.log(`[RECV] Emotion: ${data.emotion}`);
            } else {
              console.error("[ERROR] Invalid response format:", data);
            }
          } else {
            const errorData = await response.text();
            console.error("[ERROR] Server response error:", response.status, errorData);
          }

          landmarkBuffer.current = null;
        } catch (error) {
          console.error("[ERROR] Failed to send landmarks:", error);
        }
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      faceMesh.close();
    };
  }, [onEmotionDetected, isActive]);

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
    </div>
  );
};

export default FacialExpression;