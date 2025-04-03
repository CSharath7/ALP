import React, { useState, useEffect } from 'react';

const Story = () => {
  const wordCategories = {
    characters: ['astronaut', 'dragon', 'robot', 'pirate', 'wizard'],
    places: ['forest', 'castle', 'spaceship', 'island', 'cave'],
    objects: ['key', 'map', 'crystal', 'book', 'sword'],
    actions: ['discovered', 'solved', 'rescued', 'built', 'found']
  };

  const [targetWords, setTargetWords] = useState([]);
  const [userStory, setUserStory] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Generate new target words
  const generateNewWords = () => {
    const newWords = [];
    Object.keys(wordCategories).forEach(category => {
      const words = wordCategories[category];
      let randomWord;
      do {
        randomWord = words[Math.floor(Math.random() * words.length)];
      } while (newWords.includes(randomWord));
      newWords.push(randomWord);
    });
    setTargetWords(newWords);
    setUserStory('');
    setFeedback('');
  };

  // Check story for target words
  const checkStory = () => {
    const usedWords = targetWords.filter(word => 
      userStory.toLowerCase().includes(word.toLowerCase())
    );
    const newScore = usedWords.length * 5;
    setScore(score + newScore);
    setFeedback(
      `You used ${usedWords.length}/4 words: ${usedWords.join(', ')}`
    );
    setTimeout(generateNewWords, 3000);
  };

  // Initialize game
  useEffect(() => {
    generateNewWords();
  }, []);

  return (
    <div style={{ fontFamily: 'Comic Sans MS, sans-serif', textAlign: 'center', padding: '20px' }}>
      <h1>📖 Story Builder</h1>
      <p>Use these words in a story:</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px',
        margin: '20px 0',
        flexWrap: 'wrap'
      }}>
        {targetWords.map((word, i) => (
          <span key={i} style={{ 
            padding: '5px 10px',
            backgroundColor: '#E3F2FD',
            borderRadius: '5px'
          }}>
            {word}
          </span>
        ))}
      </div>
      
      <textarea
        value={userStory}
        onChange={(e) => setUserStory(e.target.value)}
        placeholder="Write your story here..."
        style={{ 
          width: '80%',
          height: '150px',
          padding: '10px',
          fontSize: '1.1rem'
        }}
      />
      
      <button 
        onClick={checkStory}
        style={{ padding: '10px 20px', margin: '10px' }}
      >
        Check Story
      </button>
      
      <p>Score: <strong>{score}</strong></p>
      {feedback && <p style={{ color: '#4CAF50' }}>{feedback}</p>}
    </div>
  );
};

export default Story;