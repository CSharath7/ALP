import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  // Dyslexia-friendly styles
  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', 'OpenDyslexic', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "#333",
    textDecoration: "none",
  };

  // User data state
  const [user, setUser] = useState({
    name: "",
    email: "",
    age: "",
    id: "",
    role: "",
    uid: null,
    numberOfGamesPlayed: 0,
    selectedGames: [],
    experience: "",
    specialization: "",
    contact: "",
    children: [],
    avatar: "👦",
  });

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = localStorage.getItem("id");
        const role = localStorage.getItem("role");
        if (!id || !role) {
          throw new Error("No user ID or role found in localStorage");
        }

        const response = await fetch(
          `http://localhost:5000/profile/${id}?role=${role}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setUser({
          name: data.name,
          email: data.email,
          age: data.age,
          id: data.id,
          role: data.role,
          uid: data.uid || null,
          numberOfGamesPlayed: data.numberOfGamesPlayed || 0,
          selectedGames: data.selectedGames || [],
          experience: data.experience || "",
          specialization: data.specialization || "",
          contact: data.contact || "",
          children: data.children || [],
          avatar: "👦",
        });
        setTempName(data.name);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    if (user.role === "child") {
      localStorage.removeItem("uid");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("id");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("level");
    localStorage.removeItem("game_Math_Quest");
    localStorage.removeItem("game_Memory_Puzzle");
    localStorage.removeItem("game_Shape_Pattern");
    localStorage.removeItem("game_Word_Wizard");

    navigate("/");
  };

  const handleSave = () => {
    setUser({ ...user, name: tempName });
    setIsEditing(false);
    // Optionally, send updated name to backend
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

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
                  <h2 className="text-2xl font-bold text-blue-800">
                    {user.name}
                  </h2>
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

              {user.role === "child" ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">Email</p>
                    <p className="text-xl font-bold">{user.email}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600">Age</p>
                    <p className="text-xl font-bold">{user.age}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">UID</p>
                    <p className="text-xl font-bold">{user.uid || "N/A"}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600">
                      Total Game Sessions
                    </p>
                    <p className="text-xl font-bold">
                      {user.numberOfGamesPlayed}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">Email</p>
                    <p className="text-xl font-bold">{user.email}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600">Age</p>
                    <p className="text-xl font-bold">{user.age}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">Experience</p>
                    <p className="text-xl font-bold">{user.experience}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600">Specialization</p>
                    <p className="text-xl font-bold">{user.specialization}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">Contact</p>
                    <p className="text-xl font-bold">{user.contact}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Child-Specific: Selected Games Section */}
        {user.role === "child" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-8 border-yellow-500">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">
              Selected Games
            </h2>
            {user.selectedGames.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.selectedGames.map((game, index) => (
                  <div
                    key={index}
                    className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <span>🎮</span>
                    <div>
                      <p>{game.name}</p>
                      <p className="text-sm">
                        Assigned Level: {game.assignedLevel}
                      </p>
                      <p className="text-sm">
                        Current Level: {game.currentLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No games selected yet.</p>
            )}
          </div>
        )}

        {/* Therapist-Specific: Associated Children Section */}
        {user.role === "therapist" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-8 border-yellow-500">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">
              Associated Children
            </h2>
            {user.children.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.children.map((child, index) => (
                  <div
                    key={index}
                    className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <span>👧</span>
                    <p>{child.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No children assigned yet.</p>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-red-500">
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
