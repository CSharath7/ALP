// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Confetti from 'react-confetti';
// import FacialExpression from '../components/FacialExpression';
// import '../styles/WordWizard.css';

// const WordWizard = () => {
//   const [levels, setLevels] = useState([]);
//   const [expression, setExpression] = useState("neutral");
//   const [emotions, setEmotions] = useState([]); // Store emotions
//   const [currentLevel, setCurrentLevel] = useState(null);
//   const [currentWord, setCurrentWord] = useState("");
//   const [scrambledLetters, setScrambledLetters] = useState([]);
//   const [userLetters, setUserLetters] = useState([]);
//   const [score, setScore] = useState(0);
//   const [streak, setStreak] = useState(0);
//   const [levelScore, setLevelScore] = useState(0);
//   const [questionCount, setQuestionCount] = useState(0); // Track questions
//   const [feedback, setFeedback] = useState({ text: "", color: "" });
//   const [showHint, setShowHint] = useState(false);
//   const [gameWon, setGameWon] = useState(false);
//   const [gameEnded, setGameEnded] = useState(false); // Track game end
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
//   const gameName = "Word Wizard";

//   useEffect(() => {
//     const fetchLevel = async () => {
//       const childId = localStorage.getItem("uid");
//       // const savedLevel = localStorage.getItem("level");
//       const initialLevel = savedLevel ? parseInt(savedLevel) : 0;

//       if (!childId) return;

//       try {
//         const res = await fetch(`http://localhost:5000/getlevel/${childId}/${gameName}`);
//         const data = await res.json();
//         if (data.success) {
//           const levelFromServer = data.currentLevel || 0;
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
//     if (currentLevel !== null && !gameWon && !gameEnded) {
//       newWord();
//     }
//   }, [currentLevel]);

//   useEffect(() => {
//     if (gameWon || gameEnded) {
//       // Calculate new level and update backend
//       emotions.forEach((ele) => { console.log(ele) });
//       const newLevel = adjustLevel(emotions, score, currentLevel || 0);
//       updateBackendLevel(newLevel);

//       const timer = setTimeout(() => {
//         navigate('/games');
//       }, 5000); // Extended to show confetti
//       return () => clearTimeout(timer);
//     }
//   }, [gameWon, gameEnded]);

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
//     if (wordChecked || gameEnded) return;

//     const userWord = userLetters.join("");
//     setQuestionCount(prev => prev + 1);

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

//       if (questionCount + 1 >= 5) {
//         setGameEnded(true);
//       } else if (newLevelScore >= 50) {
//         if (currentLevel < levels.length - 1) {
//           setTimeout(() => {
//             const newLevel = currentLevel + 1;
//             setCurrentLevel(newLevel);
//             localStorage.setItem("level", newLevel);
//             setLevelScore(0);
//             setStreak(0);
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

//       if (questionCount + 1 >= 5) {
//         setGameEnded(true);
//       } else {
//         setTimeout(() => {
//           setFeedback({ text: "", color: "" });
//           newWord();
//         }, 1500);
//       }
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

//   const adjustLevel = (emotionList, score, currentLevel) => {
//     const emotionValues = {
//       happy: 2,
//       surprised: 1.5,
//       neutral: 0,
//       sad: -2,
//       fear: -2,
//       anger: -3,
//       disgust: -3,
//       contempt: -2.5
//     };

//     if (!emotionList || emotionList.length === 0) {
//       console.warn("Emotion list is empty. Keeping current level.");
//       return currentLevel;
//     }

//     let totalEmotionScore = 0;
//     for (let emotion of emotionList) {
//       totalEmotionScore += emotionValues[emotion] ?? 0;
//     }
//     const avgEmotionScore = totalEmotionScore / emotionList.length;

//     const normalizedScore = score / 100;

//     const finalScore = (0.4 * (avgEmotionScore + 3) / 6) + (0.6 * normalizedScore);

//     let newLevel = currentLevel;
//     if (finalScore > 0.6) {
//       newLevel = Math.min(currentLevel + 1, levels.length - 1);
//     } else if (finalScore < 0.3) {
//       newLevel = Math.max(currentLevel - 1, 0);
//     }

//     return newLevel;
//   };

//   const calculateDominantEmotions = (emotions) => {
//     if (!emotions || emotions.length === 0) {
//       return { maxEmotion: "neutral", minEmotion: "neutral" };
//     }

