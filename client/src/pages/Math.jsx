import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import * as faceapi from "face-api.js";
import "../styles/QuizGame.css";

const QuizGame = () => {
  const [levels, setLevels] = useState([]);
  const [expression, setExpression] = useState("neutral");
  const [emotions, setEmotions] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [feedback, setFeedback] = useState({ text: "", color: "" });
  const [gameWon, setGameWon] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const gameName = "Math Quest";

  // Emotion detection setup
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      } catch (error) {
        console.error("Error loading face-api models:", error);
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Webcam error:", err);
      }
    };

    loadModels();
    startVideo();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Emotion detection interval
  useEffect(() => {
    if (!gameEnded && !gameWon) {
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;

        try {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detection?.expressions) {
            const exp = detection.expressions;
            const maxExp = Object.keys(exp).reduce((a, b) => 
              exp[a] > exp[b] ? a : b
            );
            if (['happy', 'sad', 'angry', 'fear', 'disgust', 'surprised', 'neutral'].includes(maxExp)) {
              setExpression(maxExp);
              setEmotions(prev => [...prev, maxExp]);
            }
          }
        } catch (err) {
          console.error("Face detection error:", err);
        }
      }, 2000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameEnded, gameWon]);

  // Load game data
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch("/MathQuest.json");
        const data = await res.json();
        setLevels(data.math);
      } catch (error) {
        console.error("Failed to load levels:", error);
        setFeedback({ text: "Failed to load levels", color: "red" });
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  // Initialize current level
  useEffect(() => {
    const fetchLevel = () => {
      try {
        const gameData = JSON.parse(
          localStorage.getItem("game_Math_Quest")
        ) || { currentLevel: 0 }; // Changed default to 0
        const levelFromStorage = Number(gameData.currentLevel) || 0;
        const validLevel = Math.max(
          0,
          Math.min(levelFromStorage, Object.keys(levels).length - 1)
        );
        setCurrentLevel(validLevel);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing localStorage:", error);
        setCurrentLevel(0);
        setLoading(false);
      }
    };
    if (Object.keys(levels).length > 0) {
      fetchLevel();
    }
  }, [levels]);

  // Start game when level is loaded
  useEffect(() => {
    if (currentLevel !== null && !gameWon && !gameEnded && Object.keys(levels).length > 0) {
      selectQuestionsForLevel();
    } else if (Object.keys(levels).length === 0 && !loading) {
      setFeedback({ text: "Error: No levels available!", color: "red" });
      setGameEnded(true);
    }
  }, [currentLevel, levels, gameWon, gameEnded, loading]);

  // Handle game completion
  useEffect(() => {
    if (gameWon || gameEnded) {
      updateBackendLevel(currentLevel);
      const timer = setTimeout(() => {
        navigate("/games");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameWon, gameEnded]);

  const selectQuestionsForLevel = () => {
    if (currentLevel === null || currentLevel < 0 || currentLevel >= Object.keys(levels).length) {
      setFeedback({ text: "Invalid level! Please try again.", color: "red" });
      setGameEnded(true);
      return;
    }

    const levelKey = `level${currentLevel}`; // Removed the +1
    const questions = levels[levelKey] || [];
    if (questions.length === 0) {
      setFeedback({ text: "No questions available for this level!", color: "red" });
      setGameEnded(true);
      return;
    }

    // Select 5 random questions
    const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, 5);
    setCurrentQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setQuestionCount(0);
    setSelectedAnswer(null);
    setScore(0);
    setStreak(0);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const currentQ = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQ.answer;
    setQuestionCount(prev => prev + 1);

    // Emotion-based scoring
    let emotionBonus = 0;
    if (expression === "happy") emotionBonus = 5;
    else if (expression === "angry" || expression === "sad") emotionBonus = -2;

    if (isCorrect) {
      const basePoints = 10;
      const streakBonus = streak * 2;
      const totalPoints = basePoints + streakBonus + emotionBonus;
      
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
      setFeedback({ 
        text: `✅ Correct! +${totalPoints} points ${emotionBonus !== 0 ? `(${emotionBonus > 0 ? '+' : ''}${emotionBonus} emotion)` : ''}`, 
        color: "green" 
      });
    } else {
      setScore(prev => Math.max(0, prev - 2 + emotionBonus));
      setStreak(0);
      setFeedback({ 
        text: `❌ Incorrect ${emotionBonus !== 0 ? `(${emotionBonus > 0 ? '+' : ''}${emotionBonus} emotion)` : ''}`, 
        color: "red" 
      });
    }

    if (questionCount + 1 >= 5) {
      setGameEnded(true);
    } else {
      setTimeout(() => {
        setFeedback({ text: "", color: "" });
        nextQuestion();
      }, 1500);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setGameEnded(true);
    }
  };

  const updateBackendLevel = async (newLevel) => {
    const childId = localStorage.getItem("uid");
    if (!childId) {
      console.error("No child ID found in localStorage");
      return;
    }

    try {
      // Get dominant emotion from session
      const emotionFreq = {};
      emotions.forEach(emo => {
        emotionFreq[emo] = (emotionFreq[emo] || 0) + 1;
      });
      const dominantEmotion = Object.keys(emotionFreq).length > 0
        ? Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0][0]
        : 'neutral';

      const response = await fetch("https://alp-rjd5.onrender.com/update-child-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName,
          currentLevel: newLevel,
          score,
          dominantEmotion,
          emotions,
          childId: localStorage.getItem("id"),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const gameData = JSON.parse(localStorage.getItem("game_Math_Quest")) || {};
        localStorage.setItem(
          "game_Math_Quest",
          JSON.stringify({
            ...gameData,
            currentLevel: data.newLevel,
          })
        );
      }
    } catch (error) {
      console.error("Error updating level:", error);
    }
  };

  const quitGame = async () => {
    setGameEnded(true);
    setGameWon(true);
    await updateBackendLevel(currentLevel);
  };

  if (loading || currentLevel === null) {
    return <div className="quiz-container">Loading Math Quest...</div>;
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      {(gameWon || gameEnded) && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      
      {/* Hidden video element for face detection */}
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        width="1" 
        height="1" 
        style={{ position: 'absolute', visibility: 'hidden' }}
      />

      <div className="emotion-indicator">
        Detected Emotion: <span className="emotion-text">{expression}</span>
      </div>

      <div className="header">
        <h1 className="title">Math Quest</h1>
        <div className="level-indicator">
          Level: {currentLevel + 1}
        </div>
      </div>

      {gameWon || gameEnded ? (
        <div className="game-area">
          <h2 className="game-won-title">
            {gameWon ? "You're a Math Wizard! 🎉" : "Game Over! 🎉"}
          </h2>
          <p className="final-score">
            Final Score: <strong>{score}</strong>
          </p>
          <p className="redirect-message">
            Redirecting to games in 5 seconds...
          </p>
        </div>
      ) : (
        <div className="game-area">
          <div className="score-board">
            <div>
              Score: <strong>{score}</strong>
            </div>
            <div>
              Streak: <strong className="streak-indicator">{streak} 🔥</strong>
            </div>
            <div>
              Questions: <strong>{questionCount}/5</strong>
            </div>
          </div>

          {currentQuestion && (
            <>
              <div className="question-display">
                <p>{currentQuestion.question}</p>
              </div>

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

              <div className={`feedback ${feedback.color}`}>{feedback.text}</div>

              <div className="game-actions">
                <button 
                  className="action-button" 
                  onClick={checkAnswer}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </button>

                <button className="action-button quit-button" onClick={quitGame}>
                  Quit Game
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGame;