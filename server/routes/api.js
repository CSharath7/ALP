const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { PendingTherapist, Therapist } = require("../model/therapist");
const JWT_SECRET = "mohit@123"; 
const cors = require("cors");
const mongoose = require("mongoose");
 // Import bcrypt
const jwt = require("jsonwebtoken"); // Import jsonwebtoken

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "college9652@gmail.com",
    pass: "zidmjidvtjgvzghf",
  },
});

// Route: Register therapist request
router.post("/register", async (req, res) => {
  try {
    console.log("Received data:", req.body);
    const newTherapist = new PendingTherapist(req.body);
    await newTherapist.save();
    res.status(201).json({ message: "Therapist request submitted" });
  } catch (error) {
    console.error("Error in /api/register:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/auth/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route!" });
});

// ✅ MIDDLEWARE TO VERIFY JWT
function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  console.log(`from line 39 ${token}`);
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.user = verified;
    console.log('req.user is ' + req.user)
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(400).json({ error: "Invalid Token" });
  }
}
// Route: Get all pending requests
router.get("/admin", async (req, res) => {
  try {
    const requests = await PendingTherapist.find();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route: Approve a therapist
router.post("/admin/approve/:id", async (req, res) => {
  try {
    

    const request = await PendingTherapist.findById(req.params.id);

    // ✅ Generate and hash password
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
 
    // ✅ Create therapist entry
    const approvedTherapist = new Therapist({
      name: request.name,
      age: request.age,
      gender: request.gender,
      experience: request.experience,
      email: request.email,
      specialization: request.specialization,
      contact: request.contact,
      password: hashedPassword,
    });

    await approvedTherapist.save();
    await PendingTherapist.findByIdAndDelete(req.params.id);

    // ✅ Send email
    const mailOptions = {
      from: "college9652@gmail.com",
      to: request.email,
      subject: "Therapist Account Approved",
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h1 style="font-size: 32px; color: #4CAF50;">🎉 Congratulations! 🎉 ${request.name}</h1>
        <p style="font-size: 22px; font-weight: bold; color: #333;">
          Your Therapist account has been approved!
        </p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="font-size: 20px; font-weight: bold; color: #000;">Login Details:</p>
          <p style="font-size: 18px;"><strong>Email:</strong> ${request.email}</p>
          <p style="font-size: 18px;"><strong>Password:</strong> ${randomPassword}</p>
        </div>
        <p style="font-size: 18px; color: #666; margin-top: 20px;">
          Please change your password after logging in for security purposes.
        </p>
      </div>
    `,
    };


    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    res.json({ message: "Therapist approved and email sent!" });
  } catch (error) {
    console.error("Error approving therapist:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route: Reject therapist request
router.delete("/admin/reject/:id", async (req, res) => {
  try {
    await PendingTherapist.findByIdAndDelete(req.params.id);
    res.json({ message: "Therapist rejected" });
  } catch (error) {
    console.error("Error rejecting therapist:", error);
    res.status(500).json({ error: "Server error" });
  }
});

   


module.exports = router;
