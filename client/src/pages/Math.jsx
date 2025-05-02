import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

const QuizGame = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [expression, setExpression] = useState("neutral");
  const [message, setMessage] = useState("");
  const [gameCompleted, setGameCompleted] = useState(false);
  const [allLevels, setAllLevels] = useState([]);

  const videoRef = useRef(null);

  useEffect(() => {
    const loadQuestionsAndModels = async () => {
      // Load face-api models
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");

      // Fetch questions.json
      const response = await fetch("../../public/question.json");
      const data = await response.json();

      // Combine easy, medium, hard into one array
      const levels = [...data.math.easy, ...data.math.medium, ...data.math.hard];
      setAllLevels(levels);

      // Start webcam
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          runExpressionDetection();
        }
      } catch (error) {
        console.error("Webcam error:", error);
      }
    };

    loadQuestionsAndModels();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const runExpressionDetection = async () => {
    setInterval(async () => {
      if (!videoRef.current) return;
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections?.expressions) {
        const exp = detections.expressions;
        const maxExp = Object.keys(exp).reduce((a, b) => (exp[a] > exp[b] ? a : b));
        setExpression(maxExp);
      }
    }, 1000);
  };

  const calculateEmotionBonus = () => {
    if (expression === "happy") return 5;
    if (expression === "angry" || expression === "sad") return -2;
    return 0;
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const currentQ = allLevels[levelIndex];
    const isCorrect = selectedAnswer === currentQ.answer;
    const emotionBonus = calculateEmotionBonus();
    let points = 0;

    if (isCorrect) {
      points = 10;
      if (levelIndex >= 10 && levelIndex < 20) points += 5;
      if (levelIndex >= 20) points += 10;
      points += emotionBonus;

      setMessage(`✅ Correct! +${points} points${emotionBonus !== 0 ? ` (${emotionBonus > 0 ? '+' : ''}${emotionBonus} for ${expression} face)` : ''}`);
      setScore(score + points);

      setTimeout(() => {
        if (levelIndex < allLevels.length - 1) {
          setLevelIndex(levelIndex + 1);
          setSelectedAnswer(null);
          setMessage("");
        } else {
          setGameCompleted(true);
          setMessage("🎉 All levels completed!");
        }
      }, 1000);
    } else {
      setMessage("❌ Try again!");
      setScore(Math.max(0, score - 2));
    }
  };

  if (allLevels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading questions...</p>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-10">
        <h1 className="text-3xl font-bold mb-4">🎉 Game Completed!</h1>
        <p className="text-xl">Final Score: {score}</p>
      </div>
    );
  }

  const currentQuestion = allLevels[levelIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Hidden video feed */}
      <video ref={videoRef} autoPlay muted playsInline style={{ display: "none" }} />

      {/* Quiz content */}
      <div className="max-w-xl mx-auto mt-12 bg-white p-6 rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-2">Math Quiz Game</h1>
        <p className="mb-2 text-gray-600">Score: {score} | Emotion: {expression}</p>

        <p className="text-lg mb-4 font-medium">{currentQuestion.question}</p>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`px-4 py-2 rounded-lg border-2 ${
                selectedAnswer === option ? "bg-green-400 text-white border-green-500" : "border-gray-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          onClick={checkAnswer}
          disabled={!selectedAnswer}
          className={`px-4 py-2 rounded-lg text-white ${
            selectedAnswer ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Submit
        </button>

        {message && <p className="mt-4 text-md">{message}</p>}
        <p className="mt-2 text-sm text-gray-500">
          Question {levelIndex + 1} / {allLevels.length}
        </p>
      </div>
    </div>
  );
};

export default QuizGame;
