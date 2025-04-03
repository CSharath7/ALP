import React, { useState, useEffect } from 'react';

const SpellBee = () => {
  // Dyslexia-friendly word lists organized by difficulty
  const wordBanks = {
    easy: ['cat', 'dog', 'sun', 'hat', 'pen', 'cup', 'bed', 'box'],
    medium: ['tree', 'fish', 'moon', 'bird', 'rain', 'star', 'cake', 'boat'],
    advanced: ['apple', 'happy', 'water', 'garden', 'jumper', 'butter', 'rabbit', 'yellow']
  };

  // Game state
  const [currentLevel, setCurrentLevel] = useState('easy');
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [hintUsed, setHintUsed] = useState(false);

  // Initialize game
  useEffect(() => {
    startNewWord();
  }, [currentLevel]);

  // Start a new word challenge
  const startNewWord = () => {
    const words = wordBanks[currentLevel];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setScrambledWord(scrambleWord(randomWord));
    setUserInput('');
    setFeedback('');
    setHintUsed(false);
  };

  // Scramble the word
  const scrambleWord = (word) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Handle user input
  const handleInputChange = (e) => {
    setUserInput(e.target.value.toLowerCase());
  };

  // Check the answer
  const checkAnswer = () => {
    if (userInput === currentWord) {
      // Correct answer
      const newScore = score + (hintUsed ? 5 : 10);
      setScore(newScore);
      setFeedback('Correct! Well done! 🎉');
      
      // Check if all words in level are completed
      if (newScore >= 30 && currentLevel === 'easy') {
        setCurrentLevel('medium');
      } else if (newScore >= 60 && currentLevel === 'medium') {
        setCurrentLevel('advanced');
      } else if (newScore >= 100 && currentLevel === 'advanced') {
        setGameStatus('won');
      } else {
        setTimeout(startNewWord, 1500);
      }
    } else {
      // Wrong answer
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback(`Try again! The word starts with "${currentWord[0]}"`);
      
      if (newLives <= 0) {
        setGameStatus('lost');
      }
    }
  };

  // Provide a hint
  const giveHint = () => {
    if (!hintUsed) {
      setHintUsed(true);
      setFeedback(`Hint: The word rhymes with "${findRhyme(currentWord)}"`);
    }
  };

  // Find a rhyming word (simplified)
  const findRhyme = (word) => {
    const rhymes = {
      'cat': 'bat', 'dog': 'log', 'sun': 'fun', 'hat': 'mat',
      'tree': 'bee', 'fish': 'dish', 'moon': 'spoon', 'bird': 'word',
      'apple': 'grapple', 'happy': 'snappy', 'water': 'daughter', 'garden': 'pardon'
    };
    return rhymes[word] || word;
  };

  // Reset game
  const resetGame = () => {
    setCurrentLevel('easy');
    setScore(0);
    setLives(3);
    setGameStatus('playing');
    startNewWord();
  };

  // Dyslexia-friendly styling
  const styles = {
    container: {
      fontFamily: '"Comic Sans MS", "OpenDyslexic", sans-serif',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh',
      padding: '20px',
      color: '#333',
      lineHeight: '1.8',
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
    wordDisplay: {
      fontSize: '3rem',
      letterSpacing: '5px',
      margin: '20px 0',
      color: '#4b6a88',
      fontWeight: 'bold',
      minHeight: '80px',
    },
    inputContainer: {
      margin: '25px 0',
    },
    input: {
      fontSize: '1.8rem',
      padding: '10px 15px',
      width: '100%',
      maxWidth: '400px',
      borderRadius: '8px',
      border: '3px solid #4b6a88',
      fontFamily: '"Comic Sans MS", sans-serif',
      textAlign: 'center',
    },
    button: {
      padding: '12px 24px',
      fontSize: '1.2rem',
      backgroundColor: '#4b6a88',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      margin: '10px',
      fontFamily: '"Comic Sans MS", sans-serif',
    },
    feedback: {
      fontSize: '1.5rem',
      minHeight: '50px',
      margin: '20px 0',
      color: '#d35400',
    },
    scoreBoard: {
      display: 'flex',
      justifyContent: 'space-around',
      margin: '20px 0',
      fontSize: '1.3rem',
    },
    levelIndicator: {
      backgroundColor: '#4b6a88',
      color: 'white',
      padding: '5px 15px',
      borderRadius: '20px',
      display: 'inline-block',
      marginBottom: '15px',
    },
    gameOver: {
      fontSize: '2rem',
      color: '#4b6a88',
      fontWeight: 'bold',
      margin: '20px 0',
    },
    hintButton: {
      backgroundColor: '#ff9f43',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Spelling Adventure</h1>
        <div style={styles.levelIndicator}>
          Level: {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
        </div>
      </div>

      {gameStatus === 'playing' ? (
        <div style={styles.gameArea}>
          <div style={styles.scoreBoard}>
            <div>Score: <strong>{score}</strong></div>
            <div>Lives: <strong>{'❤️'.repeat(lives)}</strong></div>
          </div>

          <div style={styles.wordDisplay}>
            {scrambledWord.split('').map((letter, index) => (
              <span key={index} style={{ 
                display: 'inline-block',
                width: '40px',
                textAlign: 'center',
                transform: 'rotate(' + (Math.random() * 30 - 15) + 'deg)',
                margin: '0 5px'
              }}>
                {letter}
              </span>
            ))}
          </div>

          <div style={styles.inputContainer}>
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              style={styles.input}
              autoFocus
              placeholder="Type the correct word"
            />
          </div>

          <div style={styles.feedback}>
            {feedback}
          </div>

          <div>
            <button style={styles.button} onClick={checkAnswer}>
              Check Answer
            </button>
            <button style={{...styles.button, ...styles.hintButton}} onClick={giveHint} disabled={hintUsed}>
              {hintUsed ? 'Hint Used' : 'Get Hint'}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.gameArea}>
          <div style={styles.gameOver}>
            {gameStatus === 'won' ? (
              <>
                <h2>Congratulations! 🏆</h2>
                <p>You completed all levels with a score of {score}!</p>
              </>
            ) : (
              <>
                <h2>Game Over</h2>
                <p>Your final score: {score}</p>
              </>
            )}
          </div>
          <button style={styles.button} onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SpellBee;