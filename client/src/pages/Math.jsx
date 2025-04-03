import React, { useState } from "react";

const levels = [
  { question: "2 + 3 = ?", options: ["4", "5", "6"], answer: "5" },
  { question: "5 - 2 = ?", options: ["3", "1", "4"], answer: "3" },
  { question: "3 x 3 = ?", options: ["6", "12", "9"], answer: "9" },
  { question: "12 / 4 = ?", options: ["3", "2", "4"], answer: "3" },
  { question: "15 + 7 = ?", options: ["22", "23", "23"], answer: "22" },
];

export default function Math() {
  const [level, setLevel] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [message, setMessage] = useState("");

  const checkAnswer = () => {
    if (selectedAnswer === levels[level].answer) {
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
      <h1 className="text-2xl font-bold mb-4">Math Adventure Quest</h1>
      <p className="text-lg mb-4">{levels[level].question}</p>
      <div className="flex space-x-3 mb-4">
        {levels[level].options.map((option, index) => (
          <button
            key={index}
            className={`px-4 py-2 border-2 rounded-lg ${
              selectedAnswer === option ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => setSelectedAnswer(option)}
          >
            {option}
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