//     // Count frequency of each emotion
//     const emotionCounts = emotions.reduce((acc, emotion) => {
//       acc[emotion] = (acc[emotion] || 0) + 1;
//       return acc;
//     }, {});

//     // Convert to array of [emotion, count] pairs
//     const emotionEntries = Object.entries(emotionCounts);

//     // Find max and min counts
//     const maxCount = Math.max(...emotionEntries.map(([, count]) => count));
//     const minCount = Math.min(...emotionEntries.map(([, count]) => count));

//     // Get all emotions with max/min counts
//     const maxEmotions = emotionEntries
//       .filter(([, count]) => count === maxCount)
//       .map(([emotion]) => emotion)
//       .sort(); // Sort alphabetically for consistency
//     const minEmotions = emotionEntries
//       .filter(([, count]) => count === minCount)
//       .map(([emotion]) => emotion)
//       .sort();

//     // Return the first max/min emotion (alphabetically)
//     return {
//       maxEmotion: maxEmotions[0] || "neutral",
//       minEmotion: minEmotions[0] || "neutral",
//     };
//   };

//   const updateBackendLevel = async (newLevel) => {
//     const childId = localStorage.getItem("uid");
//     if (!childId) {
//       console.error("No child ID found in localStorage");
//       return;
//     }

//     // Calculate max and min emotions
//     const { maxEmotion, minEmotion } = calculateDominantEmotions(emotions);

//     try {
//       const response = await fetch("http://localhost:5000/updatelevel", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           childId,
//           gameName: "Word Wizard",
//           level: newLevel,
//           maxEmotion,
//           minEmotion,
//           score,
//         }),
//       });

//       if (response.ok) {
//         console.log(`[INFO] Successfully updated level to ${newLevel} for child ${childId}`);
//       } else {
//         console.error("[ERROR] Failed to update level:", response.status);
//       }
//     } catch (error) {
//       console.error("[ERROR] Error updating level:", error);
//     }
//   };

//   const quitGame = async () => {
//     console.log("Emotions on quit:", emotions); // Log emotions array
//     setGameEnded(true); // Stop FacialExpression camera
//     const childId = localStorage.getItem("uid");
//     if (!childId) {
//       navigate('/games');
//       return;
//     }

//     // Calculate max and min emotions
//     const { maxEmotion, minEmotion } = calculateDominantEmotions(emotions);

//     try {
//       await fetch("http://localhost:5000/updatelevel", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           childId,
//           gameName: "Word Wizard",
//           level: currentLevel,
//           maxEmotion,
//           minEmotion,
//           score,
//         }),
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
//       {(gameWon || gameEnded) && (
//         <Confetti width={window.innerWidth} height={window.innerHeight} />
//       )}
//       <FacialExpression
//         onEmotionDetected={(emo) => {
//           setExpression(emo);
//           setEmotions(prev => [...prev, emo]);
//         }}
//         isActive={!gameWon && !gameEnded}
//       />
//       <div className="emotion-indicator">Detected Emotion: {expression}</div>

//       <div className="header">
//         <h1 className="title">Word Wizard 🧙‍♂️</h1>
//         <div className="level-indicator">Level: {levels[currentLevel]?.name || "Loading..."}</div>
//       </div>

