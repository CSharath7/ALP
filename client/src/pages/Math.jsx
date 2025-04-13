import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

const QuizGame = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [expression, setExpression] = useState("neutral");
  const [message, setMessage] = useState("");
  const [gameCompleted, setGameCompleted] = useState(false);

  const videoRef = useRef(null);

  const levels = {
    easy: [
      { question: "2 + 2 = ?", options: ["3", "4", "5", "6"], answer: "4" },
      { question: "5 - 3 = ?", options: ["1", "2", "3", "4"], answer: "2" },
      { question: "3 + 1 = ?", options: ["2", "4", "5", "6"], answer: "4" },
      { question: "6 - 2 = ?", options: ["2", "3", "4", "5"], answer: "4" },
      { question: "1 + 2 = ?", options: ["2", "3", "4", "5"], answer: "3" },
      { question: "4 + 0 = ?", options: ["3", "4", "5", "6"], answer: "4" },
      { question: "2 + 3 = ?", options: ["4", "5", "6", "7"], answer: "5" },
      { question: "5 - 1 = ?", options: ["3", "4", "5", "6"], answer: "4" },
      { question: "1 + 1 = ?", options: ["1", "2", "3", "4"], answer: "2" },
      { question: "6 - 3 = ?", options: ["2", "3", "4", "5"], answer: "3" },
    ],
    medium: [
      { question: "12 + 15 = ?", options: ["27", "26", "28", "25"], answer: "27" },
      { question: "20 - 8 = ?", options: ["12", "13", "11", "14"], answer: "12" },
      { question: "14 + 5 = ?", options: ["18", "19", "20", "21"], answer: "19" },
      { question: "25 - 10 = ?", options: ["14", "15", "16", "13"], answer: "15" },
      { question: "9 + 6 = ?", options: ["14", "15", "16", "13"], answer: "15" },
      { question: "18 - 4 = ?", options: ["14", "13", "15", "12"], answer: "14" },
      { question: "10 + 11 = ?", options: ["20", "21", "22", "23"], answer: "21" },
      { question: "17 - 9 = ?", options: ["7", "8", "9", "10"], answer: "8" },
      { question: "8 + 5 = ?", options: ["13", "12", "14", "11"], answer: "13" },
      { question: "30 - 15 = ?", options: ["15", "16", "14", "13"], answer: "15" },
    ],
    hard: [
      { question: "45 + 38 = ?", options: ["82", "83", "84", "85"], answer: "83" },
      { question: "92 - 47 = ?", options: ["45", "46", "44", "43"], answer: "45" },
      { question: "56 + 29 = ?", options: ["84", "85", "83", "86"], answer: "85" },
      { question: "78 - 34 = ?", options: ["44", "45", "43", "46"], answer: "44" },
      { question: "67 + 18 = ?", options: ["84", "85", "83", "86"], answer: "85" },
      { question: "90 - 45 = ?", options: ["45", "44", "43", "42"], answer: "45" },
      { question: "38 + 47 = ?", options: ["85", "84", "83", "86"], answer: "85" },
      { question: "66 - 22 = ?", options: ["44", "45", "43", "42"], answer: "44" },
      { question: "29 + 56 = ?", options: ["85", "84", "83", "86"], answer: "85" },
      { question: "80 - 35 = ?", options: ["45", "44", "43", "46"], answer: "45" },
    ],
  };

  const allLevels = [...levels.easy, ...levels.medium, ...levels.hard];

  useEffect(() => {
    const loadModelsAndStart = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");

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

    loadModelsAndStart();

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
