import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacialExpression from '../components/FacialExpression'; // Import your new component
import '../styles/WordWizard.css';

const WordWizard = () => {
  const levels = [
    { name: "CVC Words", words: ["cat", "dog", "sun", "hat", "pen", "red", "big", "hot"], hintType: "phonics" },
    { name: "Digraphs", words: ["ship", "chat", "fish", "thin", "when", "bath"], hintType: "sound-boxes" },
    { name: "Blends", words: ["frog", "step", "crab", "spin", "twin", "glad"], hintType: "color-coded" }
  ];

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
      sad: -1,
      angry: -1,
      disgusted: -1,
      fearful: -1
    };
    return emotionScores[expression] ?? 0;
  };

  const checkWord = () => {
    if (wordChecked) return;

    const userWord = userLetters.join("");
    if (userWord === currentWord) {
      const emotionBonus = calculateEmotionBonus();
      const baseScore = 10 + (streak * 2);
      const totalScore = baseScore + emotionBonus;

      setScore(prev => Math.max(0, prev + totalScore));
      setStreak(prev => prev + 1);

      let feedbackText = `Correct! +${baseScore} points`;
      if (emotionBonus !== 0) {
        feedbackText += ` (${emotionBonus > 0 ? "+" : ""}${emotionBonus} for ${expression} face)`;
      }

      setFeedback({ text: feedbackText, color: "green" });
      setWordChecked(true);

      if (score + totalScore >= (currentLevel + 1) * 50) {
        if (currentLevel < levels.length - 1) {
          setTimeout(() => setCurrentLevel(currentLevel + 1), 1500);
        } else {
          setGameWon(true);
        }
      } else {
        setTimeout(newWord, 1500);
      }
    } else {
      setScore(prev => Math.max(0, prev));
      setStreak(0);
      setFeedback({ text: "Try again!", color: "red" });
      setWordChecked(true);
      setTimeout(() => {
        setFeedback({ text: "", color: "" });
        newWord();
      }, 1500);
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
              <span key={i} className="phonics-letter">{letter}</span>
            ))}
          </div>
        );
      case "sound-boxes":
        const digraphMatch = currentWord.match(/sh|ch|th|wh|ph|ck|ng/g);
        return (
          <div className="hint-container">
            {digraphMatch ? (
              <div>
                <span className="digraph">{digraphMatch[0]}</span>
                <span>{currentWord.replace(digraphMatch[0], '')}</span>
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

  const quitGame = async () => {
    const childId = localStorage.getItem("uid");
    if (!childId) {
      navigate('/games');
      return;
    }
    try {
      await fetch("/update-wordwizard-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, level: currentLevel })
      });
      navigate('/games');
    } catch (error) {
      console.error("Error quitting game:", error);
      navigate('/games');
    }
  };

  return (
    <div className="word-wizard-container">
      <FacialExpression onEmotionDetected={(emo) => setExpression(emo)} />
      <div className="emotion-indicator">Detected Emotion: {expression}</div>

      <div className="header">
        <h1 className="title">Word Wizard 🧙‍♂️</h1>
        <div className="level-indicator">Level: {levels[currentLevel]?.name || "Loading..."}</div>
      </div>

      {gameWon ? (
        <div className="game-area">
          <h2 className="game-won-title">You're a Word Wizard! 🎉</h2>
          <p className="final-score">Final Score: <strong>{score}</strong></p>
          <p className="redirect-message">Redirecting to games in 3 seconds...</p>
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

          <div className="letter-buttons">
            {scrambledLetters.map((letter, index) => (
              <button key={index} className="letter-button" onClick={() => handleLetterClick(letter)}>
                {letter}
              </button>
            ))}
          </div>

          <div className="game-actions">
            <button className="action-button" onClick={checkWord}>Check Word</button>
            <button className="action-button" onClick={resetWord}>Reset Word</button>
            <button className="action-button" onClick={getHint}>Get Hint</button>
            <button className="action-button quit-button" onClick={quitGame}>Quit Game</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordWizard;
