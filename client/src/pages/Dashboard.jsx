// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function Dashboard() {
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const fetchProtectedData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         console.log("Token from localStorage:", token);
//         const res = await axios.get(
//           "http://localhost:5000/api/auth/protected",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         console.log(`Hello ${res}`)
//         setMessage(res.data.message);
//       } catch (error) {
//         setMessage(`Unauthorized access ${error}`);
//       }
//     };

//     fetchProtectedData();
//   }, []);

//   return (
//     <div>
//       <h2>Dashboard</h2>
//       <p>{message}</p>
//     </div>
//   );
// }

// export default Dashboard;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState({ name: "", progress: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/auth/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Simulate user data - in a real app this would come from your API
        setUserData({
          name: res.data.user?.name || "Friend",
          progress: Math.floor(Math.random() * 100) // Random progress for demo
        });
        
        // Simulate recent activities
        setRecentActivities([
          { game: "Math Quest", score: "85%", date: "Today" },
          { game: "Word Wizard", score: "70%", date: "Yesterday" },
          { game: "Memory Puzzle", score: "90%", date: "2 days ago" }
        ]);
        
        setMessage(`Welcome back, ${res.data.user?.name || "Friend"}!`);
        setIsLoading(false);
      } catch (error) {
        setMessage(`Oops! Something went wrong. Please try again.`);
        setIsLoading(false);
      }
    };

    fetchProtectedData();
  }, []);

  // Dyslexia-friendly styles
  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "#333333",
    textDecoration: "none"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50" style={dyslexicStyles}>
        <div className="text-2xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6" style={dyslexicStyles}>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-blue-800">Your Learning Dashboard</h1>
        <p className="text-xl text-blue-600">{message}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-8 border-blue-500">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">Hello, {userData.name}!</h2>
          <p className="mb-4">Ready for some fun learning today?</p>
          <Link 
            to="/games" 
            className="bg-blue-500 text-white px-6 py-2 rounded-lg text-lg inline-block hover:bg-blue-600 transition-colors"
          >
            Play Games
          </Link>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-8 border-green-500">
          <h2 className="text-2xl font-bold mb-4 text-green-800">Your Progress</h2>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span>Learning Journey</span>
              <span>{userData.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full" 
                style={{ width: `${userData.progress}%` }}
              ></div>
            </div>
          </div>
          <p>Keep going! You're doing great!</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-8 border-yellow-500">
          <h2 className="text-2xl font-bold mb-4 text-yellow-800">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/games" 
              className="block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Continue Last Game
            </Link>
            <Link 
              to="/rewards" 
              className="block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              View Your Rewards
            </Link>
            <Link 
              to="/settings" 
              className="block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Change Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">Recent Activities</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-100">
                <th className="text-left p-3">Game</th>
                <th className="text-left p-3">Score</th>
                <th className="text-left p-3">When</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-purple-50" : ""}>
                  <td className="p-3">{activity.game}</td>
                  <td className="p-3 font-bold">{activity.score}</td>
                  <td className="p-3">{activity.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Game Recommendations */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-red-800">Recommended For You</h2>
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
              className={`${game.color} text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center`}
            >
              <span className="text-3xl mb-2">{game.icon}</span>
              <span className="text-xl font-semibold">{game.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;