import React, { useState, useEffect } from 'react';

const SoundMatch = () => {
  const wordPairs = [
    { sound: 'sh', words: ['ship', 'shop', 'shoe', 'fish', 'wish'] },
    { sound: 'ch', words: ['chat', 'chip', 'chin', 'rich', 'much'] },
    { sound: 'th', words: ['thin', 'thick', 'math', 'bath', 'with'] },
    { sound: 'bl', words: ['black', 'blank', 'blink', 'table', 'bubble'] }
  ];

  const [currentSound, setCurrentSound] = useState('');
  const [targetWords, setTargetWords] = useState([]);
  const [userSelections, setUserSelections] = useState([]);
  const [score, setScore] = useState(0);

  // Initialize new round
  const newRound = () => {
    const randomPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    setCurrentSound(randomPair.sound);
    
    // Mix target words with distractors
    const allWords = [...randomPair.words];
    while (allWords.length < 8) {
      const otherPairs = wordPairs.filter(p => p.sound !== randomPair.sound);
      const randomOtherPair = otherPairs[Math.floor(Math.random() * otherPairs.length)];
      const randomWord = randomOtherPair.words[Math.floor(Math.random() * randomOtherPair.words.length)];
      if (!allWords.includes(randomWord)) {
        allWords.push(randomWord);
      }
    }
    
    setTargetWords(shuffleArray(allWords));
    setUserSelections([]);
  };

  // Handle word selection
  const handleWordClick = (word) => {
    if (userSelections.includes(word)) return;
    
    const newSelections = [...userSelections, word];
    setUserSelections(newSelections);
    
    // Check if all correct words are selected
    const correctWords = wordPairs.find(p => p.sound === currentSound).words;
    const allCorrectSelected = correctWords.every(w => newSelections.includes(w));
    const anyWrongSelected = newSelections.some(w => !correctWords.includes(w));
    
    if (allCorrectSelected && !anyWrongSelected) {
      setScore(score + 10);
      setTimeout(newRound, 1500);
    } else if (newSelections.length >= correctWords.length) {
      setTimeout(() => setUserSelections([]), 1000);
    }
  };

  // Initialize game
  useEffect(() => {
    newRound();
  }, []);

  return (
    <div style={{ fontFamily: 'Comic Sans MS, sans-serif', textAlign: 'center', padding: '20px' }}>
      <h1>🎵 Sound Match</h1>
      <p>Find all words that start/end with: <strong>{currentSound}</strong></p>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        margin: '20px auto',
        maxWidth: '500px'
      }}>
        {targetWords.map((word, i) => (
          <button
            key={i}
            onClick={() => handleWordClick(word)}
            style={{
              padding: '10px',
              backgroundColor: userSelections.includes(word) ? 
                (wordPairs.find(p => p.sound === currentSound).words.includes(word) ? '#4CAF50' : '#F44336') : 
                '#E0E0E0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {word}
          </button>
        ))}
      </div>
      
      <p>Score: <strong>{score}</strong></p>
    </div>
  );
};

export default SoundMatch;