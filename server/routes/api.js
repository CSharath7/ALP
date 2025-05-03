const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { PendingTherapist, Therapist } = require("../model/therapist");
const JWT_SECRET = "mohit@123"; 
const cors = require("cors");
const Child = require("../model/child")

 // Import bcrypt
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const {therapistmail} = require("./mail")
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

// ✅ Configure Nodemailer


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
router.get("/auth/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route!" });
});

// ✅ MIDDLEWARE TO VERIFY JWT

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
console.log(request);
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
    console.log(request)
    const response = await therapistmail(request,randomPassword)
    res.json(response);
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

// Dummy prediction route
router.post("/predict", async (req, res) => {
  const landmarks = req.body.landmarks;

  if (!landmarks || landmarks.length === 0) {
    return res.status(400).json({ emotion: "No face detected" });
  }

  try {
    // Send landmarks to Python backend (running on, say, port 8000)
    const response = await axios.post('http://localhost:8000/predict', { landmarks });

    // Forward Python backend response to frontend
    return res.json({ emotion: response.data.emotion });
  } catch (error) {
    console.error("Error calling Python backend:", error.message);
    return res.status(500).json({ emotion: "Error predicting emotion" });
  }
});


router.post('/getchild/:id', async (req, res) => {
  try {
    const uniqueid = req.params.id;
    const children = await Child.find({ therapist: uniqueid });
    
    res.json({
      success: true,
      children: children
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});


module.exports = router;
