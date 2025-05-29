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
        id: user._id,
        selectedGames:user.selectedGames
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
      currentLevel: 0
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
// POST /save-session-stats
router.post('/save-session-stats', async (req, res) => {
  try {
    const {gameName, level,dominantEmotion, leastEmotion, score,id } = req.body;
    console.log("Received request to save session stats:", gameName, level,dominantEmotion,leastEmotion, score, id);
    if ( !gameName || level === undefined || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const child = await Child.findById(id);

    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    // Add new session data
    child.session.push({ gameName, level, maxEmotion:dominantEmotion,minEmotion:leastEmotion, score });

    // Optionally update currentLevel of the game
    const game = child.selectedGames.find(g => g.name === gameName);
    if (game) {
      game.currentLevel = level;
    }

    await child.save();
    res.status(200).json({ message: "Session stats saved successfully" });
  } catch (err) {
    console.error("Error saving session stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/update-child-level", async (req, res) => {
  const { gameName, currentLevel, id } = req.body;
  console.log("Received request to update level:", gameName, currentLevel, id);

  try {
    const child = await Child.findOneAndUpdate(
      {
        _id: id,
        "selectedGames.name": gameName
      },
      {
        $set: {
          "selectedGames.$.currentLevel": currentLevel
        }
      },
      { new: true }
    );

    if (!child) {
      return res.status(404).json({ message: "Child or game not found." });
    }

    res.status(200).json({ message: "Current level updated successfully.", child });
  } catch (error) {
    console.error("Error updating current level:", error);
    res.status(500).json({ message: "Internal server error." });
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

    // Filter out games where assignedLevel equals currentLevel
    const gamesToShow = child.selectedGames.filter(
      game => game.assignedLevel > game.currentLevel
    );

    res.json({ selectedGames: gamesToShow });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch games" });
  }
});

router.post("/update-child-level", async (req, res) => {
  const { gameName, currentLevel } = req.body;

  if (typeof gameName !== "string" || typeof currentLevel !== "number") {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    // Assuming you have a way to identify the child without authentication
    // You might want to pass child's ID in the request body or query parameters
    // For example:
    const childId = req.body.childId;
    if (!childId) {
      return res.status(400).json({ message: "Missing childId" });
    }

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ message: "Child not found" });

    // Find the game in selectedGames array
    const game = child.selectedGames.find((g) => g.name === gameName);
    if (!game) {
      return res.status(404).json({ message: `Game ${gameName} not assigned to child` });
    }

    // Update currentLevel, ensure it is between 1 and 5
    if (currentLevel < 1 || currentLevel > 5) {
      return res.status(400).json({ message: "currentLevel must be between 1 and 5" });
    }

    game.currentLevel = currentLevel;

    await child.save();

    return res.json({
      message: "Child's currentLevel updated successfully",
      selectedGame: game,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
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


router.get("/profile/:id", async (req, res) => {
  try {
    const childId = req.params.id;
    const role = req.query.role;

    if (!role || !["child", "therapist"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing role parameter" });
    }

    let responseData;

    if (role === "child") {
      // Find child by MongoDB _id
      const child = await Child.findById(childId).select(
        "name email age uid selectedGames session"
      );

      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }

      responseData = {
        name: child.name,
        email: child.email,
        age: child.age,
        id: child._id.toString(),
        role: "child",
        uid: child.uid || null,
        numberOfGamesPlayed: child.session.length,
        selectedGames: child.selectedGames.map((game) => ({
          name: game.name,
          assignedLevel: game.assignedLevel,
          currentLevel: game.currentLevel,
        })),
      };
    } else {
      // Find therapist by MongoDB _id and populate children
      const therapist = await Therapist.findById(childId)
        .select("name email age experience specialization contact children")
        .populate("children", "name _id");

      if (!therapist) {
        return res.status(404).json({ message: "Therapist not found" });
      }

      responseData = {
        name: therapist.name,
        email: therapist.email,
        age: therapist.age,
        id: therapist._id.toString(),
        role: "therapist",
        experience: therapist.experience,
        specialization: therapist.specialization,
        contact: therapist.contact,
        children: therapist.children.map((child) => ({
          id: child._id.toString(),
          name: child.name,
        })),
      };
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
