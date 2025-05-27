import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import "../styles/QuizGame.css";

const getInitialLevel = () => {
  const saved = localStorage.getItem("game_Math_Quest");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return parsed.currentLevel ?? 0;
    } catch {
      return 0;
    }
  }
  return 0;
};

// Preserve assignedLevel while updating currentLevel in localStorage
const updateLocalStorageLevel = (newLevel) => {
  const saved = localStorage.getItem("game_Math_Quest");
  let data = { currentLevel: newLevel };

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.assignedLevel !== undefined) {
        data.assignedLevel = parsed.assignedLevel;
      }
    } catch {
      // ignore parsing errors, just save currentLevel
    }
  }

  localStorage.setItem("game_Math_Quest", JSON.stringify(data));
};

const adjustLevel = (questionData, currentLevel) => {
  const emotionValues = {
    happy: 2,
    surprised: 1.5,
    neutral: 0,
    sad: -2,
    fear: -2,
    angry: -3,
    disgust: -3,
    contempt: -2.5,
  };

  if (!questionData || questionData.length === 0) return currentLevel;

  // Calculate average emotion score
  const emotionTotal = questionData.reduce((sum, q) => {
    const emotionValue = emotionValues[q.emotion] || 0;
    return sum + emotionValue;
  }, 0);
  const avgEmotionScore = emotionTotal / questionData.length;

  // Calculate normalized score (0-1)
  const totalPossibleScore = questionData.length * 10;
  const actualScore = questionData.reduce((sum, q) => sum + q.score, 0);
  const normalizedScore = actualScore / totalPossibleScore;

  // Combine scores (40% emotion, 60% performance)
  const finalScore = (0.4 * (avgEmotionScore + 3) / 6) + (0.6 * normalizedScore);

  // Adjust level based on performance (5 levels: 0-4 representing levels 1-5)
  if (finalScore > 0.7) return Math.min(currentLevel + 1, 4);
  if (finalScore > 0.55) return currentLevel;
  return Math.max(currentLevel - 1, 0);
};

const QuizGame = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [expression, setExpression] = useState("neutral");
  const [message, setMessage] = useState("");
  const [gameCompleted, setGameCompleted] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(getInitialLevel());
  const [questionData, setQuestionData] = useState([]);
const navigate = useNavigate(); 
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadQuestionsAndModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");

      const response = await fetch("/MathQuest.json");
      const data = await response.json();

      const safeCurrentLevel = Math.max(0, Math.min(currentLevel, 4));
      const allLevels = [
        data.math.level1,
        data.math.level2,
        data.math.level3,
        data.math.level4,
        data.math.level5,
      ];

      const questions = allLevels[safeCurrentLevel];

      if (!questions) {
        console.error(`No questions found for level ${safeCurrentLevel + 1}`);
        return;
      }

      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, 5);
      setSessionQuestions(picked);
      setQuestionData([]);
      setLevelIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setMessage("");
      setGameCompleted(false);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            runExpressionDetection();
          };
        }
      } catch (err) {
        console.error("Webcam error:", err);
      }
    };

    loadQuestionsAndModels();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentLevel]);

  const runExpressionDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection?.expressions) {
        const exp = detection.expressions;
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

    const currentQ = sessionQuestions[levelIndex];
    const isCorrect = selectedAnswer === currentQ.answer;
    const emotionBonus = calculateEmotionBonus();
    let points = 0;

    if (isCorrect) {
      points = 10 + emotionBonus;
      setMessage(
        `✅ Correct! +${points} points${emotionBonus !== 0 ? ` (${emotionBonus > 0 ? "+" : ""}${emotionBonus} for ${expression})` : ""
        }`
      );
      setScore(score + points);
    } else {
      setMessage("❌ Incorrect answer");
      setScore(Math.max(0, score - 2));
    }

    setQuestionData((prev) => [
      ...prev,
      {
        question: currentQ.question,
        correct: isCorrect,
        score: isCorrect ? points : -2,
        emotion: expression,
        answer: selectedAnswer,
        correctAnswer: currentQ.answer,
      },
    ]);

    setTimeout(() => {
      if (levelIndex < sessionQuestions.length - 1) {
        setLevelIndex(levelIndex + 1);
        setSelectedAnswer(null);
        setMessage("");
      } else {
        setGameCompleted(true);
        setMessage("🎉 Session completed!");
      }
    }, 1000);
  };

  const updateLevelInBackend = async (level) => {
    try {
      const res = await fetch("http://localhost:5000/update-child-level", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your-valid-token",
        },
        body: JSON.stringify({ gameName: "Math Quest", currentLevel: level, id: localStorage.getItem("id") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update level");
      console.log("Backend update success:", data);
      return true;
    } catch (err) {
      console.error("Failed to update backend level:", err);
      return false;
    }
  };

  if (sessionQuestions.length === 0) {
    return (
      <div className="loading-container">
        <p>Loading questions...</p>
      </div>
    );
  }

  if (gameCompleted) {
    const newLevel = adjustLevel(questionData, currentLevel);

    return (
      <div className="quiz-container">
        <div className="completion-container">
          <h1 className="completion-title">🎉 Session Completed!</h1>
          <p className="completion-score">Final Score: {score}</p>
          <p className="completion-level">New Level: {newLevel + 1}</p>

          <div className="question-details">
            <h2 className="quiz-subtitle">Question Details:</h2>
            {questionData.map((q, index) => (
              <div key={index} className="question-detail">
                <p className="font-medium">
                  Q{index + 1}: {q.question}
                </p>
                <p>
                  Your answer: {q.answer} {q.correct ? "✅" : "❌"}
                </p>
                <p>Correct answer: {q.correctAnswer}</p>
                <p>
                  Emotion: {q.emotion} | Score: {q.score}
                </p>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button
              className="action-button action-button-primary"
              onClick={async () => {
                const success = await updateLevelInBackend(newLevel);
                if (success) {
                  setCurrentLevel(newLevel);
                  updateLocalStorageLevel(newLevel);
                  setLevelIndex(0);
                  setSelectedAnswer(null);
                  setScore(0);
                  setMessage("");
                  setGameCompleted(false);
                } else {
                  alert("Failed to update level on server.");
                }
              }}
            >
              Start New Session
            </button>

            <button
              className="action-button action-button-secondary"
              onClick={async () => {
                const success = await updateLevelInBackend(newLevel);
                if (success) {
                  setCurrentLevel(newLevel);
                  updateLocalStorageLevel(newLevel);
                  setLevelIndex(0);
                  setSelectedAnswer(null);
                  setScore(0);
                  setMessage("");
                  setGameCompleted(false);
                  navigate("/games")
                } else {
                  alert("Failed to update level on server.");
                }
              }}
            >
              Return to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionQuestions[levelIndex];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">Math Quest</h1>
        <p className="quiz-subtitle">Level {currentLevel + 1}</p>
      </div>

      <div className="question-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          width="320"
          height="240"
          style={{ display: "none" }}
        />
        <p className="emotion-display">Detected emotion: {expression}</p>
        <p className="question-text">{currentQuestion.question}</p>
        
        <div className="options-grid">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              className={`option-button ${selectedAnswer === opt ? "selected" : ""}`}
              onClick={() => setSelectedAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        
        <button
          onClick={checkAnswer}
          disabled={!selectedAnswer}
          className="submit-button"
        >
          Submit Answer
        </button>
        
        {message && (
          <p className={`feedback-message ${message.includes("✅") ? "feedback-correct" : "feedback-incorrect"}`}>
            {message}
          </p>
        )}
        
        <p className="score-display">Score: {score}</p>
      </div>
    </div>
  );
};

export default QuizGame;