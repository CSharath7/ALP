import React, { useState, useEffect } from 'react';

const WordDetective = () => {
  // Dynamic word bank (prevents exact repetition)
  const wordBanks = {
    easy: ['cat', 'dog', 'sun', 'hat', 'pen', 'red', 'big', 'hot', 'sit', 'run'],
    medium: ['ship', 'chat', 'fish', 'thin', 'when', 'bath', 'jump', 'lamp', 'nest', 'wind'],
    hard: ['apple', 'happy', 'water', 'garden', 'jumper', 'butter', 'rabbit', 'yellow', 'little', 'summer']
  };

  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState('easy');

  // Generate a new word (ensures no immediate repetition)
  const generateNewWord = () => {
    const words = wordBanks[level];
    let newWord;
    do {
      newWord = words[Math.floor(Math.random() * words.length)];
    } while (newWord === currentWord);
    
    setCurrentWord(newWord);
    setScrambledWord(scrambleWord(newWord));
    setUserGuess('');
    setFeedback('');
  };

  // Shuffle letters (Fisher-Yates algorithm)
  const scrambleWord = (word) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  };

  // Check the user's answer
  const checkAnswer = () => {
    if (userGuess.toLowerCase() === currentWord) {
      setScore(score + 10);
      setFeedback('✅ Correct! Well done!');
      setTimeout(generateNewWord, 1500);
    } else {
      setFeedback('❌ Try again!');
    }
  };

  // Change difficulty level
  const changeLevel = (newLevel) => {
    setLevel(newLevel);
    generateNewWord();
  };

  // Initialize game
  useEffect(() => {
    generateNewWord();
  }, [level]);

  return (
    <div style={{ fontFamily: 'Comic Sans MS, sans-serif', textAlign: 'center', padding: '20px' }}>
      <h1>🔍 Word Detective</h1>
      <p>Unscramble the letters to find the hidden word!</p>
      
      <div style={{ margin: '20px 0',display:'flex',justifyContent:'space-evenly'
      }}>
        <button onClick={() => changeLevel('easy')}>Easy</button>
        <button onClick={() => changeLevel('medium')}> Medium</button>
        <button onClick={() => changeLevel('hard')}> Hard</button>
      </div>
      
      <div style={{ fontSize: '2rem', letterSpacing: '5px', margin: '20px 0' }}>
        {scrambledWord.split('').map((letter, i) => (
          <span key={i} style={{ 
            display: 'inline-block',
            margin: '0 5px',
            color: /[aeiou]/.test(letter) ? '#FF5252' : '#4285F4'
          }}>
            {letter}
          </span>
        ))}
      </div>
      
      <input
        type="text"
        value={userGuess}
        onChange={(e) => setUserGuess(e.target.value)}
        placeholder="Type the word..."
        style={{ padding: '10px', fontSize: '1.2rem' }}
      />
      
      <button onClick={checkAnswer} style={{ padding: '10px 20px', margin: '10px' }}>
        Check
      </button>
      
      <p style={{ color: feedback.includes('✅') ? 'green' : 'red' }}>{feedback}</p>
      <p>Score: <strong>{score}</strong></p>
    </div>
  );
};

export default WordDetective;