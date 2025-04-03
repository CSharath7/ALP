const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { PendingTherapist, Therapist } = require("../model/therapist");
const JWT_SECRET = "mohit@123"; 
const cors = require("cors");
const mongoose = require("mongoose");
 // Import bcrypt
const jwt = require("jsonwebtoken"); 


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await Therapist.findOne({ email });
    if (!user) {
      console.log(user)
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("isMatch: " + isMatch)
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    console.log("token: " + token)

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/reset-password/:token", async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded); // Debugging

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password in the database
    await Therapist.findByIdAndUpdate(decoded.id, { password: hashedPassword });

     res.json({
       message: "Password reset successfully. Please log in again.",
       logout: true,
     });
  } catch (error) {
    console.log("JWT Error:", error.message); // Debugging
    res.status(400).json({ error: "Invalid or expired token." });
  }
});





































































module.exports = router;