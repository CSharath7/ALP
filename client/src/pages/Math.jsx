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

const updateLocalStorageLevel = (newLevel) => {
  const saved = localStorage.getItem("game_Math_Quest");
  let data = { currentLevel: newLevel };
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.assignedLevel !== undefined) {
        data.assignedLevel = parsed.assignedLevel;
      }
    } catch { }
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

  const emotionTotal = questionData.reduce((sum, q) => {
    const emotionValue = emotionValues[q.dominantEmotion] || 0;
    return sum + emotionValue;
  }, 0);
  const avgEmotionScore = emotionTotal / questionData.length;

  const totalPossibleScore = questionData.length * 10;
  const actualScore = questionData.reduce((sum, q) => sum + q.score, 0);
  const normalizedScore = actualScore / totalPossibleScore;

  const finalScore = (0.4 * (avgEmotionScore + 3) / 6) + (0.6 * normalizedScore);

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
  const [currentEmotions, setCurrentEmotions] = useState([]);
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
      if (!questions) return;

      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, 5);
      setSessionQuestions(picked);
      setQuestionData([]);
      setCurrentEmotions([]);
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

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detection?.expressions) {
          const exp = detection.expressions;
          const maxExp = Object.keys(exp).reduce((a, b) => (exp[a] > exp[b] ? a : b));
          // Only set valid emotions
          if (['happy', 'sad', 'angry', 'fear', 'disgust', 'surprised', 'neutral'].includes(maxExp)) {
            setExpression(maxExp);
            setCurrentEmotions((prev) => [...prev, maxExp]);
          }
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }
    }, 1000);
  };

  const calculateEmotionBonus = () => {
    if (expression === "happy") return 5;
    if (expression === "angry" || expression === "sad") return -2;
    return 0;
  };

  const getDominantAndLeast = (emotions) => {
    const freq = {};
    const validEmotions = ['happy', 'sad', 'angry', 'fear', 'disgust', 'surprised', 'neutral'];

    // Filter only valid emotions and count frequencies
    emotions.filter(e => validEmotions.includes(e)).forEach(emo => {
      freq[emo] = (freq[emo] || 0) + 1;
    });

    // If no valid emotions, default to neutral
    if (Object.keys(freq).length === 0) {
      return ['neutral', 'neutral'];
    }

    const entries = Object.entries(freq);
    const sortedByFrequency = entries.sort((a, b) => b[1] - a[1]);

    const dominant = sortedByFrequency[0][0];
    const least = sortedByFrequency[sortedByFrequency.length - 1][0];

    return [dominant, least];
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const currentQ = sessionQuestions[levelIndex];
    const isCorrect = selectedAnswer === currentQ.answer;
    const emotionBonus = calculateEmotionBonus();
    let points = 0;

    if (isCorrect) {
      points = 10 + emotionBonus;
      setMessage(`✅ Correct! +${points} points`);
      setScore(score + points);
    } else {
      setMessage("❌ Incorrect answer");
      setScore(Math.max(0, score - 2));
    }

    const [dominant, least] = getDominantAndLeast(currentEmotions);

    setQuestionData((prev) => [
      ...prev,
      {
        question: currentQ.question,
        correct: isCorrect,
        score: isCorrect ? points : -2,
        emotion: expression,
        dominantEmotion: dominant,
        leastEmotion: least,
        answer: selectedAnswer,
        correctAnswer: currentQ.answer,
      },
    ]);

    setCurrentEmotions([]); // Reset for next question

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
      return res.ok;
    } catch (err) {
      console.error("Failed to update backend level:", err);
      return false;
    }
  };

  const sendDominantDataToBackend = async () => {
    const emotionFreq = {};
    const validEmotions = ['happy', 'sad', 'angry', 'fear', 'disgust', 'surprised', 'neutral'];

    // Process all questions and count valid emotions
    questionData.forEach(q => {
      if (q.dominantEmotion && validEmotions.includes(q.dominantEmotion)) {
        emotionFreq[q.dominantEmotion] = (emotionFreq[q.dominantEmotion] || 0) + 1;
      }
    });

    // Default to neutral if no valid emotions found
    const dominantEmotion = Object.keys(emotionFreq).length > 0
      ? Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0][0]
      : 'neutral';

    const leastEmotion = Object.keys(emotionFreq).length > 0
      ? Object.entries(emotionFreq).sort((a, b) => a[1] - b[1])[0][0]
      : 'neutral';

    try {
      console.log(dominantEmotion, leastEmotion, score);
      await fetch("http://localhost:5000/save-session-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your-valid-token",
        },
        body: JSON.stringify({
          gameName: "Math Quest",
          level: currentLevel,
          dominantEmotion,
          leastEmotion,
          score,
          id: localStorage.getItem("id"),
        }),
      });
    } catch (err) {
      console.error("Failed to send dominant/least emotion:", err);
    }
  };

  if (sessionQuestions.length === 0) {
    return <div className="loading-container"><p>Loading questions...</p></div>;
  }

  if (gameCompleted) {
    const newLevel = adjustLevel(questionData, currentLevel);

    return (
      <div className="quiz-container">
        <div className="completion-container">
          <h1>🎉 Session Completed!</h1>
          <p className="score-display">Final Score: {score}</p>
          <p className="emotion-display">New Level: {newLevel + 1}</p>
          <div className="question-details">
            {questionData.map((q, i) => (
              <div className="question-detail" key={i}>
                <p><strong>Q{i + 1}:</strong> {q.question}</p>
                <p>Your Answer: {q.answer} {q.correct ? "✅" : "❌"}</p>
                <p>Correct Answer: {q.correctAnswer}</p>
                <p>Dominant: {q.dominantEmotion}, Least: {q.leastEmotion}, Score: {q.score}</p>
              </div>
            ))}
          </div>
          <div className="action-buttons">
            <button className="action-button action-button-primary" onClick={async () => {
              const success = await updateLevelInBackend(newLevel);
              await sendDominantDataToBackend();
              if (success) {
                updateLocalStorageLevel(newLevel);
                setCurrentLevel(newLevel);
              }
              setGameCompleted(false);
            }}>
              Start New Session
            </button>

            <button className="action-button action-button-secondary" onClick={async () => {
              const success = await updateLevelInBackend(newLevel);
              await sendDominantDataToBackend();
              if (success) {
                updateLocalStorageLevel(newLevel);
                setCurrentLevel(newLevel);
                navigate("/games");
              }
            }}>
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
        <h1>Math Quest</h1>
        <p>Level {currentLevel + 1}</p>
      </div>
      <video ref={videoRef} autoPlay muted width="320" height="240" style={{ display: "none" }} />
      <p>Detected Emotion: {expression}</p>
      <p>{currentQuestion.question}</p>
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
      <button onClick={checkAnswer} disabled={!selectedAnswer} className="submit-button">
        Submit Answer
      </button>
      {message && <p>{message}</p>}
      <p>Score: {score}</p>
    </div>
  );
};

export default QuizGame;
