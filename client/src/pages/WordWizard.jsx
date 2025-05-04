// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import FacialExpression from '../components/FacialExpression';
// import '../styles/WordWizard.css';

// const WordWizard = () => {
//   const [levels, setLevels] = useState([]);
//   const [expression, setExpression] = useState("neutral");
//   const [currentLevel, setCurrentLevel] = useState(null);
//   const [currentWord, setCurrentWord] = useState("");
//   const [scrambledLetters, setScrambledLetters] = useState([]);
//   const [userLetters, setUserLetters] = useState([]);
//   const [score, setScore] = useState(0);
//   const [streak, setStreak] = useState(0);
//   const [levelScore, setLevelScore] = useState(0);
//   const [feedback, setFeedback] = useState({ text: "", color: "" });
//   const [showHint, setShowHint] = useState(false);
//   const [gameWon, setGameWon] = useState(false);
//   const [wordChecked, setWordChecked] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchLevels = async () => {
//       try {
//         const res = await fetch('/WordWizard.json');
//         const data = await res.json();
//         setLevels(data);
//       } catch (error) {
//         console.error("Failed to load levels:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLevels();
//   }, []);

//   useEffect(() => {
//     const fetchLevel = async () => {
//       const childId = localStorage.getItem("uid");
//       const savedLevel = localStorage.getItem("level");
//       const initialLevel = savedLevel ? parseInt(savedLevel) : 0;

//       if (!childId) return;

//       try {
//         const res = await fetch(`http://localhost:5000/get-wordwizard-level/${childId}`);
//         const data = await res.json();
//         if (data.success) {
//           const levelFromServer = data.level || 0;
//           setCurrentLevel(levelFromServer > initialLevel ? levelFromServer : initialLevel);
//         } else {
//           setCurrentLevel(initialLevel);
//         }
//       } catch (error) {
//         console.error("Failed to fetch level:", error);
//         setCurrentLevel(initialLevel);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLevel();
//   }, []);

//   useEffect(() => {
//     if (currentLevel !== null && !gameWon) {
//       newWord();
//     }
//   }, [currentLevel]);

//   useEffect(() => {
//     if (gameWon) {
//       const timer = setTimeout(() => {
//         navigate('/games');
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [gameWon, navigate]);

//   const newWord = () => {
//     const words = levels[currentLevel]?.words || [];
//     const randomWord = words[Math.floor(Math.random() * words.length)];
//     setCurrentWord(randomWord);
//     setScrambledLetters(shuffleArray([...randomWord]));
//     setUserLetters([]);
//     setShowHint(false);
//     setWordChecked(false);
//   };

//   const shuffleArray = (array) => {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
//   };

//   const handleLetterClick = (letter) => {
//     if (userLetters.length < currentWord.length) {
//       setUserLetters([...userLetters, letter]);
//     }
//   };

//   const calculateEmotionBonus = () => {
//     const emotionScores = {
//       happy: 5,
//       surprised: 3,
//       neutral: 1,
//       sad: -1,
//       angry: -1,
//       disgusted: -1,
//       fearful: -1
//     };
//     return emotionScores[expression] ?? 0;
//   };

//   const checkWord = () => {
//     if (wordChecked) return;
  
//     const userWord = userLetters.join("");
//     if (userWord === currentWord) {
//       const emotionBonus = calculateEmotionBonus();
//       const baseScore = 10 + (streak * 2);
//       const totalScore = baseScore + emotionBonus;
  
//       const newLevelScore = levelScore + totalScore;
      
//       setScore(prev => Math.max(0, prev + totalScore));
//       setLevelScore(newLevelScore);
//       setStreak(prev => prev + 1);
  
//       let feedbackText = `Correct! +${baseScore} points`;
//       if (emotionBonus !== 0) {
//         feedbackText += ` (${emotionBonus > 0 ? "+" : ""}${emotionBonus} for ${expression} face)`;
//       }
  
//       setFeedback({ text: feedbackText, color: "green" });
//       setWordChecked(true);
  
//       if (newLevelScore >= 50) {
//         if (currentLevel < levels.length - 1) {
//           setTimeout(() => {
//             const newLevel = currentLevel + 1;
//             setCurrentLevel(newLevel);
//             localStorage.setItem("level", newLevel);
//             setLevelScore(0);
//             setStreak(0); // Reset streak when level changes
//           }, 1500);
//         } else {
//           setGameWon(true);
//         }
//       } else {
//         setTimeout(newWord, 1500);
//       }
//     } else {
//       setScore(prev => Math.max(0, prev));
//       setStreak(0);
//       setFeedback({ text: "Try again!", color: "red" });
//       setWordChecked(true);
//       setTimeout(() => {
//         setFeedback({ text: "", color: "" });
//         newWord();
//       }, 1500);
//     }
//   };

//   const resetWord = () => {
//     setUserLetters([]);
//     setFeedback({ text: "", color: "" });
//   };

//   const getHint = () => {
//     setShowHint(true);
//     setStreak(0);
//   };

