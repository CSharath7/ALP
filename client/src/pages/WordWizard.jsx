import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import '../styles/WordWizard.css';

const WordWizard = () => {
  const levels = [
    {
      name: "CVC Words",
      words: ["cat", "dog", "sun", "hat", "pen", "red", "big", "hot"],
      hintType: "phonics"
    },
    {
      name: "Digraphs",
      words: ["ship", "chat", "fish", "thin", "when", "bath"],
      hintType: "sound-boxes"
    },
    {
      name: "Blends",
      words: ["frog", "step", "crab", "spin", "twin", "glad"],
      hintType: "color-coded"
    }
  ];

  const videoRef = useRef(null);
  const [expression, setExpression] = useState("neutral");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [userLetters, setUserLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState({ text: "", color: "" });
  const [showHint, setShowHint] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [wordChecked, setWordChecked] = useState(false);

  const navigate = useNavigate();

  // Load face-api models and setup camera (hidden)
  useEffect(() => {
    const loadModels = async () => {    
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    };

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = startExpressionDetection;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    loadModels().then(setupCamera);

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startExpressionDetection = async () => {
    if (!videoRef.current) return;

    setInterval(async () => {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        const expressions = detections.expressions;
        const maxExpression = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );
        setExpression(maxExpression);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!gameWon) newWord();
  }, [currentLevel]);

  useEffect(() => {
    if (gameWon) {
      const timer = setTimeout(() => {
        navigate('/games');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameWon, navigate]);

  const newWord = () => {
    const words = levels[currentLevel].words;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setScrambledLetters(shuffleArray([...randomWord]));
    setUserLetters([]);
    setShowHint(false);
    setWordChecked(false);
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleLetterClick = (letter) => {
    if (userLetters.length < currentWord.length) {
      setUserLetters([...userLetters, letter]);
    }
  };

  const calculateEmotionBonus = () => {
    const emotionScores = {
      happy: 5,
      surprised: 3,
      neutral: 1,
      sad: 0,
      angry: 0,
      disgusted: 0,
      fearful: 0
    };
    return emotionScores[expression] || 0;
  };

  const checkWord = () => {
    if (wordChecked) return;

    const userWord = userLetters.join("");
    if (userWord === currentWord) {
      const emotionBonus = calculateEmotionBonus();
      const newScore = score + 10 + (streak * 2) + emotionBonus;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      
      let feedbackText = `Correct! +${10 + streak * 2} points`;
      if (emotionBonus > 0) {
        feedbackText += ` (+${emotionBonus} for ${expression} face)`;
      }
      
      setFeedback({ text: feedbackText, color: "green" });
      setWordChecked(true);

      if (newScore >= (currentLevel + 1) * 50) {
        if (currentLevel < levels.length - 1) {
          setTimeout(() => setCurrentLevel(currentLevel + 1), 1500);
        } else {
          setGameWon(true);
        }
      } else {
        setTimeout(newWord, 1500);
      }
    } else {
      const emotionPenalty = expression === 'frustrated' ? -2 : 0;
      setScore(prev => Math.max(0, prev + emotionPenalty));
      setStreak(0);
      setFeedback({ 
        text: emotionPenalty ? "Try again! (-2 for frustration)" : "Try again!", 
        color: "red" 
      });
    }
  };

  const resetWord = () => {
    setUserLetters([]);
    setFeedback({ text: "", color: "" });
  };

  const getHint = () => {
    setShowHint(true);
    setStreak(0);
  };

  const renderHint = () => {
    switch (levels[currentLevel].hintType) {
      case "phonics":
        return (
          <div className="hint-container">
            {currentWord.split("").map((letter, i) => (
              <span key={i} className="phonics-letter">
                {letter}
              </span>
            ))}
          </div>
        );
      case "sound-boxes":
        return (
          <div className="hint-container">
            {currentWord.match(/sh|ch|th|wh|ph|ck|ng/g) ? (
              <div>
                <span className="digraph">
                  {currentWord.match(/sh|ch|th|wh|ph|ck|ng/g)[0]}
                </span>
                <span>{currentWord.replace(/sh|ch|th|wh|ph|ck|ng/g, '')}</span>
              </div>
            ) : (
              <div>{currentWord}</div>
            )}
          </div>
        );
      case "color-coded":
        return (
          <div className="hint-container">
            {currentWord.split("").map((letter, i) => (
              <span key={i} className={i < 2 ? "blend-start" : "blend-end"}>
                {letter}
              </span>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="word-wizard-container">
      {/* Hidden video element for emotion detection */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="hidden-video"
      ></video>
      
      <div className="emotion-indicator">
        Detected Emotion: {expression}
      </div>

      <div className="header">
        <h1 className="title">Word Wizard 🧙‍♂️</h1>
        <div className="level-indicator">
          Level: {levels[currentLevel].name}
        </div>
      </div>

      {gameWon ? (
        <div className="game-area">
          <h2 className="game-won-title">You're a Word Wizard! 🎉</h2>
          <p className="final-score">
            Final Score: <strong>{score}</strong>
          </p>
          <p className="redirect-message">
            Redirecting to games in 3 seconds...
          </p>
        </div>
      ) : (
        <div className="game-area">
          <div className="score-board">
            <div>Score: <strong>{score}</strong></div>
            <div>Streak: <strong className="streak-indicator">{streak} 🔥</strong></div>
          </div>

          <div className="word-display">
            <div className="user-letters">
              {userLetters.length > 0 ? userLetters.join("") : (
                <span className="placeholder">Build the word...</span>
              )}
            </div>
            <div className={`feedback ${feedback.color}`}>
              {feedback.text}
            </div>
          </div>

          {showHint && renderHint()}

          <div className="letters-container">
            {scrambledLetters.map((letter, index) => (
              <button
                key={index}
                className="letter-button"
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="action-buttons">
            <button className="action-button" onClick={checkWord}>Check</button>
            <button className="action-button hint-button" onClick={getHint}>Get Hint</button>
            <button className="action-button" onClick={resetWord}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordWizard;