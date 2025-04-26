import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ChildRegister() {
  const [registerData, setRegisterData] = useState({
    name: "",
    age: "",
    gender: "",
    email: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', 'OpenDyslexic', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "#333",
    textDecoration: "none"
  };

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage(""); 
    try {
        const therapistName = localStorage.getItem("adminname");
        const completeRegistrationData = {
          ...registerData,
          therapistName: therapistName || "Unknown Therapist"
        };
      const response = await axios.post("http://localhost:5000/child-register", completeRegistrationData);
      setSuccessMessage(`Registration successful! Please check your email for UID`);
      setRegisterData({
        name: "",
        age: "",
        gender: "",
        email: ""
      });
    } catch (error) {
      setErrorMessage(`${error.response?.data?.message || "Registration failed. Please try again."}`);
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
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Student Registration
          </h2>
          <p className="text-white text-center mt-2 text-lg">
            Create your learning account
          </p>
        </div>

        <div className="p-6">
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
                <span className="mr-2">👤</span> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleChange}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={dyslexicStyles}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="block text-lg font-medium text-blue-800 flex items-center">
                  <span className="mr-2">🎂</span> Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={registerData.age}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={dyslexicStyles}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-lg font-medium text-blue-800 flex items-center">
                  <span className="mr-2">👫</span> Gender
                </label>
                <select
                  name="gender"
                  value={registerData.gender}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={dyslexicStyles}
                  required
                >
                  <option value="">Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-lg font-medium text-blue-800 flex items-center">
                <span className="mr-2">📧</span> Email
              </label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleChange}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={dyslexicStyles}
                required
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
                  Registering...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChildRegister;
