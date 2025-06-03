import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";

const shapes = ["🔺", "🔵", "🟡", "🟥", "🔶"];

export default function Pattern() {
  const [levels, setLevels] = useState([]);
  const [level, setLevel] = useState(0);
  const [selectedShape, setSelectedShape] = useState(null);
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [detectionActive, setDetectionActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef();
  const navigate = useNavigate();

  // Load face-api models and start video
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        startVideo();
      } catch (error) {
        console.error("Error loading face-api models:", error);
      }
    };

    loadModels();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .then(() => console.log("Video started"))
              .catch((err) => console.error("Video play error:", err));
          };
        }
      })
      .catch((err) => console.error("Camera access error:", err));
  };

  const handleVideoPlay = () => {
    console.log("handleVideoPlay triggered");
    setVideoReady(true);
    setDetectionActive(true);
  };

  const detectEmotion = async () => {
    if (!detectionActive || !videoRef.current || !videoReady) return;

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const maxEmotion = Object.entries(expressions).reduce(
          (max, [emotion, value]) =>
            value > max.value ? { emotion, value } : max,
          { emotion: null, value: 0 }
        );

        if (maxEmotion.emotion && maxEmotion.value > 0.3) {
          setEmotion(`${maxEmotion.emotion} (${Math.round(maxEmotion.value * 100)}%)`);
        } else {
          setEmotion("Unknown");
        }
      } else {
        setEmotion("Unknown");
      }
    } catch (err) {
      console.error("Emotion detection error:", err);
      setEmotion("Unknown");
    }
  };

  useEffect(() => {
    if (detectionActive) {
      console.log("Starting detection loop...");
      const timer = setInterval(detectEmotion, 1000);
      return () => clearInterval(timer);
    }
  }, [detectionActive, videoReady]);

  // Load shape pattern levels
  useEffect(() => {
    fetch("/ShapePattern.json")
      .then((res) => res.json())
      .then((data) => {
        const allLevels = Object.values(data).flat();
        setLevels(allLevels);
      })
      .catch((err) => console.error("Error loading shape data:", err));
  }, []);

  const updateLevelInBackend = async (levelToUpdate) => {
    try {
      const res = await fetch("https://alp-rjd5.onrender.com/update-child-level", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your-valid-token", // Replace with real token
        },
        body: JSON.stringify({
          gameName: "Shape Pattern",
          currentLevel: levelToUpdate,
          id: localStorage.getItem("id"),
          emotion,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("Backend update error:", err);
      return false;
    }
  };

  const checkAnswer = () => {
    if (!levels.length) return;

    setDetectionActive(false);

    const isCorrect = selectedShape === levels[level].answer;
    setMessage(isCorrect ? "Correct! Moving to next question." : "Try again!");

    const newAnswer = {
      pattern: levels[level].pattern,
      correctAnswer: levels[level].answer,
      yourAnswer: selectedShape,
      isCorrect,
      emotion,
    };

    setAnswers((prev) => [...prev, newAnswer]);

    setTimeout(() => {
      setSelectedShape(null);
      setMessage("");
      if ((level + 1) % 5 === 0 || level === levels.length - 1) {
        setShowSummary(true);
      } else {
        setLevel(level + 1);
      }
      setDetectionActive(true);
    }, 1000);
  };

  const nextSession = async () => {
    if (updating) return;
    setUpdating(true);

    const correctCount = answers.filter((ans) => ans.isCorrect).length;
    const storedData = JSON.parse(localStorage.getItem("game_Memory_Puzzle"));

    let newCurrentLevel = storedData?.currentLevel ?? 0;

    if (storedData && correctCount >= 3) {
      newCurrentLevel = storedData.currentLevel + 1;
      const updatedData = { ...storedData, currentLevel: newCurrentLevel };
      localStorage.setItem("game_Memory_Puzzle", JSON.stringify(updatedData));
    }

    const backendUpdated = await updateLevelInBackend(newCurrentLevel);
    if (!backendUpdated) console.warn("Backend update failed, continuing anyway.");

    setShowSummary(false);
    setAnswers([]);
    setLevel((prev) => prev + 1);
    setUpdating(false);
  };

  const goBack = async () => {
    if (updating) return;
    setUpdating(true);

    const storedData = JSON.parse(localStorage.getItem("game_Memory_Puzzle"));
    const currentLevelToSend = storedData?.currentLevel ?? 0;

    const backendUpdated = await updateLevelInBackend(currentLevelToSend);
    if (!backendUpdated) console.warn("Go back backend update failed");

    setUpdating(false);
    navigate("/games");
  };

  if (!levels.length) return <div className="text-black">Loading...</div>;

  if (showSummary) {
    return (
      <div className="flex flex-col items-center p-6 bg-gray-100 h-screen text-black">
        <h2 className="text-2xl font-bold mb-4">Session Summary</h2>
        <ul className="mb-4 space-y-2 w-full max-w-md">
          {answers.map((ans, index) => (
            <li key={index} className="border p-2 rounded-lg bg-white shadow flex justify-between items-center">
              <div className="text-xl">Pattern: {ans.pattern.join(" ")} → ?</div>
              <div>
                <p>
                  Your Answer:{" "}
                  <span className={ans.isCorrect ? "text-green-600" : "text-red-600"}>
                    {ans.yourAnswer || "None"}
                  </span>
                </p>
                <p>Correct Answer: {ans.correctAnswer}</p>
                <p>Emotion: {ans.emotion || "Unknown"}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex space-x-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            onClick={goBack}
            disabled={updating}
          >
            Go Back
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            onClick={nextSession}
            disabled={updating}
          >
            Continue to Next Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 h-screen text-black">
      {/* Webcam feed */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width={300}
        height={225}
        onPlay={handleVideoPlay}
      />

      <div className="mb-4">
        <p className="text-xl font-semibold text-purple-700">
          Current Emotion: {emotion || "Detecting..."}
        </p>
      </div>

      <h1 className="text-2xl font-bold mb-4">Shape Pattern Recognition</h1>
      <div className="text-4xl flex space-x-2 mb-4">
        {levels[level].pattern.map((shape, index) => (
          <span key={index}>{shape}</span>
        ))}
      </div>
      <div className="flex space-x-3 mb-4">
        {shapes.map((shape, index) => (
          <button
            key={index}
            className={`text-3xl p-2 rounded-lg border-2 ${
              selectedShape === shape ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => setSelectedShape(shape)}
          >
            {shape}
          </button>
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        onClick={checkAnswer}
        disabled={!selectedShape}
      >
        Submit
      </button>
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}
