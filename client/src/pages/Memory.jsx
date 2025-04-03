import React, { useState, useEffect } from 'react';

const Memory = () => {
  // Game symbols - using simple, distinct shapes and colors
  const symbols = [
    { id: 1, char: '🔴', color: '#FF5252' }, // Red circle
    { id: 2, char: '🔵', color: '#4285F4' }, // Blue circle
    { id: 3, char: '🟡', color: '#FFD600' }, // Yellow circle
    { id: 4, char: '🟢', color: '#0F9D58' }, // Green circle
    { id: 5, char: '⭐', color: '#FFC107' }, // Star
    { id: 6, char: '🟣', color: '#9C27B0' }, // Purple circle
  ];

  // Game state
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, uniqueId: index }));

    setCards(cardPairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  // Handle card click
  const handleCardClick = (id) => {
    // Don't allow flipping if already flipped or matched
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) {
      return;
    }

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    // If two cards are flipped, check for a match
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.uniqueId === firstId);
      const secondCard = cards.find(card => card.uniqueId === secondId);

      if (firstCard.id === secondCard.id) {
        // Match found
        setMatched([...matched, firstId, secondId]);
        setFlipped([]);
        
        // Check if all cards are matched
        if (matched.length + 2 === cards.length) {
          setGameWon(true);
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  // Dyslexia-friendly styling
  const styles = {
    container: {
      fontFamily: '"Comic Sans MS", "OpenDyslexic", sans-serif',
      backgroundColor: '#f0f8ff', // Light blue background
      minHeight: '100vh',
      padding: '20px',
      color: '#333',
      lineHeight: '1.6',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#4b6a88',
      marginBottom: '20px',
      textAlign: 'center',
    },
    gameBoard: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px',
      maxWidth: '500px',
      margin: '0 auto',
    },
    card: {
      height: '80px',
      width: '80px',
      borderRadius: '10px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '2.5rem',
      cursor: 'pointer',
      backgroundColor: '#fff',
      border: '3px solid #4b6a88',
      transition: 'all 0.3s ease',
      userSelect: 'none',
    },
    cardFlipped: {
      backgroundColor: '#ffeb99', // Light yellow
    },
    cardMatched: {
      backgroundColor: '#a8e6cf', // Light green
      cursor: 'default',
    },
    controls: {
      margin: '20px 0',
      textAlign: 'center',
    },
    button: {
      padding: '12px 24px',
      fontSize: '1.2rem',
      backgroundColor: '#4b6a88',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      margin: '10px',
    },
    info: {
      fontSize: '1.5rem',
      margin: '20px 0',
      color: '#4b6a88',
    },
    winMessage: {
      fontSize: '2rem',
      color: '#4b6a88',
      fontWeight: 'bold',
      margin: '20px 0',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Memory Match Game</h1>
      
      <div style={styles.info}>Moves: {moves}</div>
      
      {gameWon && (
        <div style={styles.winMessage}>
          Congratulations! You won in {moves} moves! 🎉
        </div>
      )}
      
      <div style={styles.gameBoard}>
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.uniqueId);
          const isMatched = matched.includes(card.uniqueId);
          
          return (
            <div
              key={card.uniqueId}
              style={{
                ...styles.card,
                ...(isFlipped || isMatched ? styles.cardFlipped : {}),
                ...(isMatched ? styles.cardMatched : {}),
                ...(isFlipped || isMatched ? { color: card.color } : {}),
              }}
              onClick={() => handleCardClick(card.uniqueId)}
            >
              {(isFlipped || isMatched) ? card.char : '?'}
            </div>
          );
        })}
      </div>
      
      <div style={styles.controls}>
        <button style={styles.button} onClick={initializeGame}>
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default Memory;