import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const  token = localStorage.getItem("token");  
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.message);
         if (res.data.logout) {
           localStorage.removeItem("token"); // Remove token
           setTimeout(() => navigate("/login"), 2000); // Redirect after 2 sec
         }
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Reset Password
        </h2>

        {message && <p className="text-center text-red-600">{message}</p>}

        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 rounded-md"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 mt-3 rounded-md"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
