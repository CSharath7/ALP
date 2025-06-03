import React, { useState } from "react";
import axios from "axios";

function TherapistSignup() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    gender: "",
    experience: "",
    specialization: "",
    contact: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      await axios.post("https://alp-rjd5.onrender.com/api/register", formData);
      setSuccessMessage("Registration submitted successfully! We'll contact you soon.");
      setFormData({
        name: "",
        age: "",
        email: "",
        gender: "",
        experience: "",
        specialization: "",
        contact: ""
      });
    } catch (e) {
      setErrorMessage(e.response?.data?.message || "Error submitting request. Please try again.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dyslexia-friendly styles
  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', 'OpenDyslexic', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "var(--text-primary)",
    textDecoration: "none"
  };

  return (
    <div 
      className="child-register-container"
      style={{ ...dyslexicStyles, padding: "1rem" }}
    >
      <div className="register-card" style={{ maxWidth: "650px", width: "100%" }}>
        <div className="register-header" style={{ marginBottom: "1.5rem" }}>
          <h2 className="register-title" style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            Therapist Application
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Join our team of specialists helping children with dyslexia
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" style={{ gap: "1rem" }}>
          {/* Messages */}
          {successMessage && (
            <div style={{
              background: "rgba(63, 185, 80, 0.1)",
              color: "var(--success-color)",
              border: "1px solid rgba(63, 185, 80, 0.2)",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem"
            }}>
              ✅ {successMessage}
            </div>
          )}
          {errorMessage && (
            <div style={{
              background: "rgba(210, 153, 34, 0.1)",
              color: "var(--warning-color)",
              border: "1px solid rgba(210, 153, 34, 0.2)",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem"
            }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Personal Information */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="23"
                max="80"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={{ width: "100%" }}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Contact</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                min="1"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: "var(--accent-primary)",
              color: "white",
              border: "none",
              padding: "0.75rem",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              marginTop: "1.5rem",
              width: "100%",
              cursor: "pointer",
              opacity: isSubmitting ? "0.7" : "1"
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        {/* Back Button - Only addition to the original code */}
        <button
          onClick={() => window.history.back()}
          style={{
            background: "transparent",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontSize: "0.9rem",
            marginTop: "1rem",
            width: "100%",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>

        <div style={{ 
          marginTop: "1rem", 
          paddingTop: "1rem", 
          borderTop: "1px solid var(--border-color)",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.85rem"
        }}>
          <p>Questions? Email us at <span style={{ fontWeight: "600" }}>support@dyslexiaapp.com</span></p>
        </div>
      </div>
    </div>
  );
}

export default TherapistSignup;