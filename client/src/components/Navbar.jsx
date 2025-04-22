import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // 👈 Get role from localStorage
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // Optional: Clear role as well
    navigate("/login");
  };

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
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-600"
          >
            ☰
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-10">
              <Link
                to="/dashboard"
                className="block px-4 py-2 hover:bg-gray-200"
              >
                Dashboard
              </Link>

              {role === "therapist" && (
                <>
                  <Link
                    to="/reset-password"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Change Password
                  </Link>
                  <Link
                    to="/child"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Register Child
                  </Link>
                </>
              )}

              {role === "child" && (
                <Link to="/games" className="block px-4 py-2 hover:bg-gray-200">
                  Games
                </Link>
              )}

              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">
                Profile
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
