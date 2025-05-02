require("dotenv").config()
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { PendingTherapist, Therapist } = require("../model/therapist");
const Child = require("../model/child")
const Admin = require("../model/admin")
const Id = require("../model/Childid")
const JWT_SECRET = process.env.JWT_SECRET; // Replace with a secure secret key
const cors = require("cors");
const mongoose = require("mongoose");
 // Import bcrypt
const jwt = require("jsonwebtoken"); 
const {childmail} = require("./mail")

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Try SuperAdmin
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1h" });

      return res.json({
        token,
        role: "superadmin",
        adminname: admin.name,
        email: admin.email
      });
    }

    // 2. Try Therapist
    const therapist = await Therapist.findOne({ email });
    if (therapist) {
      const isMatch = await bcrypt.compare(password, therapist.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: therapist._id }, JWT_SECRET, { expiresIn: "1h" });

      return res.json({
        token,
        role: "therapist",
        adminname: therapist.name,
        adminage: therapist.age,
        email: therapist.email
      });
    }

    // 3. Neither found
    return res.status(400).json({ error: "Invalid credentials" });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
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



router.post("/child-login", async (req, res) => {
  try {
    const {studentId} = req.body;

    // Check if user exists
    const user = await Child.findOne({uid:studentId});
    if (!user) {
      console.log(user);
      return res.status(400).json({ error: "Invalid Student ID" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    console.log("token: " + token);

      res.json({
        token,
        child: {
          name: user.name,
          age: user.age,
          gender: user.gender,
          email: user.email,
          uid: user.uid,
        },
        role:"child"
      },);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/child-register", async (req, res) => {
  try {
    const { name, age, gender, email, therapist } = req.body;

    const uidDoc = await Id.findOneAndUpdate(
      { key: "ALP" },
      { $inc: { value: 1 } },
      { new: false }
    );
    const currentValue = uidDoc.value;

    const newChild = new Child({
      name,
      age,
      gender,
      email,
      uid: currentValue,
      therapist,
    });

    await newChild.save();

    await childmail(req.body, currentValue);

    res.status(201).json({ studentId: currentValue });
  } catch (error) {
    console.error("Error during child registration:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

    

































































module.exports = router;