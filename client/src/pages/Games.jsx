import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Games.css";

const Games = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      const uid = localStorage.getItem("uid");
      const res = await axios.get(`http://localhost:5000/child/${uid}`);
      const allGameInfo = {
        "Shape Pattern": { path: "/pattern", color: "bg-indigo-500", icon: "🔵🟡" },
        "Story Time": { path: "/story", color: "bg-green-500", icon: "📖" },
        "Math Quest": { path: "/math", color: "bg-purple-500", icon: "➕➖" },
        "Memory Puzzle": { path: "/Memory", color: "bg-red-500", icon: "🧩" },
        "Memory Matrix": { path: "/MemoryMatrix", color: "bg-blue-500", icon: "🧠" },
        "Spell Bee": { path: "/SpellBee", color: "bg-yellow-500", icon: "🐝" },
        "Word Wizard": { path: "/WordWizard", color: "bg-pink-500", icon: "🧙" },
        "Word Detective": { path: "/WordDetective", color: "bg-orange-500", icon: "🔍" }
      };

      const selected = res.data.selectedGames.map(({ name, level }) => ({
        name,
        level,
        ...allGameInfo[name]
      }));

      setGames(selected);
    };

    fetchGames();
  }, []);

  return (
    <div className="games-container">
      <h1>Choose Your Game</h1>
      <div className="games-grid">
        {games.map((game, index) => (
          <Link key={index} to={game.path} className={`game-card ${game.color}`}>
            <span>{game.icon}</span>
            <span>{game.name} (Level {game.level})</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Games;
