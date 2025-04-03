import React, { useState } from "react";

const shapes = ["🔺", "🔵", "🟡", "🟥", "🔶"];
const levels = [
  { pattern: ["🔺", "🔺", "?"], answer: "🔺" },
  { pattern: ["🔵", "🔺", "🔵", "?"], answer: "🔺" },
  { pattern: ["🟡", "🔺", "🟡", "🔺", "?"], answer: "🟡" },
];

export default function Pattern() {
  const [level, setLevel] = useState(0);
  const [selectedShape, setSelectedShape] = useState(null);
  const [message, setMessage] = useState("");

  const checkAnswer = () => {
    if (selectedShape === levels[level].answer) {
      setMessage("Correct! Moving to next level.");
      setTimeout(() => {
        if (level < levels.length - 1) {
          setLevel(level + 1);
          setMessage("");
        } else {
          setMessage("🎉 You completed all levels!");
        }
      }, 1000);
    } else {
      setMessage("Try again!");
    }
  };

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
