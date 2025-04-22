require("dotenv").config()
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { PendingTherapist, Therapist } = require("../model/therapist");
const Child = require("../model/child")
const Id = require("../model/childuniqueid")
const JWT_SECRET = process.env.JWT_SECRET; // Replace with a secure secret key
const cors = require("cors");
const mongoose = require("mongoose");
 // Import bcrypt
const jwt = require("jsonwebtoken"); 
const {childmail} = require("./mail")

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Therapist.findOne({ email });
    if (!user) {
      console.log(user)
      return res.status(400).json({ msg: "User Not Found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("isMatch: " + isMatch)
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    console.log("token: " + token)

    res.json({
      message: "Login successful",
      token,
      therapist: {
        name: user.name,
        age: user.age,
        gender: user.gender,
        email: user.email,
        contact: user.contact,
        experience: user.experience,
        specialization:user.experience
      },
      role:"therapist",
    });
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
    res.status(400).json({ msg: "Invalid or expired token." });
  }
});



router.post("/child-login", async (req, res) => {
  try {
    const {studentId} = req.body;

    // Check if user exists
    const user = await Child.findOne({uid:studentId});
    if (!user) {
      console.log(user);
      return res.status(400).json({ msg: "Invalid Student ID" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    console.log("token: " + token);

      res.json({
        message: "Login successful",
        token,
        child: {
          name: user.name,
          age: user.age,
          gender: user.gender,
          email: user.email,
          uid: user.uid,
        },
        role:"child"
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/child-register", async (req, res) => {
  try {
    const {name,age,gender,email} = req.body;
     
    //  user existence
   const existingChild = await Child.findOne({ email });
   if (existingChild) {
     return res.status(400).json({ msg: "A child with this email already exists." });}
    
      const uidDoc = await Id.findOneAndUpdate(
        { key: "ALP" },
        { $inc: { value: 1 } },
        { new: false }
      );
          const currentValue = uidDoc.value;

    //   new child creation
    const newChild = new Child({
      name,
      age,
      gender,
      email,
      uid: currentValue,
    });

    await newChild.save();

    // send email
    await childmail(req.body, currentValue);

    // client response
    res.status(201).json({ studentId: currentValue });

  } catch (error) {
    console.error("Error during child registration:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

    

































































module.exports = router;