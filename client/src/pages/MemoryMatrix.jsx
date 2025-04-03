import React, { useState, useEffect } from 'react';

const MemoryMatrix = () => {
  const [gridSize, setGridSize] = useState(3);
  const [targetPattern, setTargetPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [gameState, setGameState] = useState('memorize'); // 'memorize' | 'recall' | 'result'
  const [score, setScore] = useState(0);

  // Generate a new random pattern
  const generatePattern = () => {
    const pattern = [];
    const totalTiles = gridSize * gridSize;
    const numActive = Math.floor(totalTiles * 0.4); // 40% of tiles lit
    
    while (pattern.length < numActive) {
      const randomTile = Math.floor(Math.random() * totalTiles);
      if (!pattern.includes(randomTile)) {
        pattern.push(randomTile);
      }
    }
    return pattern;
  };

  // Start a new round
  const startNewRound = () => {
    setTargetPattern(generatePattern());
    setUserPattern([]);
    setGameState('memorize');
    
    setTimeout(() => {
      setGameState('recall');
    }, 2000 + (gridSize * 500)); // More time for larger grids
  };

  // Handle tile click during recall
  const handleTileClick = (tileIndex) => {
    if (gameState !== 'recall') return;
    
    const newPattern = [...userPattern, tileIndex];
    setUserPattern(newPattern);
    
    // Check if pattern is complete
    if (newPattern.length === targetPattern.length) {
      const isCorrect = targetPattern.every(tile => newPattern.includes(tile));
      setGameState('result');
      setScore(score + (isCorrect ? 10 : 0));
      
      setTimeout(() => {
        if (isCorrect && score % 30 === 0) {
          setGridSize(Math.min(gridSize + 1, 6)); // Increase difficulty
        }
        startNewRound();
      }, 2000);
    }
  };

  // Initialize game
  useEffect(() => {
    startNewRound();
  }, [gridSize]);

  return (
    <div style={{ fontFamily: 'Comic Sans MS, sans-serif', textAlign: 'center', padding: '20px' }}>
      <h1>🧠 Memory Matrix</h1>
      <p>Memorize the pattern and recreate it!</p>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 60px)`,
        gap: '10px',
        justifyContent: 'center',
        margin: '20px auto',
        maxWidth: '400px'
      }}>
        {Array(gridSize * gridSize).fill().map((_, index) => (
          <div
            key={index}
            onClick={() => handleTileClick(index)}
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: 
                gameState === 'memorize' && targetPattern.includes(index) ? '#4CAF50' :
                gameState === 'recall' && userPattern.includes(index) ? '#FFC107' :
                '#E0E0E0',
              borderRadius: '5px',
              cursor: gameState === 'recall' ? 'pointer' : 'default',
              transition: 'background-color 0.3s'
            }}
          />
        ))}
      </div>
      
      <p>Score: <strong>{score}</strong></p>
      <p>Grid Size: {gridSize}x{gridSize}</p>
      
      {gameState === 'result' && (
        <p style={{ color: userPattern.length === targetPattern.length ? 'green' : 'red' }}>
          {userPattern.length === targetPattern.length ? '✅ Perfect!' : '❌ Try again!'}
        </p>
      )}
    </div>
  );
};

export default MemoryMatrix;