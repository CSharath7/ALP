import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const token = localStorage.getItem("token");  
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `https://alp-rjd5.onrender.com/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.message);
      if (res.data.logout) {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-full max-w-md bg-[var(--bg-card)] shadow-md rounded-lg p-6 border border-[var(--border-color)]">
        <h2 className="text-2xl font-bold text-center text-[var(--text-primary)]">
          Reset Password
        </h2>

        {message && (
          <p className={`text-center ${
            message.includes("success") ? "text-[var(--success-color)]" : "text-[var(--warning-color)]"
          }`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="password"
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-[var(--accent-primary)] text-[var(--bg-primary)] py-2 mt-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;