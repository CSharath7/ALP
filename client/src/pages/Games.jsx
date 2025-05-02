// import React from "react";
// import { Link } from "react-router-dom";

// export default function Games() {
//   // Dyslexia-friendly styles
//   const dyslexicStyles = {
//     fontFamily: "'Comic Sans MS', 'OpenDyslexic', sans-serif",
//     letterSpacing: "0.05em",
//     lineHeight: "1.6",
//     color: "#333333",
//     textDecoration: "none" // Removes underline
//   };

//   // Game data array
//   const games = [
//     { name: "Shape Pattern", path: "/pattern", color: "bg-indigo-500", icon: "🔵🟡" },
//     { name: "Story Time", path: "/story", color: "bg-green-500", icon: "📖" },
//     { name: "Math Quest", path: "/math", color: "bg-purple-500", icon: "➕➖" },
//     { name: "Memory Puzzle", path: "/Memory", color: "bg-red-500", icon: "🧩" },
//     { name: "Memory Matrix", path: "/MemoryMatrix", color: "bg-blue-500", icon: "🧠" },
//     { name: "Spell Bee", path: "/SpellBee", color: "bg-yellow-500", icon: "🐝" },
//     { name: "Word Wizard", path: "/WordWizard", color: "bg-pink-500", icon: "🧙" },
//     { name: "Word Detective", path: "/WordDetective", color: "bg-orange-500", icon: "🔍" }
//   ];

//   return (
//     <div 
//       className="min-h-screen p-6 bg-gray-50 flex flex-col items-center"
//       style={{ backgroundColor: "#f9f9f9", fontFamily: "'Comic Sans MS', sans-serif" }}
//     >
//       <header className="mb-8 text-center">
//         <h1 
//           className="text-4xl font-bold mb-2"
//           style={{ ...dyslexicStyles, color: "#2b6cb0" }}
//         >
//           Choose Your Game
//         </h1>
//         <p 
//           className="text-xl"
//           style={dyslexicStyles}
//         >
//           Click on a game to start playing!
//         </p>
//       </header>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
//         {games.map((game, index) => (
//           <Link
//             key={index}
//             to={game.path}
//             className={`${game.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center h-40`}
//             style={dyslexicStyles}
//           >
//             <span className="text-3xl mb-2" aria-hidden="true">
//               {game.icon}
//             </span>
//             <span className="text-xl font-semibold text-center">
//               {game.name}
//             </span>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Games.css";

const Games = () => {
  const games = [
    { 
      name: "Shape Pattern", 
      path: "/pattern", 
      color: "bg-indigo-500", 
      icon: "🔵🟡" 
    },
    { 
      name: "Story Time", 
      path: "/story", 
      color: "bg-green-500", 
      icon: "📖" 
    },
    { 
      name: "Math Quest", 
      path: "/math", 
      color: "bg-purple-500", 
      icon: "➕➖" 
    },
    { 
      name: "Memory Puzzle", 
      path: "/Memory", 
      color: "bg-red-500", 
      icon: "🧩" 
    },
    { 
      name: "Memory Matrix", 
      path: "/MemoryMatrix", 
      color: "bg-blue-500", 
      icon: "🧠" 
    },
    { 
      name: "Spell Bee", 
      path: "/SpellBee", 
      color: "bg-yellow-500", 
      icon: "🐝" 
    },
    { 
      name: "Word Wizard", 
      path: "/WordWizard", 
      color: "bg-pink-500", 
      icon: "🧙" 
    },
    { 
      name: "Word Detective", 
      path: "/WordDetective", 
      color: "bg-orange-500", 
      icon: "🔍" 
    }
  ];

  return (
    <div className="games-container">
      <header className="games-header">
        <h1 className="games-title">Choose Your Game</h1>
        <p className="games-subtitle">Click on a game to start playing!</p>
      </header>

      <div className="games-grid">
        {games.map((game, index) => (
          <Link
            key={index}
            to={game.path}
            className={`game-card ${game.color}`}
            aria-label={`Play ${game.name}`}
          >
            <span className="game-icon" aria-hidden="true">
              {game.icon}
            </span>
            <span className="game-name">
              {game.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Games;