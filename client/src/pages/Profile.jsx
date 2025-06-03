import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/profile.css";

function Profile() {
  const navigate = useNavigate();

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
          `https://alp-rjd5.onrender.com/profile/${id}?role=${role}`
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
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 text-red-600">
        <div className="text-2xl">{error}</div>
      </div>
    );
  }

  const isTherapist = user.role === "therapist";

  return (
    <div className={`w-full min-h-screen p-6 ${
      isTherapist ? "bg-gray-900" : "bg-white"
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#2563eb' }}>
            Your Profile
          </h1>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-lg transition-colors ${
              isTherapist
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Back to Dashboard
          </Link>
        </header>

        {/* Profile Card */}
        <div className={`rounded-xl p-6 mb-8 ${
          isTherapist ? "bg-gray-800" : "bg-white"
        } shadow-md`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className={`text-8xl p-6 rounded-full ${
              isTherapist ? "bg-gray-700" : "bg-gray-200"
            }`}>
              {user.avatar}
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="mb-4">
                  <label className={`block text-lg mb-2 ${
                    isTherapist ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Your Name:
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className={`rounded-lg p-2 w-full text-lg ${
                      isTherapist
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-white text-gray-800 border-gray-300"
                    } border-2`}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 rounded-lg ${
                        isTherapist
                          ? "bg-green-700 hover:bg-green-600 text-white"
                          : "bg-green-600 hover:bg-green-500 text-white"
                      }`}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`px-4 py-2 rounded-lg ${
                        isTherapist
                          ? "bg-gray-600 hover:bg-gray-500 text-white"
                          : "bg-gray-400 hover:bg-gray-500 text-white"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                    {user.name}
                  </h2>
                  <button
                    onClick={() => {
                      setTempName(user.name);
                      setIsEditing(true);
                    }}
                    className={`mt-2 flex items-center gap-1 ${
                      isTherapist ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    <span>✏️</span> Edit Name
                  </button>
                </div>
              )}

              {!isTherapist ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>Age</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.age}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>UID</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.uid || "N/A"}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>Total Game Sessions</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.numberOfGamesPlayed}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>Email</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>Age</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.age}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>Experience</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.experience}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>Specialization</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.specialization}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>Contact</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.contact}</p>
                  </div>
                  <div className={`p-3 rounded-lg col-span-1 md:col-span-2 ${
                    isTherapist ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className={`text-sm ${
                      isTherapist ? "text-gray-400" : "text-gray-600"
                    }`}>Email</p>
                    <p className={`text-lg font-semibold ${
                      isTherapist ? "text-white" : "text-gray-800"
                    }`}>{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Child-Specific: Selected Games Section */}
        {!isTherapist && (
          <div className={`rounded-xl p-6 mb-8 ${
            isTherapist ? "bg-gray-800" : "bg-white"
          } shadow-md`}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#2563eb' }}>
              Selected Games
            </h2>
            {user.selectedGames.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.selectedGames.map((game, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      isTherapist
                        ? "bg-gray-700 text-white border border-gray-600"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
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
              <p className={isTherapist ? "text-gray-400" : "text-gray-600"}>
                No games selected yet.
              </p>
            )}
          </div>
        )}

        {/* Therapist-Specific: Associated Children Section */}
        {isTherapist && (
          <div className={`rounded-xl p-6 mb-8 ${
            isTherapist ? "bg-gray-800" : "bg-white"
          } shadow-md`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isTherapist ? "text-white" : "text-gray-800"
            }`}>
              Associated Children
            </h2>
            {user.children.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.children.map((child, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      isTherapist
                        ? "bg-gray-700 text-white border border-gray-600"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    <span>👧</span>
                    <p>{child.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={isTherapist ? "text-gray-400" : "text-gray-600"}>
                No children assigned yet.
              </p>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className={`rounded-xl p-6 ${
          isTherapist ? "bg-gray-800" : "bg-white"
        } shadow-md`}>
          <button
            onClick={handleLogout}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isTherapist
                ? "bg-red-700 hover:bg-red-600 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;