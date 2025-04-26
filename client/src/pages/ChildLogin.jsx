import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ChildLogin() {
  const [loginData, setLoginData] = useState({
    studentId: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Dyslexia-friendly styles
  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', 'OpenDyslexic', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "#333",
    textDecoration: "none"
  };

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const response = await axios.post("http://localhost:5000/child-login", loginData);
      localStorage.setItem("token",response.data.token);
            localStorage.setItem("role", response.data.role);
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
    <div 
      className="min-h-screen flex items-center justify-center bg-blue-50 p-4"
      style={dyslexicStyles}
    >
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Colorful header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Student Login
          </h2>
          <p className="text-white text-center mt-2 text-lg">
            Access your learning dashboard
          </p>
        </div>

        {/* Main content */}
        <div className="p-6">
          {/* Success/Error messages */}
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded mb-6">
              <p className="text-green-700 font-medium">✅ {successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-6">
              <p className="text-red-700 font-medium">⚠️ {errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-lg font-medium text-blue-800 flex items-center">
                <span className="mr-2">🆔</span> Student ID
              </label>
              <input
                type="text"
                name="studentId"
                value={loginData.studentId}
                onChange={handleChange}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={dyslexicStyles}
                required
                placeholder="Enter your student ID"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg mt-6 transition-all ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {/* Footer Links */}
        <div className="bg-blue-100 p-4 text-center border-t border-blue-200">
          <div className="flex flex-col space-y-2">
            <p className="text-blue-800">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate("/register")}
                className="font-bold underline focus:outline-none text-blue-600"
              >
                Register here
              </button>
            </p>
            <button 
              onClick={() => navigate("/help")}
              className="text-blue-700 hover:underline focus:outline-none"
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