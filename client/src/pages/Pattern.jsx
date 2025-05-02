import React, { useState, useEffect } from "react";

const shapes = ["🔺", "🔵", "🟡", "🟥", "🔶"];

export default function Pattern() {
  const [levels, setLevels] = useState([]);
  const [level, setLevel] = useState(0);
  const [selectedShape, setSelectedShape] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/question.json")
      .then((response) => response.json())
      .then((data) => {
        setLevels(data.pattern);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  }, []);

  const checkAnswer = () => {
    if (!levels.length) return; // Wait until levels loaded
    if (selectedShape === levels[level].answer) {
      setMessage("Correct! Moving to next level.");
      setTimeout(() => {
        if (level < levels.length - 1) {
          setLevel(level + 1);
          setMessage("");
          setSelectedShape(null);
        } else {
          setMessage("🎉 You completed all levels!");
        }
      }, 1000);
    } else {
      setMessage("Try again!");
    }
  };

  if (!levels.length) {
    return <div>Loading...</div>; // Show loading until data is fetched
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 h-screen">
      <h1 className="text-2xl font-bold mb-4">Shape Pattern Recognition</h1>
      <div className="text-4xl flex space-x-2 mb-4">
        {levels[level].pattern.map((shape, index) => (
          <span key={index}>{shape}</span>
        ))}
      </div>
      <div className="flex space-x-3 mb-4">
        {shapes.map((shape, index) => (
          <button
            key={index}
            className={`text-3xl p-2 rounded-lg border-2 ${
              selectedShape === shape ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => setSelectedShape(shape)}
          >
            {shape}
          </button>
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        onClick={checkAnswer}
      >
        Submit
      </button>
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}
