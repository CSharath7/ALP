import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🚀 Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/login"); // Redirect to login
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      
        <h1 className="text-xl font-bold">MyApp</h1>
     
      {token && (
        <div className="relative" ref={dropdownRef}>
          {/* 🚀 Toggle Button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-600"
          >
            ☰ 
          </button>

          {/* 🚀 Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
              <Link
                to="/dashboard"
                className="block px-4 py-2 hover:bg-gray-200"
              >
                Dashboard
              </Link>
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">
                Profile
              </Link>
              <Link
                to="/games"
                className="block px-4 py-2 hover:bg-gray-200"
              >
                Games
              </Link>
              <Link
                to="/reset-password"
                className="block px-4 py-2 hover:bg-gray-200"
              >
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;