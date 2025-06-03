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
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });

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
      const response = await axios.post("https://alp-rjd5.onrender.com/login", {
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
      setError(err.response?.data?.message || "Oops! That email and password combination didn't work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleBack = () => {
    navigate("/"); // Navigate to the starting screen
  };

  return (
    <div className="login-container">
      <div className="register-card">
        <button 
          onClick={handleBack}
          className="back-button"
          aria-label="Go back"
        >
          <svg className="back-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        
        <div className="register-header">
          <h1 className="register-title">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="register-form">
          <div>
            <label className="register-form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              className={`register-form-input ${isFocused.email ? 'border-accent-primary shadow-input-focus' : ''}`}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="register-form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
              className={`register-form-input ${isFocused.password ? 'border-accent-primary shadow-input-focus' : ''}`}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="register-form-button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate("/signup")}
              className="font-medium text-accent-primary hover:underline focus:outline-none"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;