//   const renderHint = () => {
//     switch (levels[currentLevel]?.hintType) {
//       case "phonics":
//         return (
//           <div className="hint-container">
//             {currentWord.split("").map((letter, i) => (
//               <span key={i} className="phonics-letter">{letter}</span>
//             ))}
//           </div>
//         );
//       case "sound-boxes":
//         const digraphMatch = currentWord.match(/sh|ch|th|wh|ph|ck|ng/g);
//         return (
//           <div className="hint-container">
//             {digraphMatch ? (
//               <div>
//                 <span className="digraph">{digraphMatch[0]}</span>
//                 <span>{currentWord.replace(digraphMatch[0], '')}</span>
//               </div>
//             ) : (
//               <div>{currentWord}</div>
//             )}
//           </div>
//         );
//       case "color-coded":
//         return (
//           <div className="hint-container">
//             {currentWord.split("").map((letter, i) => (
//               <span key={i} className={i < 2 ? "blend-start" : "blend-end"}>
//                 {letter}
//               </span>
//             ))}
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const quitGame = async () => {
//     const childId = localStorage.getItem("uid");
//     if (!childId) {
//       navigate('/games');
//       return;
//     }
//     try {
//       await fetch("http://localhost:5000/update-wordwizard-level", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ childId, level: currentLevel })
//       });
//       navigate('/games');
//     } catch (error) {
//       console.error("Error quitting game:", error);
//       navigate('/games');
//     }
//   };

//   if (loading || currentLevel === null) {
//     return <div className="word-wizard-container">Loading Word Wizard...</div>;
//   }

//   return (
//     <div className="word-wizard-container">
//       <FacialExpression onEmotionDetected={(emo) => setExpression(emo)} />
//       <div className="emotion-indicator">Detected Emotion: {expression}</div>

//       <div className="header">
//         <h1 className="title">Word Wizard 🧙‍♂️</h1>
//         <div className="level-indicator">Level: {levels[currentLevel]?.name || "Loading..."}</div>
//       </div>

//       {gameWon ? (
//         <div className="game-area">
//           <h2 className="game-won-title">You're a Word Wizard! 🎉</h2>
//           <p className="final-score">Final Score: <strong>{score}</strong></p>
//           <p className="redirect-message">Redirecting to games in 3 seconds...</p>
//         </div>
//       ) : (
//         <div className="game-area">
//           <div className="score-board">
//             <div>Score: <strong>{score}</strong></div>
//             <div>Streak: <strong className="streak-indicator">{streak} 🔥</strong></div>
//           </div>

//           <div className="word-display">
//             <div className="user-letters">
//               {userLetters.length > 0 ? userLetters.join("") : (
//                 <span className="placeholder">Build the word...</span>
//               )}
//             </div>
//             <div className={`feedback ${feedback.color}`}>
//               {feedback.text}
//             </div>
//           </div>

//           {showHint && renderHint()}

//           <div className="letter-buttons">
//             {scrambledLetters.map((letter, index) => (
//               <button key={index} className="letter-button" onClick={() => handleLetterClick(letter)}>
//                 {letter}
//               </button>
//             ))}
//           </div>

//           <div className="game-actions">
//             <button className="action-button" onClick={checkWord}>Check Word</button>
//             <button className="action-button" onClick={resetWord}>Reset Word</button>
//             <button className="action-button" onClick={getHint}>Get Hint</button>
//             <button className="action-button quit-button" onClick={quitGame}>Quit Game</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WordWizard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import FacialExpression from '../components/FacialExpression';
import '../styles/WordWizard.css';

const WordWizard = () => {
  const [levels, setLevels] = useState([]);
  const [expression, setExpression] = useState("neutral");
  const [emotions, setEmotions] = useState([]); // Store emotions
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [userLetters, setUserLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0); // Track questions
  const [feedback, setFeedback] = useState({ text: "", color: "" });
  const [showHint, setShowHint] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameEnded, setGameEnded] = useState(false); // Track game end
  const [wordChecked, setWordChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch('/WordWizard.json');
        const data = await res.json();
        setLevels(data);
      } catch (error) {
        console.error("Failed to load levels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  useEffect(() => {
    const fetchLevel = async () => {
      const childId = localStorage.getItem("uid");
      const savedLevel = localStorage.getItem("level");
      const initialLevel = savedLevel ? parseInt(savedLevel) : 0;

      if (!childId) return;

      try {
        const res = await fetch(`http://localhost:5000/get-wordwizard-level/${childId}`);
        const data = await res.json();
        if (data.success) {
          const levelFromServer = data.level || 0;
          setCurrentLevel(levelFromServer > initialLevel ? levelFromServer : initialLevel);
        } else {
          setCurrentLevel(initialLevel);
        }
      } catch (error) {
        console.error("Failed to fetch level:", error);
        setCurrentLevel(initialLevel);
      } finally {
        setLoading(false);
      }
    };
    fetchLevel();
  }, []);

  useEffect(() => {
    if (currentLevel !== null && !gameWon && !gameEnded) {
      newWord();
    }
  }, [currentLevel]);

  useEffect(() => {
    if (gameWon || gameEnded) {
      // Calculate new level and update backend
      const newLevel = adjustLevel(emotions, score, currentLevel || 0);
      updateBackendLevel(newLevel);

      const timer = setTimeout(() => {
        navigate('/games');
      }, 5000); // Extended to show confetti
      return () => clearTimeout(timer);
    }
  }, [gameWon, gameEnded]);

  const newWord = () => {
    const words = levels[currentLevel]?.words || [];
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
    if (wordChecked || gameEnded) return;

    const userWord = userLetters.join("");
    setQuestionCount(prev => prev + 1);

    if (userWord === currentWord) {
      const emotionBonus = calculateEmotionBonus();
      const baseScore = 10 + (streak * 2);
      const totalScore = baseScore + emotionBonus;

      const newLevelScore = levelScore + totalScore;

      setScore(prev => Math.max(0, prev + totalScore));
      setLevelScore(newLevelScore);
      setStreak(prev => prev + 1);

      let feedbackText = `Correct! +${baseScore} points`;
      if (emotionBonus !== 0) {
        feedbackText += ` (${emotionBonus > 0 ? "+" : ""}${emotionBonus} for ${expression} face)`;
      }

      setFeedback({ text: feedbackText, color: "green" });
      setWordChecked(true);

      if (questionCount + 1 >= 5) {
        setGameEnded(true);
      } else if (newLevelScore >= 50) {
        if (currentLevel < levels.length - 1) {
          setTimeout(() => {
            const newLevel = currentLevel + 1;
            setCurrentLevel(newLevel);
            localStorage.setItem("level", newLevel);
            setLevelScore(0);
            setStreak(0);
          }, 1500);
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

      if (questionCount + 1 >= 5) {
        setGameEnded(true);
      } else {
        setTimeout(() => {
          setFeedback({ text: "", color: "" });
          newWord();
        }, 1500);
      }
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
    switch (levels[currentLevel]?.hintType) {
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

  const adjustLevel = (emotionList, score, currentLevel) => {
    const emotionValues = {
      happy: 2,
      surprised: 1.5,
      neutral: 0,
      sad: -2,
      fear: -2,
      anger: -3,
      disgust: -3,
      contempt: -2.5
    };

    if (!emotionList || emotionList.length === 0) {
      console.warn("Emotion list is empty. Keeping current level.");
      return currentLevel;
    }

    let totalEmotionScore = 0;
    for (let emotion of emotionList) {
      totalEmotionScore += emotionValues[emotion] ?? 0;
    }
    const avgEmotionScore = totalEmotionScore / emotionList.length;

    const normalizedScore = score / 100;

    const finalScore = (0.4 * (avgEmotionScore + 3) / 6) + (0.6 * normalizedScore);

    let newLevel = currentLevel;
    if (finalScore > 0.6) {
      newLevel = Math.min(currentLevel + 1, levels.length - 1);
    } else if (finalScore < 0.3) {
      newLevel = Math.max(currentLevel - 1, 0);
    }

    return newLevel;
  };

  const updateBackendLevel = async (newLevel) => {
    const childId = localStorage.getItem("uid");
    if (!childId) {
      console.error("No child ID found in localStorage");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/update-wordwizard-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          gameName: "wordwizard",
          level: newLevel
        })
      });

      if (response.ok) {
        console.log(`[INFO] Successfully updated level to ${newLevel} for child ${childId}`);
      } else {
        console.error("[ERROR] Failed to update level:", response.status);
      }
    } catch (error) {
      console.error("[ERROR] Error updating level:", error);
    }
  };

  const quitGame = async () => {
    const childId = localStorage.getItem("uid");
    if (!childId) {
      navigate('/games');
      return;
    }
    try {
      await fetch("http://localhost:5000/update-wordwizard-level", {
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

  if (loading || currentLevel === null) {
    return <div className="word-wizard-container">Loading Word Wizard...</div>;
  }

  return (
    <div className="word-wizard-container">
      {(gameWon || gameEnded) && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      <FacialExpression
        onEmotionDetected={(emo) => {
          setExpression(emo);
          setEmotions(prev => [...prev, emo]);
        }}
        isActive={!gameWon && !gameEnded}
      />
      <div className="emotion-indicator">Detected Emotion: {expression}</div>

      <div className="header">
        <h1 className="title">Word Wizard 🧙‍♂️</h1>
        <div className="level-indicator">Level: {levels[currentLevel]?.name || "Loading..."}</div>
      </div>

      {gameWon || gameEnded ? (
        <div className="game-area">
          <h2 className="game-won-title">
            {gameWon ? "You're a Word Wizard! 🎉" : "Game Over! 🎉"}
          </h2>
          <p className="final-score">Final Score: <strong>{score}</strong></p>
          <p className="redirect-message">Redirecting to games in 5 seconds...</p>
        </div>
      ) : (
        <div className="game-area">
          <div className="score-board">
            <div>Score: <strong>{score}</strong></div>
            <div>Streak: <strong className="streak-indicator">{streak} 🔥</strong></div>
            <div>Questions: <strong>{questionCount}/5</strong></div>
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