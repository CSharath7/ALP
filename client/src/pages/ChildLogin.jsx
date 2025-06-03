import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ChildLogin.css";

function ChildLogin() {
  const [loginData, setLoginData] = useState({
    studentId: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Redirect if token already exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    const response = await axios.post("https://alp-rjd5.onrender.com/child-login", loginData);
    const { token, role, child } = response.data;

    // Store basic child info
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", child.name);
    localStorage.setItem("email", child.email);
    localStorage.setItem("uid", child.uid);
    localStorage.setItem("id", child.id);

    // Store each selected game individually
    if (child.selectedGames && Array.isArray(child.selectedGames)) {
      child.selectedGames.forEach((game) => {
        const key = `game_${game.name.replace(/\s+/g, "_")}`; // e.g., game_Math_Quest
        console.log(`Storing game data under key: ${key}`);
        const value = JSON.stringify({
          assignedLevel: game.assignedLevel,
          currentLevel: game.currentLevel
        });
        console.log(`Storing value: ${value}`);
        localStorage.setItem(key, value);
      });
    }

    setSuccessMessage("Welcome back! Redirecting to your dashboard...");
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  } catch (e) {
    setErrorMessage("Login failed. Please check your Student ID and try again.");
    console.error(e);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="child-login-container">
      <div className="child-login-card">
        <div className="login-header">
          <h2 className="login-title">Student Login</h2>
          <p className="login-subtitle">Access your learning dashboard</p>
        </div>

        <div className="login-content">
          {successMessage && (
            <div className="success-message">
              <p>✅ {successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="error-message">
              <p>⚠️ {errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">
                <span className="mr-2">🆔</span> Student ID
              </label>
              <input
                type="text"
                name="studentId"
                value={loginData.studentId}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter your student ID"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`login-btn ${isSubmitting ? 'login-btn-disabled' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="spinner -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging In...
                </span>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <div className="footer-links">
            <button 
              onClick={() => navigate("/help")}
              className="footer-link hover:underline focus:outline-none"
            >
              Need help?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChildLogin;
