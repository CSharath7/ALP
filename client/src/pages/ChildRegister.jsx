import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ChildRegister.css";

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

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage(""); 
    try {
      const therapistid = localStorage.getItem("id");
      const completeRegistrationData = {
        ...registerData,
        therapistid: therapistid || "Unknown Therapist"
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
    <div className="child-register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="register-title">Student Registration</h2>
          <p className="register-subtitle">Create your learning account</p>
        </div>

        <div className="register-content">
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

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label className="form-label">
                <span className="mr-2">👤</span> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  <span className="mr-2">🎂</span> Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={registerData.age}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="mr-2">👫</span> Gender
                </label>
                <select
                  name="gender"
                  value={registerData.gender}
                  onChange={handleChange}
                  className="form-input"
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

            <div className="form-group">
              <label className="form-label">
                <span className="mr-2">📧</span> Email
              </label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`register-btn ${isSubmitting ? 'register-btn-disabled' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="spinner -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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