import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const checkWord = () => {
    if (wordChecked) return; // Prevent rechecking same word

    const userWord = userLetters.join("");
    if (userWord === currentWord) {
      const newScore = score + 10 + (streak * 2);
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setFeedback({ text: `Correct! +${10 + streak * 2} points`, color: "green" });
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
      setStreak(0);
      setFeedback({ text: "Try again!", color: "red" });
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
          <div style={{ fontSize: "1.5rem", margin: "10px 0" }}>
            {currentWord.split("").map((letter, i) => (
              <span key={i} style={{
                borderBottom: "2px solid #4b6a88",
                margin: "0 5px",
                padding: "0 5px"
              }}>{letter}</span>
            ))}
          </div>
        );
      case "sound-boxes":
        return (
          <div style={{ fontSize: "1.5rem", margin: "10px 0" }}>
            {currentWord.match(/sh|ch|th|wh|ph|ck|ng/g) ? (
              <div>
                <span style={{ color: "#FF5252" }}>
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
          <div style={{ fontSize: "1.5rem", margin: "10px 0" }}>
            {currentWord.split("").map((letter, i) => (
              <span key={i} style={{
                color: i < 2 ? "#4285F4" : "#0F9D58",
                fontWeight: "bold"
              }}>
                {letter}
              </span>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const styles = {
    container: {
      fontFamily: '"Comic Sans MS", "OpenDyslexic", sans-serif',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh',
      padding: '20px',
      color: '#333',
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#4b6a88',
      marginBottom: '10px',
    },
    gameArea: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    lettersContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px',
      margin: '20px 0',
    },
    letterButton: {
      fontSize: '1.8rem',
      padding: '10px',
      minWidth: '50px',
      backgroundColor: '#e0f7fa',
      border: '2px solid #4b6a88',
      borderRadius: '8px',
      cursor: 'pointer',
      userSelect: 'none',
    },
    userLetters: {
      fontSize: '2rem',
      letterSpacing: '5px',
      margin: '20px 0',
      fontWeight: 'bold',
    },
    feedback: {
      fontSize: '1.5rem',
      color: (feedback.color === "green" ? '#0F9D58' : '#FF5252'),
      margin: '10px 0',
      minHeight: '30px',
    },
    scoreBoard: {
      display: 'flex',
      justifyContent: 'space-around',
      margin: '20px 0',
      fontSize: '1.3rem',
    },
    button: {
      padding: '12px 24px',
      fontSize: '1.2rem',
      backgroundColor: '#4b6a88',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      margin: '0 10px',
      fontFamily: '"Comic Sans MS", sans-serif',
    },
    hintButton: {
      backgroundColor: '#FFC107',
    },
    levelIndicator: {
      backgroundColor: '#4b6a88',
      color: 'white',
      padding: '5px 15px',
      borderRadius: '20px',
      display: 'inline-block',
    },
    streakIndicator: {
      color: '#FFD600',
      fontWeight: 'bold',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Word Wizard 🧙‍♂️</h1>
        <div style={styles.levelIndicator}>
          Level: {levels[currentLevel].name}
        </div>
      </div>

      {gameWon ? (
        <div style={styles.gameArea}>
          <h2 style={{ textAlign: 'center', color: '#4b6a88' }}>You're a Word Wizard! 🎉</h2>
          <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>
            Final Score: <strong>{score}</strong>
          </p>
          <p style={{ textAlign: 'center', fontSize: '1rem', color: '#666' }}>
            Redirecting to games in 3 seconds...
          </p>
        </div>
      ) : (
        <div style={styles.gameArea}>
          <div style={styles.scoreBoard}>
            <div>Score: <strong>{score}</strong></div>
            <div>Streak: <strong style={styles.streakIndicator}>{streak} 🔥</strong></div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={styles.userLetters}>
              {userLetters.length > 0 ? userLetters.join("") : (
                <span style={{ color: '#aaa' }}>Build the word...</span>
              )}
            </div>
            <div style={styles.feedback}>
              {feedback.text}
            </div>
          </div>

          {showHint && renderHint()}

          <div style={styles.lettersContainer}>
            {scrambledLetters.map((letter, index) => (
              <button
                key={index}
                style={styles.letterButton}
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button style={styles.button} onClick={checkWord}>Check</button>
            <button style={{ ...styles.button, ...styles.hintButton }} onClick={getHint}>Get Hint</button>
            <button style={styles.button} onClick={resetWord}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default WordWizard;
