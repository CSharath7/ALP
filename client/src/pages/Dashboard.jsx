import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState({ name: "", progress: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem("token");
        const name=localStorage.getItem("name");
        const res = await axios.get(
          "http://localhost:5000/api/auth/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        setUserData({
          name: localStorage.getItem("name") || "Friend",
          progress: Math.floor(Math.random() * 100)
        });
        
        setRecentActivities([
          { game: "Math Quest", score: "85%", date: "Today" },
          { game: "Word Wizard", score: "70%", date: "Yesterday" },
          { game: "Memory Puzzle", score: "90%", date: "2 days ago" }
        ]);
        
        setMessage(`Welcome back, ${localStorage.getItem("name") || "Friend"}!`);
        setIsLoading(false);
      } catch (error) {
        setMessage(`Oops! Something went wrong. Please try again.`);
        setIsLoading(false);
      }
    };

    fetchProtectedData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Your Learning Dashboard</h1>
        <p className="dashboard-subtitle">{message}</p>
      </header>

      <div className="grid-cols-3">
        <div className="card welcome-card">
          <h2 className="card-title blue-title">Hello, {userData.name}!</h2>
          <p className="mb-4">Ready for some fun learning today?</p>
          <Link to="/games" className="play-btn">
            Play Games
          </Link>
        </div>

        <div className="card progress-card">
          <h2 className="card-title green-title">Your Progress</h2>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span>Learning Journey</span>
              <span>{userData.progress}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${userData.progress}%` }}
              ></div>
            </div>
          </div>
          <p>Keep going! You're doing great!</p>
        </div>

        <div className="card actions-card">
          <h2 className="card-title yellow-title">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/games" className="quick-action">
              Continue Last Game
            </Link>
            <Link to="/rewards" className="quick-action">
              View Your Rewards
            </Link>
            <Link to="/settings" className="quick-action">
              Change Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title purple-title">Recent Activities</h2>
        <div className="overflow-x-auto">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Score</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity, index) => (
                <tr key={index} className={index % 2 === 0 ? "striped-row" : ""}>
                  <td>{activity.game}</td>
                  <td className="font-bold">{activity.score}</td>
                  <td>{activity.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title red-title">Recommended For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Math Quest", icon: "➕➖", color: "bg-purple-500" },
            { name: "Word Detective", icon: "🔍", color: "bg-orange-500" },
            { name: "Memory Puzzle", icon: "🧩", color: "bg-red-500" },
            { name: "Spell Bee", icon: "🐝", color: "bg-yellow-500" }
          ].map((game, index) => (
            <Link
              key={index}
              to={`/${game.name.replace(/\s+/g, '')}`}
              className={`${game.color} game-card`}
            >
              <span className="game-icon">{game.icon}</span>
              <span className="game-name">{game.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;