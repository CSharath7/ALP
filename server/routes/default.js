require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PendingTherapist, Therapist } = require("../model/therapist");
const Child = require("../model/child");
const Admin = require("../model/admin");
const Id = require("../model/Childid");
const { childmail } = require("./mail");

const JWT_SECRET = process.env.JWT_SECRET;

/* --------------------------------------------
   ✅ SuperAdmin & Therapist Login
-------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (admin && await bcrypt.compare(password, admin.password)) {
      const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1h" });
      return res.json({ token, role: "superadmin", name: admin.name, email: admin.email });
    }

    const therapist = await Therapist.findOne({ email });
    if (therapist && await bcrypt.compare(password, therapist.password)) {
      const token = jwt.sign({ id: therapist._id }, JWT_SECRET, { expiresIn: "1h" });
      return res.json({
        token,
        role: "therapist",
        name: therapist.name,
        email: therapist.email,
        id: therapist._id
      });
    }

    return res.status(400).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

/* --------------------------------------------
   ✅ Therapist Password Reset
-------------------------------------------- */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await Therapist.findByIdAndUpdate(decoded.id, { password: hashedPassword });
    res.json({ message: "Password reset successfully. Please log in again.", logout: true });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
  }
});

/* --------------------------------------------
   ✅ Child Login
-------------------------------------------- */
router.post("/child-login", async (req, res) => {
  try {
    const { studentId } = req.body;
    const user = await Child.findOne({ uid: studentId });

    if (!user) return res.status(400).json({ error: "Invalid Student ID" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      child: {
        name: user.name,
        email: user.email,
        uid: user.uid,
        id: user._id
      },
      role: "child"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* --------------------------------------------
   ✅ Child Registration
-------------------------------------------- */
router.post("/child-register", async (req, res) => {
  try {
    const { name, age, gender, email, therapistid, selectedGames } = req.body;

    if (!name || !age || !gender || !email || !therapistid || !Array.isArray(selectedGames)) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const uid = Math.floor(100000 + Math.random() * 900000);

    const gamesWithLevels = selectedGames.map(game => ({
      name: game.name,
      assignedLevel: game.level,
      currentLevel: 1
    }));

    const newChild = new Child({
      name,
      age,
      gender,
      email,
      uid,
      therapist: therapistid,
      selectedGames: gamesWithLevels
    });

    await newChild.save();
    await childmail(req.body, uid);

    res.status(201).json({ success: true, message: "Child registered successfully", uid });
  } catch (err) {
    console.error("Child registration failed:", err.message);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

/* --------------------------------------------
   ✅ Update Game Level + Session Log
-------------------------------------------- */
router.post("/updatelevel", async (req, res) => {
  const { childId, gameName, level, maxEmotion, minEmotion, score } = req.body;

  try {
    if (!childId || !gameName || level === undefined || !maxEmotion || !minEmotion || score === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const child = await Child.findOne({ uid: childId });
    if (!child) return res.status(404).json({ success: false, message: "Child not found" });

    const game = child.selectedGames.find(game => game.name === gameName);
    if (!game) return res.status(404).json({ success: false, message: "Game not assigned to child" });

    game.currentLevel = level;

    child.session.push({ gameName, level, maxEmotion, minEmotion, score });
    await child.save();

    res.status(200).json({ success: true, message: "Level updated successfully", game });
  } catch (error) {
    console.error("Error updating level:", error);
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
});

/* --------------------------------------------
   ✅ Get Game Levels for a Specific Game
-------------------------------------------- */
router.get('/getlevel/:childId/:gameName', async (req, res) => {
  try {
    const { childId, gameName } = req.params;

    // Find the child by ID (assuming childId is _id in MongoDB)
const child = await Child.findOne({ uid: Number(childId) });

    if (!child) {
      return res.status(404).json({ success: false, message: "Child not found" });
    }

    // Find the game in the child's selectedGames array
const gameData = child.selectedGames.find(game => game.name === gameName);

    if (!gameData) {
      // If the game is not found, you can respond with level 0 or some default
      return res.json({ success: true, currentLevel: 0 });
    }

    // Respond with the currentLevel for the game
    res.json({ success: true, currentLevel: gameData.currentLevel });

  } catch (error) {
    console.error('[ERROR] getlevel route failed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* --------------------------------------------
   ✅ Get Child's Selected Games
-------------------------------------------- */
router.get("/child/:uid", async (req, res) => {
  try {
    const child = await Child.findOne({ uid: req.params.uid });
    if (!child) return res.status(404).json({ message: "Child not found" });

    res.json({ selectedGames: child.selectedGames });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch games" });
  }
});

/* --------------------------------------------
   ✅ Get Child's Game Report
-------------------------------------------- */
router.get('/getchildreport/:uid', async (req, res) => {
  try {
    const uid = parseInt(req.params.uid, 10);
    const child = await Child.findOne({ uid });

    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

    if (!child.selectedGames || child.selectedGames.length === 0) {
      return res.json({ success: false, message: 'No games assigned to this child' });
    }

    res.json({ success: true, games: child.selectedGames });
  } catch (error) {
    console.error('Error fetching child report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
