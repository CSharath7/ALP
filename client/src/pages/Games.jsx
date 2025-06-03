  import React, { useEffect, useState } from "react";
  import { Link } from "react-router-dom";
  import axios from "axios";
  import "../styles/Games.css";

  const Games = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);  // optional loading state
    const [message, setMessage] = useState("");

    useEffect(() => {
      const fetchGames = async () => {
        const uid = localStorage.getItem("uid");
        try {
          const res = await axios.get(`https://alp-rjd5.onrender.com/child/${uid}`);
          
          const allGameInfo = {
            "Shape Pattern": { path: "/pattern", color: "bg-indigo-500", icon: "🔵🟡" },
            "Story Time": { path: "/story", color: "bg-green-500", icon: "📖" },
            "Math Quest": { path: "/math", color: "bg-purple-500", icon: "➕➖" },
            "Memory Puzzle": { path: "/Memory", color: "bg-red-500", icon: "🧩" },
            "Memory Matrix": { path: "/MemoryMatrix", color: "bg-blue-500", icon: "🧠" },
            "Spell Bee": { path: "/SpellBee", color: "bg-yellow-500", icon: "🐝" },
            "Word Wizard": { path: "/wordwizard", color: "bg-pink-500", icon: "🧙" },
            "Word Detective": { path: "/WordDetective", color: "bg-orange-500", icon: "🔍" }
          };

          const selected = res.data.selectedGames.map(({ name, level }) => ({
            name,
            level,
            ...allGameInfo[name]
          }));

          if (selected.length === 0) {
            setMessage("🎉 You have completed all of your games! Please visit your consulted therapist for further instructions.");
          } else {
            setGames(selected);
          }
        } catch (error) {
          console.error("Failed to fetch games", error);
          setMessage("Something went wrong while loading games.");
        } finally {
          setLoading(false);
        }
      };

      fetchGames();
    }, []);

    return (
      <div className="games-container">
        <h1>Choose Your Game</h1>

        {loading ? (
          <p>Loading...</p>
        ) : message ? (
          <p className="therapy-message">{message}</p>
        ) : (
          <div className="games-grid">
            {games.map((game, index) => (
              <Link key={index} to={game.path} className={`game-card ${game.color}`}>
                <span className="game-icon">{game.icon}</span>
                <span className="game-name">{game.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  export default Games;
