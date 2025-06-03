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

  const availableGames = [
    "Shape Pattern",  "Math Quest", "Memory Puzzle", "Word Wizard", 
  ];

  const [selectedGames, setSelectedGames] = useState(
    availableGames.reduce((acc, game) => {
      acc[game] = { selected: false, level: 1 };
      return acc;
    }, {})
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleGameChange = (game, selected, level) => {
    setSelectedGames({
      ...selectedGames,
      [game]: { selected, level }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const therapistid = localStorage.getItem("id");
      const selectedGamesArray = Object.entries(selectedGames)
        .filter(([_, val]) => val.selected)
        .map(([name, val]) => ({ name, level: val.level }));

      const completeRegistrationData = {
        ...registerData,
        therapistid: therapistid || "Unknown Therapist",
        selectedGames: selectedGamesArray
      };

      const response = await axios.post("https://alp-rjd5.onrender.com/child-register", completeRegistrationData);
      setSuccessMessage("Registration successful! Check email for UID.");
      setRegisterData({ name: "", age: "", gender: "", email: "" });
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (keep all your existing imports and state declarations)

return (
    <div className="child-register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="register-title">Student Registration</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <input 
            name="name" 
            placeholder="Full Name" 
            value={registerData.name} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="age" 
            type="number" 
            placeholder="Age" 
            value={registerData.age} 
            onChange={handleChange} 
            required 
          />
          <select 
            name="gender" 
            value={registerData.gender} 
            onChange={handleChange} 
            required
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={registerData.email} 
            onChange={handleChange} 
            required 
          />

          <label>Select Games & Level</label>
          <div className="game-selection">
            {availableGames.map((game) => (
              <div key={game} className="game-item">
              <input
              type="checkbox"
              checked={selectedGames[game].selected}
              onChange={(e) =>
              handleGameChange(game, e.target.checked, selectedGames[game].level)
            }
          />
          <span className="game-name">{game}</span>
            {selectedGames[game].selected && (
              <select
              className="level-select"
              value={selectedGames[game].level}
              onChange={(e) =>
              handleGameChange(game, true, parseInt(e.target.value))
              }
              >
                {[1, 2, 3, 4].map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
                  ))}
                </select>
                )}
              </div>
            ))}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Create Account"}
          </button>

          {successMessage && <p>{successMessage}</p>}
          {errorMessage && <p>{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default ChildRegister;
