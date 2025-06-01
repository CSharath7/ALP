const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../model/admin");
const { PendingTherapist, Therapist } = require("../model/therapist");
const Child = require("../model/child")
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register SuperAdmin
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "SuperAdmin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login SuperAdmin
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, name: admin.name, role: "superadmin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, name: admin.name, role: "superadmin" });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});
// routes/therapists.js

// Get all therapists
router.get("/therapists", async (req, res) => {
  console.log("Fetching all therapists...");
  try {
    const therapists = await Therapist.find(); // Fetch all therapists
    console.log("Therapists fetched:", therapists); // Log the fetched data
    res.json(therapists);
} catch (error) {
    console.error("Error fetching therapists:", error); // Log any errors
    res.status(500).json({ message: "Error fetching therapists" });
}

});
router.get("/children/:id", async (req, res) => {
  console.log("Fetching all therapists...");
  try {
    const therapist=await Therapist.findById(req.params.id);
    const children = await Child.find({therapist:req.params.id}); // Fetch all therapists
    console.log("Children fetched:", children); // Log the fetched data
    res.json({children,therapist});
  } catch (error) {
    console.error("Error fetching therapists:", error); // Log any errors
    res.status(500).json({ message: "Error fetching therapists" });
  }
});



module.exports = router;