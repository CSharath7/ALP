import React, { useState, useEffect } from "react";
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
      const newLevel = adjustLevel(emotions, score, currentLevel || 0);
      updateBackendLevel(newLevel);
      saveSessionStats(newLevel);
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
      setShowHint(false);
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
      setShowHint(false);
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

  const calculateEmotionBonus = () => {
    const emotionScores = {
      happy: 5,
      surprised: 3,
      neutral: 1,
      sad: -1,
      angry: -1,
      disgusted: -1,
      fearful: -1,
    };
    return emotionScores[expression] ?? 0;
  };

  const checkWord = () => {
    if (wordChecked || gameEnded) return;

    const userWord = userLetters.join("");
    setQuestionCount((prev) => prev + 1);
    console.log("Checking word:", userWord, "against:", currentWord);

    if (userWord === currentWord) {
      const emotionBonus = calculateEmotionBonus();
      const baseScore = 10 + streak * 2;
      const totalScore = baseScore + emotionBonus;

      const newLevelScore = levelScore + totalScore;

      setScore((prev) => Math.max(0, prev + totalScore));
      setLevelScore(newLevelScore);
      setStreak((prev) => prev + 1);

      let feedbackText = `Correct! +${baseScore} points`;
      if (emotionBonus !== 0) {
        feedbackText += ` (${
          emotionBonus > 0 ? "+" : ""
        }${emotionBonus} for ${expression} face)`;
      }

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
              <span key={i} className="phonics-letter">
                {letter}
              </span>
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
                <span>{currentWord.replace(digraphMatch[0], "")}</span>
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
      contempt: -2.5,
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

    const finalScore =
      (0.4 * (avgEmotionScore + 3)) / 6 + 0.6 * normalizedScore;

    let newLevel = currentLevel;
    if (finalScore > 0.6) {
      newLevel = Math.min(currentLevel + 1, levels.length - 1);
    } else if (finalScore < 0.3) {
      newLevel = Math.max(currentLevel - 1, 0);
    }

    console.log("Adjusted level:", newLevel, "Final score:", finalScore);
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

    try {
      // Update localStorage
      const gameData =
        JSON.parse(localStorage.getItem("game_Word_Wizard")) || {};
      localStorage.setItem(
        "game_Word_Wizard",
        JSON.stringify({
          ...gameData,
          currentLevel: newLevel + 1, // Store as 1-based index
        })
      );
      console.log("Updated localStorage with level:", newLevel + 1);

      // Send request to /update-child-level
      const levelResponse = await fetch(
        "http://localhost:5000/update-child-level",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameName,
            currentLevel: newLevel,
            id:localStorage.getItem("id")
          }),
        }
      );

      if (levelResponse.ok) {
        console.log(
          `[INFO] Successfully updated level to ${newLevel} for game ${gameName}`
        );
      } else {
        console.error("[ERROR] Failed to update level:", levelResponse.status);
      }
    } catch (error) {
      console.error("[ERROR] Error updating level:", error);
    }
  };

  const saveSessionStats = async (level) => {
    const childId = localStorage.getItem("id");
    if (!childId) {
      console.error("No child ID found in localStorage");
      return;
    }

    const { maxEmotion, minEmotion } = calculateDominantEmotions(emotions);

    try {
      const statsResponse = await fetch("http://localhost:5000/save-session-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName,
          level,
          dominantEmotion: maxEmotion,
          leastEmotion: minEmotion,
          score,
          id: childId,
        }),
      });

      if (statsResponse.ok) {
        console.log(
          `[INFO] Successfully saved session stats for child ${childId}`
        );
      } else {
        console.error(
          "[ERROR] Failed to save session stats:",
          statsResponse.status
        );
      }
    } catch (error) {
      console.error("[ERROR] Error saving session stats:", error);
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
    const childId = localStorage.getItem("uid");
    if (!childId) {
      navigate("/games");
      return;
    }

    try {
      // Update localStorage
      const gameData =
        JSON.parse(localStorage.getItem("game_Word_Wizard")) || {};
      localStorage.setItem(
        "game_Word_Wizard",
        JSON.stringify({
          ...gameData,
          currentLevel: currentLevel + 1, // Store as 1-based index
        })
      );
      console.log("Updated localStorage on quit with level:", currentLevel + 1);

      // Send request to /update-child-level
      const levelResponse = await fetch(
        "http://localhost:5000/update-child-level",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameName,
            currentLevel,
          }),
        }
      );

      if (levelResponse.ok) {
        console.log(
          `[INFO] Successfully updated level to ${currentLevel} for game ${gameName}`
        );
      } else {
        console.error("[ERROR] Failed to update level:", levelResponse.status);
      }

      // Send request to /save-session-stats
      await saveSessionStats(currentLevel);
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
          setExpression(emo);
          setEmotions((prev) => [...prev, emo]);
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

          {showHint && renderHint()}

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
            <button className="action-button" onClick={getHint}>
              Get Hint
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
