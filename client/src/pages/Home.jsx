// Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const HomePage = () => {
  const navigate = useNavigate();

  // Features for children
  const childFeatures = [
    {
      icon: "😊",
      title: "Emotion-Aware",
      desc: "Detects frustration or joy to adjust difficulty",
      color: "linear-gradient(135deg, #FF9E80 0%, #FF7043 100%)"
    },
    {
      icon: "📈",
      title: "Smart Adaptation",
      desc: "Changes levels based on scores and emotions",
      color: "linear-gradient(135deg, #81D4FA 0%, #4FC3F7 100%)"
    },
    {
      icon: "🧩",
      title: "Multi-Sensory",
      desc: "Visual, auditory and tactile learning",
      color: "linear-gradient(135deg, #CE93D8 0%, #BA68C8 100%)"
    },
    {
      icon: "🏆",
      title: "Positive Rewards",
      desc: "Celebrates small wins to build confidence",
      color: "linear-gradient(135deg, #A5D6A7 0%, #81C784 100%)"
    }
  ];

  // Game highlights
  const games = [
    {
      name: "Math Quest",
      desc: "Adaptive number games with visual aids",
      icon: "➕",
      color: "linear-gradient(135deg, #FF9E80 0%, #FF7043 100%)"
    },
    {
      name: "Shape Pattern",
      desc: "Geometry through interactive puzzles",
      icon: "🔷",
      color: "linear-gradient(135deg, #81D4FA 0%, #4FC3F7 100%)"
    },
    {
      name: "Word Wizard",
      desc: "Reading skills with phonics games",
      icon: "📖",
      color: "linear-gradient(135deg, #CE93D8 0%, #BA68C8 100%)"
    },
    {
      name: "Memory Puzzle",
      desc: "Pattern recognition challenges",
      icon: "🧠",
      color: "linear-gradient(135deg, #A5D6A7 0%, #81C784 100%)"
    }
  ];

  return (
    <div className="home-container">
      {/* Professional Navbar */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate("/")}>
          <span role="img" aria-label="Spark">✨</span> MindSpark
        </div>
        <div className="nav-options">
          <button 
            className="nav-btn"
            onClick={() => navigate("/ChildLogin")}
          >
            Child Login
          </button>
          <button 
            className="nav-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button 
            className="nav-btn"
            onClick={() => navigate("/signup")}
          >
            Signup
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Learning That <span>Understands</span> Your Child</h1>
          <p>
            An adaptive platform that changes based on your child's emotions and 
            abilities to keep them engaged and learning effectively.
          </p>
          <button 
            className="cta-button"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
        <div className="hero-image">
          <img 
            src="https://emmareed.net/wp-content/uploads/2023/02/online.png" 
            alt="Child happily using LearnSpark adaptive learning games"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>How We Help Children Learn</h2>
          <div className="features-grid">
            {childFeatures.map((feature, index) => (
            <div 
            className="feature-card" 
            key={index}
            style={{ background: feature.color }}
            >
        <div className="feature-icon">{feature.icon}</div>
        <h3>{feature.title}</h3>
        <p>{feature.desc}</p>
      </div>
    ))}
  </div>
</section>

      {/* Games Section */}
      <section className="games">
        <h2>Our Learning Games</h2>
        <div className="games-grid">
          {games.map((game, index) => (
            <div 
              className="game-card" 
              key={index}
              style={{ background: game.color }}
              onClick={() => navigate(`/games/${game.name.toLowerCase().replace(' ', '-')}`)}
            >
              <div className="game-icon">{game.icon}</div>
              <h3>{game.name}</h3>
              <p>{game.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer>
        <p>© {new Date().getFullYear()} LearnSpark. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;