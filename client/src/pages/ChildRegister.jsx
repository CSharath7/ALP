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
    "Shape Pattern", "Story Time", "Math Quest", "Memory Puzzle",
    "Memory Matrix", "Spell Bee", "Word Wizard", "Word Detective"
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

      const response = await axios.post("http://localhost:5000/child-register", completeRegistrationData);
      setSuccessMessage("Registration successful! Check email for UID.");
      setRegisterData({ name: "", age: "", gender: "", email: "" });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="child-register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="register-title">Student Registration</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <input name="name" placeholder="Full Name" value={registerData.name} onChange={handleChange} required />
          <input name="age" type="number" placeholder="Age" value={registerData.age} onChange={handleChange} required />
          <select name="gender" value={registerData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
          </select>
          <input name="email" type="email" placeholder="Email" value={registerData.email} onChange={handleChange} required />

          <label>Select Games & Level</label>
          {availableGames.map((game) => (
            <div key={game}>
              <input
                type="checkbox"
                checked={selectedGames[game].selected}
                onChange={(e) =>
                  handleGameChange(game, e.target.checked, selectedGames[game].level)
                }
              />
              {game}
              {selectedGames[game].selected && (
                <select
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
