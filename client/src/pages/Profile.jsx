// import React from "react";

// function Profile() {
//   return <h2>Welcome to your Profile!</h2>;
// }

// export default Profile;
import React, { useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  // Dyslexia-friendly styles
  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', 'OpenDyslexic', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "#333",
    textDecoration: "none"
  };

  // User data - in a real app this would come from your backend
  const [user, setUser] = useState({
    name: "Alex",
    avatar: "👦", // Could be an image URL in a real app
    level: "Explorer",
    points: 450,
    badges: ["Fast Learner", "Word Master", "Math Whiz"],
    achievements: [
      { name: "10 Games Played", completed: true },
      { name: "5 Perfect Scores", completed: false },
      { name: "3 Day Streak", completed: true }
    ]
  });

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  const handleSave = () => {
    setUser({ ...user, name: tempName });
    setIsEditing(false);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-6"
      style={dyslexicStyles}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Your Profile</h1>
          <Link 
            to="/dashboard" 
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Back to Dashboard
          </Link>
        </header>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-8 border-blue-500">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className="text-8xl bg-blue-100 p-6 rounded-full">
              {user.avatar}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="mb-4">
                  <label className="block text-lg mb-2">Your Name:</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="border-2 border-blue-300 rounded-lg p-2 w-full text-lg"
                    style={dyslexicStyles}
                  />
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={handleSave}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-blue-800">{user.name}</h2>
                  <button 
                    onClick={() => {
                      setTempName(user.name);
                      setIsEditing(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 mt-2 flex items-center gap-1"
                  >
                    <span>✏️</span> Edit Name
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Level</p>
                  <p className="text-xl font-bold">{user.level}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-600">Points</p>
                  <p className="text-xl font-bold">{user.points}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-8 border-yellow-500">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Your Badges</h2>
          {user.badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, index) => (
                <div 
                  key={index} 
                  className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <span>🏆</span> {badge}
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't earned any badges yet. Keep playing to earn some!</p>
          )}
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-8 border-green-500">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Achievements</h2>
          <div className="space-y-3">
            {user.achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg flex items-center gap-3 ${achievement.completed ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                <span className={`text-2xl ${achievement.completed ? 'text-green-500' : 'text-gray-400'}`}>
                  {achievement.completed ? '✅' : '🔲'}
                </span>
                <div>
                  <p className="font-medium">{achievement.name}</p>
                  <p className="text-sm">
                    {achievement.completed ? 'Completed!' : 'Keep going!'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-red-500">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Settings</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Reading Preferences</h3>
              <div className="flex items-center gap-3">
                <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  Larger Text
                </button>
                <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  Dyslexia Font
                </button>
                <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  Audio Help
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Account</h3>
              <button className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;