//       {gameWon || gameEnded ? (
//         <div className="game-area">
//           <h2 className="game-won-title">
//             {gameWon ? "You're a Word Wizard! 🎉" : "Game Over! 🎉"}
//           </h2>
//           <p className="final-score">Final Score: <strong>{score}</strong></p>
//           <p className="redirect-message">Redirecting to games in 5 seconds...</p>
//         </div>
//       ) : (
//         <div className="game-area">
//           <div className="score-board">
//             <div>Score: <strong>{score}</strong></div>
//             <div>Streak: <strong className="streak-indicator">{streak} 🔥</strong></div>
//             <div>Questions: <strong>{questionCount}/5</strong></div>
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
  const [emotions, setEmotions] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [userLetters, setUserLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [feedback, setFeedback] = useState({ text: "", color: "" });
  const [showHint, setShowHint] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [wordChecked, setWordChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const gameName = "Word Wizard";

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch('/WordWizard.json');
        const data = await res.json();
        console.log("Loaded levels:", data);
        setLevels(data);
      } catch (error) {
        console.error("Failed to load levels:", error);
        setFeedback({ text: "Failed to load levels", color: "red" });
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  useEffect(() => {
    const fetchLevel = async () => {
      const childId = localStorage.getItem("uid");
      console.log("childId:", childId, "Type:", typeof childId);
      if (!childId) {
        console.warn("No childId found in localStorage");
        setFeedback({ text: "No user ID found", color: "red" });
        setCurrentLevel(0); // Default to level 0
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/getlevel/${childId}/${gameName}`);
        const data = await res.json();
        console.log("Backend response:", data);
        if (data.success) {
          const levelFromServer = Number(data.currentLevel) || 0;
          const validLevel = Math.max(0, Math.min(levelFromServer, levels.length - 1));
          console.log("Setting currentLevel:", validLevel);
          setCurrentLevel(validLevel);
        } else {
          console.warn("Backend error:", data.message);
          setFeedback({ text: `Error: ${data.message}`, color: "red" });
          setCurrentLevel(0); // Default to level 0
        }
      } catch (error) {
        console.error("Failed to fetch level:", error);
        setFeedback({ text: "Failed to connect to server", color: "red" });
        setCurrentLevel(0); // Default to level 0
      } finally {
        setLoading(false);
      }
    };
    fetchLevel();
  }, [levels.length]);

  useEffect(() => {
    if (currentLevel !== null && !gameWon && !gameEnded && levels.length > 0) {
      console.log("Calling newWord with currentLevel:", currentLevel);
      newWord();
    } else if (levels.length === 0 && !loading) {
      console.error("No levels loaded");
      setFeedback({ text: "Error: No levels available!", color: "red" });
      setGameEnded(true);
    }
  }, [currentLevel, levels, gameWon, gameEnded, loading]);

  useEffect(() => {
    if (gameWon || gameEnded) {
      emotions.forEach((ele) => console.log("Emotion:", ele));
      const newLevel = adjustLevel(emotions, score, currentLevel || 0);
      updateBackendLevel(newLevel);
      const timer = setTimeout(() => {
        navigate('/games');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameWon, gameEnded]);

  const newWord = () => {
    if (currentLevel === null || currentLevel < 0 || currentLevel >= levels.length) {
      console.error("Invalid currentLevel:", currentLevel, "Levels length:", levels.length);
      setFeedback({ text: "Invalid level! Please try again.", color: "red" });
      setGameEnded(true);
      return;
    }

    const words = levels[currentLevel]?.words || [];
    if (words.length === 0) {
      console.error("No words available for level:", currentLevel);
      setFeedback({ text: "No words available for this level!", color: "red" });
      setGameEnded(true);
      return;
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    if (!randomWord) {
      console.error("Random word is undefined for level:", currentLevel);
      setFeedback({ text: "Error selecting word!", color: "red" });
      setGameEnded(true);
      return;
    }

    console.log("Selected word:", randomWord);
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
            updateBackendLevel(newLevel); // Update backend on level change
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

  const calculateDominantEmotions = (emotions) => {
    if (!emotions || emotions.length === 0) {
      return { maxEmotion: "neutral", minEmotion: "neutral" };
    }

    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    const emotionEntries = Object.entries(emotionCounts);
    const maxCount = Math.max(...emotionEntries.map(([, count]) => count));
    const minCount = Math.min(...emotionEntries.map(([, count]) => count));

    const maxEmotions = emotionEntries
      .filter(([, count]) => count === maxCount)
      .map(([emotion]) => emotion)
      .sort();
    const minEmotions = emotionEntries
      .filter(([, count]) => count === minCount)
      .map(([emotion]) => emotion)
      .sort();

    return {
      maxEmotion: maxEmotions[0] || "neutral",
      minEmotion: minEmotions[0] || "neutral",
    };
  };

  const updateBackendLevel = async (newLevel) => {
    const childId = localStorage.getItem("uid");
    if (!childId) {
      console.error("No child ID found in localStorage");
      return;
    }

    const { maxEmotion, minEmotion } = calculateDominantEmotions(emotions);

    try {
      const response = await fetch("http://localhost:5000/updatelevel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          gameName: "Word Wizard",
          level: newLevel,
          maxEmotion,
          minEmotion,
          score,
        }),
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
    console.log("Emotions on quit:", emotions);
    setGameEnded(true);
    const childId = localStorage.getItem("uid");
    if (!childId) {
      navigate('/games');
      return;
    }

    const { maxEmotion, minEmotion } = calculateDominantEmotions(emotions);

    try {
      await fetch("http://localhost:5000/updatelevel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          gameName: "Word Wizard",
          level: currentLevel || 0,
          maxEmotion,
          minEmotion,
          score,
        }),
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