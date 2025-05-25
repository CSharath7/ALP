import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(location.state?.message || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      if (role === "superadmin") {
        navigate("/admin-dashboard");
      } else if (role === "therapist") {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("id", response.data.id);

      if (response.data.role === "superadmin") {
        navigate("/dashboard");
      } else if (response.data.role === "therapist") {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Oops! That email and password combination didn't work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Sign in to continue learning</p>
        </div>

        <form onSubmit={handleLogin} className="login-content">
          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <span className="mr-2">✉️</span> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="mr-2">🔑</span> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`login-btn ${isLoading ? 'login-btn-disabled' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="spinner -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="footer-links">
            <div className="signup-line">
              <span>Don't have an account? </span>
              <button 
                onClick={() => navigate("/signup")}
                className="footer-link font-bold underline focus:outline-none"
              >
                Sign up here
              </button>
            </div>

            <button 
              onClick={() => navigate("/forgot-password")}
              className="footer-link hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
            
            <p className="pt-2">
              Need help? Contact us at{' '}
              <span className="font-bold">support@dyslexiaapp.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
