import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import FacialExpression from "../components/FacialExpression";
import "../styles/WordWizard.css";

const WordWizard = () => {
  const [levels, setLevels] = useState([]);
  const [expression, setExpression] = useState("neutral");
  const [emotions, setEmotions] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentWords, setCurrentWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [userLetters, setUserLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [feedback, setFeedback] = useState({ text: "", color: "" });

  const [gameWon, setGameWon] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [wordChecked, setWordChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const latestEmotionRef = useRef("");
  const gameName = "Word Wizard";

  useEffect(() => {
    const interval = setInterval(() => {
      setEmotions((prev) => [...prev, latestEmotionRef.current]);
    }, 2000); // store emotion every 2 seconds

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch("/WordWizard.json");
        const data = await res.json();
        console.log("Loaded levels:", data);
        setLevels(data);
      } catch (error) {
        console.error("Failed to load levels:", error);
        setFeedback({ text: "Failed to load levels", color: "red" });
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  useEffect(() => {
    const fetchLevel = () => {
      try {
        const gameData = JSON.parse(
          localStorage.getItem("game_Word_Wizard")
        ) || { currentLevel: 1 };
        const levelFromStorage = Number(gameData.currentLevel) || 1;
        const validLevel = Math.max(
          0,
          Math.min(levelFromStorage - 1, levels.length - 1)
        );
        console.log(
          "Setting currentLevel from localStorage:",
          validLevel,
          "Levels length:",
          levels.length
        );
        setCurrentLevel(validLevel);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing localStorage:", error);
        setFeedback({ text: "Error loading level data", color: "red" });
        setCurrentLevel(0);
        setLoading(false);
      }
    };
    if (levels.length > 0) {
      fetchLevel();
    }
  }, [levels.length]);

  useEffect(() => {
    if (currentLevel !== null && !gameWon && !gameEnded && levels.length > 0) {
      console.log("Initializing game for level:", currentLevel);
      selectWordsForLevel();
    } else if (levels.length === 0 && !loading) {
      console.error("No levels loaded");
      setFeedback({ text: "Error: No levels available!", color: "red" });
      setGameEnded(true);
    }
  }, [currentLevel, levels, gameWon, gameEnded, loading]);

  useEffect(() => {
    if (gameWon || gameEnded) {
      console.log(
        "Game ended. Emotions:",
        emotions,
        "Score:",
        score,
        "Current Level:",
        currentLevel
      );
    
      updateBackendLevel(currentLevel);
   
      const timer = setTimeout(() => {
        console.log("Redirecting to /games");
        navigate("/games");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameWon, gameEnded]);

  const selectWordsForLevel = () => {
    console.log("Selecting words for level:", currentLevel);
    if (
      currentLevel === null ||
      currentLevel < 0 ||
      currentLevel >= levels.length
    ) {
      console.error(
        "Invalid currentLevel:",
        currentLevel,
        "Levels length:",
        levels.length
      );
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

    // Select 5 random words
    const shuffledWords = shuffleArray([...words]);
    const selectedWords = shuffledWords.slice(
      0,
      Math.min(5, shuffledWords.length)
    );
    console.log("Selected words:", selectedWords);
    setCurrentWords(selectedWords);
    setCurrentWordIndex(0);
    setQuestionCount(0);

    if (selectedWords.length > 0) {
      setCurrentWord(selectedWords[0]);
      setScrambledLetters(shuffleArray([...selectedWords[0]]));
      setUserLetters([]);
      
      setWordChecked(false);
      console.log("First word set:", selectedWords[0]);
    } else {
      console.error("No words selected for level:", currentLevel);
      setFeedback({ text: "Error selecting words!", color: "red" });
      setGameEnded(true);
    }
  };

  const newWord = () => {
    console.log(
      "Moving to next word. Current index:",
      currentWordIndex,
      "Total words:",
      currentWords.length
    );
    if (currentWordIndex + 1 < currentWords.length) {
      const nextWord = currentWords[currentWordIndex + 1];
      setCurrentWord(nextWord);
      setScrambledLetters(shuffleArray([...nextWord]));
      setUserLetters([]);

      
      setWordChecked(false);
      setCurrentWordIndex((prev) => prev + 1);
      console.log("Next word set:", nextWord);
    } else {
      console.log("No more words, ending game");
      setGameEnded(true);
    }
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
    if (wordChecked || gameEnded) return;

    const userWord = userLetters.join("");
    setQuestionCount((prev) => prev + 1);
    console.log("Checking word:", userWord, "against:", currentWord);

    if (userWord === currentWord) {
     
      const baseScore = 10 + streak * 2;
      const totalScore = baseScore;

      const newLevelScore = levelScore + totalScore;

      setScore((prev) => Math.max(0, prev + totalScore));
      setLevelScore(newLevelScore);
      setStreak((prev) => prev + 1);

      let feedbackText = `Correct! +${baseScore} points`;
      
      setFeedback({ text: feedbackText, color: "green" });
      setWordChecked(true);

      if (questionCount + 1 >= 5) {
        console.log("Completed 5 questions, ending game");
        setGameEnded(true);
      } else {
        setTimeout(() => {
          setFeedback({ text: "", color: "" });
          newWord();
        }, 1500);
      }
    } else {
      setScore((prev) => Math.max(0, prev));
      setStreak(0);
      setFeedback({ text: "Try again!", color: "red" });
      setWordChecked(true);

      if (questionCount + 1 >= 5) {
        console.log("Completed 5 questions, ending game");
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

 


   

 

  const updateBackendLevel = async (newLevel) => {
    const childId = localStorage.getItem("uid");
    if (!childId) {
      console.error("No child ID found in localStorage");
      return;
    }

    try {
      // Send request to /update-child-level
      const levelResponse = await fetch(
        "https://alp-rjd5.onrender.com/update-child-level",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emotions,
            gameName,
            score,
            childId: localStorage.getItem("id"),
          }),
        }
      );

      if (levelResponse.ok) {
        const data = await levelResponse.json();
        console.log(
          `[INFO] Successfully updated level from ${currentLevel} to ${data.newLevel} for game ${gameName}`
        );
        const gameData =
          JSON.parse(localStorage.getItem("game_Word_Wizard")) || {};

        localStorage.setItem(
          "game_Word_Wizard",
          JSON.stringify({
            ...gameData,
            currentLevel: data.newLevel,
          })
        );
      } else {
        console.error("[ERROR] Failed to update level:", levelResponse.status);
      }

      navigate("/games");
    } catch (error) {
      console.error("Error quitting game:", error);
      navigate("/games");
    }
     
  
  };

  

  const quitGame = async () => {
    console.log(
      "Quitting game. Emotions:",
      emotions,
      "Current Level:",
      currentLevel
    );
    setGameEnded(true);
    setGameWon(true);
    const childId = localStorage.getItem("uid");
    if (!childId) {
      navigate("/games");
      return;
    }

    try {
      // Send request to /update-child-level
      const levelResponse = await fetch(
        "https://alp-rjd5.onrender.com/update-child-level",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emotions,
            gameName,
            score,
            childId: localStorage.getItem("id"),
          }),
        }
      );


      if (levelResponse.ok) {
        const data = await levelResponse.json();
        console.log(
          `[INFO] Successfully updated level from ${currentLevel} to ${data.newLevel} for game ${gameName}`
        ); 
        const gameData =
          JSON.parse(localStorage.getItem("game_Word_Wizard")) || {};
         
        localStorage.setItem(
          "game_Word_Wizard",
          JSON.stringify({
            ...gameData,
            currentLevel: data.newLevel, 
          })
        );
      } else {
        console.error("[ERROR] Failed to update level:", levelResponse.status);
      }

      
   
      navigate("/games");
    } catch (error) {
      console.error("Error quitting game:", error);
      navigate("/games");
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
          latestEmotionRef.current = emo; // always update latest emotion
          setExpression(emo); // update UI display
        }}
        isActive={!gameWon && !gameEnded}
      />

      <div className="emotion-indicator">Detected Emotion: {expression}</div>

      <div className="header">
        <h1 className="title">Word Wizard 🧙‍♂️</h1>
        <div className="level-indicator">
          Level: {levels[currentLevel]?.name || "Loading..."}
        </div>
      </div>

      {gameWon || gameEnded ? (
        <div className="game-area">
          <h2 className="game-won-title">
            {gameWon ? "You're a Word Wizard! 🎉" : "Game Over! 🎉"}
          </h2>
          <p className="final-score">
            Final Score: <strong>{score}</strong>
          </p>
          <p className="redirect-message">
            Redirecting to games in 5 seconds...
          </p>
        </div>
      ) : (
        <div className="game-area">
          <div className="score-board">
            <div>
              Score: <strong>{score}</strong>
            </div>
            <div>
              Streak: <strong className="streak-indicator">{streak} 🔥</strong>
            </div>
            <div>
              Questions: <strong>{questionCount}/5</strong>
            </div>
          </div>

          <div className="word-display">
            <div className="user-letters">
              {userLetters.length > 0 ? (
                userLetters.join("")
              ) : (
                <span className="placeholder">Build the word...</span>
              )}
            </div>
            <div className={`feedback ${feedback.color}`}>{feedback.text}</div>
          </div>

          <div className="letter-buttons">
            {scrambledLetters.map((letter, index) => (
              <button
                key={index}
                className="letter-button"
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="game-actions">
            <button className="action-button" onClick={checkWord}>
              Check Word
            </button>
            <button className="action-button" onClick={resetWord}>
              Reset Word
            </button>

            <button className="action-button quit-button" onClick={quitGame}>
              Quit Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordWizard;
