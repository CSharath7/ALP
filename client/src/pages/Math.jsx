import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

// Helper function to get initial level from localStorage
const getInitialLevel = () => {
  const savedLevel = localStorage.getItem('mathQuizLevel');
  return savedLevel ? parseInt(savedLevel) : 0;
};

const adjustLevel = (questionData, currentLevel) => {
  const emotionValues = {
    happy: 2,
    surprised: 1.5,
    neutral: 0,
    sad: -2,
    fear: -2,
    angry: -3,
    disgust: -3,
    contempt: -2.5
  };

  if (!questionData || questionData.length === 0) return currentLevel;

  // Calculate average emotion score
  const emotionTotal = questionData.reduce((sum, q) => {
    const emotionValue = emotionValues[q.emotion] || 0;
    return sum + emotionValue;
  }, 0);
  const avgEmotionScore = emotionTotal / questionData.length;

  // Calculate normalized score (0-1)
  const totalPossibleScore = questionData.length * 10;
  const actualScore = questionData.reduce((sum, q) => sum + q.score, 0);
  const normalizedScore = actualScore / totalPossibleScore;

  // Combine scores (40% emotion, 60% performance)
  const finalScore = (0.4 * (avgEmotionScore + 3) / 6) + (0.6 * normalizedScore);

  // Adjust level based on performance (5 levels: 0-4 representing levels 1-5)
  if (finalScore > 0.7) return Math.min(currentLevel + 1, 4);
  if (finalScore > 0.55) return currentLevel;
  return Math.max(currentLevel - 1, 0);
};

const QuizGame = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [expression, setExpression] = useState("neutral");
  const [message, setMessage] = useState("");
  const [gameCompleted, setGameCompleted] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(getInitialLevel());
  const [questionData, setQuestionData] = useState([]);

  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadQuestionsAndModels = async () => {
      // Load face detection models
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");

      // Load questions
      const response = await fetch("/MathQuest.json");
      const data = await response.json();

      // Ensure currentLevel is within valid range (0-4)
      const safeCurrentLevel = Math.max(0, Math.min(currentLevel, 4));
      const allLevels = [
        data.math.level1, 
        data.math.level2, 
        data.math.level3, 
        data.math.level4, 
        data.math.level5
      ];
      
      const questions = allLevels[safeCurrentLevel];
      
      if (!questions) {
        console.error(`No questions found for level ${safeCurrentLevel + 1}`);
        return;
      }
      
      // Select 5 random questions
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, 5);
      setSessionQuestions(picked);
      setQuestionData([]); // Reset question data for new session

      // Set up webcam
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            runExpressionDetection();
          };
        }
      } catch (err) {
        console.error("Webcam error:", err);
      }
    };

    loadQuestionsAndModels();

    return () => {
      // Clean up interval and webcam on unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentLevel]);

  const runExpressionDetection = () => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection?.expressions) {
        const exp = detection.expressions;
        const maxExp = Object.keys(exp).reduce((a, b) => (exp[a] > exp[b] ? a : b));
        setExpression(maxExp);
      }
    }, 1000);
  };

  const calculateEmotionBonus = () => {
    if (expression === "happy") return 5;
    if (expression === "angry" || expression === "sad") return -2;
    return 0;
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const currentQ = sessionQuestions[levelIndex];
    const isCorrect = selectedAnswer === currentQ.answer;
    const emotionBonus = calculateEmotionBonus();
    let points = 0;

    if (isCorrect) {
      points = 10 + emotionBonus;
      setMessage(
        `✅ Correct! +${points} points${
          emotionBonus !== 0 ? ` (${emotionBonus > 0 ? "+" : ""}${emotionBonus} for ${expression})` : ""
        }`
      );
      setScore(score + points);
    } else {
      setMessage("❌ Incorrect answer");
      setScore(Math.max(0, score - 2));
    }

    // Record question data for level adjustment
    setQuestionData(prev => [
      ...prev,
      {
        question: currentQ.question,
        correct: isCorrect,
        score: isCorrect ? points : -2,
        emotion: expression,
        answer: selectedAnswer,
        correctAnswer: currentQ.answer
      }
    ]);

    // Move to next question or end session
    setTimeout(() => {
      if (levelIndex < sessionQuestions.length - 1) {
        setLevelIndex(levelIndex + 1);
        setSelectedAnswer(null);
        setMessage("");
      } else {
        setGameCompleted(true);
        setMessage("🎉 Session completed!");
      }
    }, 1000);
  };

  if (sessionQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading questions...</p>
      </div>
    );
  }

  if (gameCompleted) {
    const newLevel = adjustLevel(questionData, currentLevel);
    
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-10">
        <h1 className="text-3xl font-bold mb-4">🎉 Session Completed!</h1>
        <p className="text-xl mb-2">Final Score: {score}</p>
        <p className="text-xl mb-4">New Level: {newLevel + 1}</p>
        
        <div className="w-full max-w-2xl mb-8">
          <h2 className="text-xl font-semibold mb-2">Question Details:</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {questionData.map((q, index) => (
              <div key={index} className="p-4 border-b">
                <p className="font-medium">Q{index + 1}: {q.question}</p>
                <p>Your answer: {q.answer} {q.correct ? "✅" : "❌"}</p>
                <p>Correct answer: {q.correctAnswer}</p>
                <p>Emotion: {q.emotion} | Score: {q.score}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => {
            // Save new level to localStorage before starting new session
            localStorage.setItem('mathQuizLevel', newLevel.toString());
            setCurrentLevel(newLevel);
            setGameCompleted(false);
            setLevelIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setMessage("");
          }}
        >
          Start New Session
        </button>
      </div>
    );
  }

  const currentQuestion = sessionQuestions[levelIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <video ref={videoRef} autoPlay muted playsInline style={{ display: "none" }} />

      <div className="max-w-xl mx-auto mt-12 bg-white p-6 rounded-lg shadow text-center">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Math Quiz Game</h1>
          <span className="bg-purple-500 text-white px-3 py-1 rounded-full">
            Level: {currentLevel + 1}
          </span>
        </div>
        
        <p className="mb-2 text-gray-600">
          Score: {score} | Emotion: {expression}
        </p>

        <p className="text-lg mb-4 font-medium">{currentQuestion.question}</p>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                selectedAnswer === option 
                  ? "bg-green-400 text-white border-green-500" 
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          onClick={checkAnswer}
          disabled={!selectedAnswer}
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            selectedAnswer 
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Submit
        </button>

        {message && <p className="mt-4 text-md">{message}</p>}
        <p className="mt-2 text-sm text-gray-500">
          Question {levelIndex + 1} / {sessionQuestions.length}
        </p>
      </div>
    </div>
  );
};

export default QuizGame;