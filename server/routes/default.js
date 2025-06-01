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
   ✅ Helper Functions for Level Adjustment
-------------------------------------------- */
const adjustLevel = (emotionList, score, currentLevel) => {
  console.log("adjustLevel called with:", { emotionList, score, currentLevel });

  const emotionValues = {
    happy: 2,
    surprised: 1.5,
    neutral: 0.5,
    sad: -0.5,
    fear: -0.5,
    anger: -0.5,
    disgust: -0.5,
    contempt: -0.5,
  };

  if (!emotionList || emotionList.length === 0) {
    console.warn("Emotion list is empty. Keeping current level:", currentLevel);
    return currentLevel;
  }

  let totalEmotionScore = 0;
  for (let emotion of emotionList) {
    totalEmotionScore += emotionValues[emotion] ?? 0;
    console.log(
      `Processing emotion: ${emotion}, value: ${
        emotionValues[emotion] ?? 0
      }, running total: ${totalEmotionScore}`
    );
  }
  const avgEmotionScore = totalEmotionScore / emotionList.length;
  console.log(`Average emotion score: ${avgEmotionScore}`);

  const normalizedScore = score / 100;
  console.log(`Normalized score: ${normalizedScore}`);

  const finalScore = (0.4 * (avgEmotionScore + 3)) / 6 + 0.6 * normalizedScore;
  console.log(`Final score: ${finalScore}`);

  const levels = [0, 1, 2, 3, 4]; // Adjust based on WordWizard.json
  let newLevel = currentLevel;
  if (finalScore > 0.6) {
    newLevel = Math.min(currentLevel + 1, levels.length - 1);
    console.log(`Final score > 0.6, increasing level to: ${newLevel}`);
  } else if (finalScore < 0.3) {
    newLevel = Math.max(currentLevel - 1, 0);
    console.log(`Final score < 0.3, decreasing level to: ${newLevel}`);
  } else {
    console.log(`Final score between 0.3 and 0.6, keeping level: ${newLevel}`);
  }

  console.log("Adjusted level:", newLevel);
  return newLevel;
};

const calculateDominantEmotions = (emotions) => {
  console.log("calculateDominantEmotions called with:", emotions);

  if (!emotions || emotions.length === 0) {
    console.warn("Emotions array is empty. Returning neutral emotions.");
    return { maxEmotion: "neutral", minEmotion: "neutral" };
  }

  const emotionCounts = emotions.reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});
  console.log("Emotion counts:", emotionCounts);

  const emotionEntries = Object.entries(emotionCounts);
  const maxCount = Math.max(...emotionEntries.map(([, count]) => count));
  const minCount = Math.min(...emotionEntries.map(([, count]) => count));
  console.log(`Max count: ${maxCount}, Min count: ${minCount}`);

  const maxEmotions = emotionEntries
    .filter(([, count]) => count === maxCount)
    .map(([emotion]) => emotion)
    .sort();
  const minEmotions = emotionEntries
    .filter(([, count]) => count === minCount)
    .map(([emotion]) => emotion)
    .sort();

  const result = {
    maxEmotion: maxEmotions[0] || "neutral",
    minEmotion: minEmotions[0] || "neutral",
  };
  console.log("Dominant emotions:", result);
  return result;
};

/* --------------------------------------------
   ✅ SuperAdmin & Therapist Login
-------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign({ id: admin._id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({
        token,
        role: "superadmin",
        name: admin.name,
        email: admin.email,
      });
    }

    const therapist = await Therapist.findOne({ email });
    if (therapist && (await bcrypt.compare(password, therapist.password))) {
      const token = jwt.sign({ id: therapist._id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({
        token,
        role: "therapist",
        name: therapist.name,
        email: therapist.email,
        id: therapist._id,
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
    res.json({
      message: "Password reset successfully. Please log in again.",
      logout: true,
    });
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
        selectedGames: user.selectedGames,
      },
      role: "child",
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

    if (
      !name ||
      !age ||
      !gender ||
      !email ||
      !therapistid ||
      !Array.isArray(selectedGames)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const uid = Math.floor(100000 + Math.random() * 900000);

    const gamesWithLevels = selectedGames.map((game) => ({
      name: game.name,
      assignedLevel: game.level,
      currentLevel: 0,
    }));

    const newChild = new Child({
      name,
      age,
      gender,
      email,
      uid,
      therapist: therapistid,
      selectedGames: gamesWithLevels,
    });

    await newChild.save();
    await childmail(req.body, uid);

    res
      .status(201)
      .json({ success: true, message: "Child registered successfully", uid });
  } catch (err) {
    console.error("Child registration failed:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
});

/* --------------------------------------------
   ✅ Update Game Level + Session Log
-------------------------------------------- */
router.post("/update-child-level", async (req, res) => {
  try {
    const { childId, gameName, score, emotions } = req.body;
    console.log("Received /update-child-level request:", {
      childId,
      gameName,
      score,
      emotions,
    });

    if (
      !childId ||
      !gameName ||
      score === undefined ||
      !Array.isArray(emotions)
    ) {
      console.error("Missing required fields in request body");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Fetching child from database with ID:", childId);
    const child = await Child.findById(childId);
    if (!child) {
      console.error("Child not found for ID:", childId);
      return res.status(404).json({ error: "Child not found" });
    }

    console.log("Child found:", { name: child.name, uid: child.uid });
    const game = child.selectedGames.find((g) => g.name === gameName);
    if (!game) {
      console.error(`Game ${gameName} not assigned to child`);
      return res
        .status(404)
        .json({ error: `Game ${gameName} not assigned to child` });
    }

    console.log("Found game:", { gameName, currentLevel: game.currentLevel });
    const currentLevel = game.currentLevel;
    const newLevel = adjustLevel(emotions, score, currentLevel);
    const { maxEmotion, minEmotion } = calculateDominantEmotions(emotions);

    console.log("Updating game currentLevel to:", newLevel);
    game.currentLevel = newLevel;

    console.log("Adding session data:", {
      gameName,
      level: newLevel,
      maxEmotion,
      minEmotion,
      score,
    });
    child.session.push({
      gameName,
      level: newLevel,
      maxEmotion,
      minEmotion,
      score,
      timestamp: new Date(),
    });

    console.log("Saving child document to database");
    await child.save();
    console.log("Child document saved successfully");

    res.status(200).json({ newLevel });
    console.log("Response sent with newLevel:", newLevel);
  } catch (error) {
    console.error("Error in /update-child-level:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* --------------------------------------------
   ✅ Save Session Stats
-------------------------------------------- */
router.post("/save-session-stats", async (req, res) => {
  try {
    // const { gameName, level, dominantEmotion, leastEmotion, score, id } =
    //   req.body;
    // console.log(
    //   "Received request to save session stats:",
    //   gameName,
    //   level,
    //   dominantEmotion,
    //   leastEmotion,
    //   score,
    //   id
    // );
    // if (!gameName || level === undefined || score === undefined) {
    //   return res.status(400).json({ error: "Missing required fields" });
    // }

    // const child = await Child.findById(id);
    // if (!child) {
    //   return res.status(404).json({ error: "Child not found" });
    // }

    // // Add new session data
    // child.session.push({
    //   gameName,
    //   level,
    //   maxEmotion: dominantEmotion,
    //   minEmotion: leastEmotion,
    //   score,
    // });

    //  Optionally update currentLevel of the game
    // const game = child.selectedGames.find((g) => g.name === gameName);
    // if (game) {
    //   game.currentLevel = level;
    // }

    // await child.save();
    res.status(200).json({ message: "Session stats saved successfully" });
  } catch (err) {
    console.error("Error saving session stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* --------------------------------------------
   ✅ Get Game Levels for a Specific Game
-------------------------------------------- */
router.get("/getlevel/:childId/:gameName", async (req, res) => {
  try {
    const { childId, gameName } = req.params;

    const child = await Child.findOne({ uid: Number(childId) });
    if (!child) {
      return res
        .status(404)
        .json({ success: false, message: "Child not found" });
    }

    const gameData = child.selectedGames.find((game) => game.name === gameName);
    if (!gameData) {
      return res.json({ success: true, currentLevel: 0 });
    }

    res.json({ success: true, currentLevel: gameData.currentLevel });
  } catch (error) {
    console.error("[ERROR] getlevel route failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* --------------------------------------------
   ✅ Get Child's Selected Games
-------------------------------------------- */
router.get("/child/:uid", async (req, res) => {
  try {
    const child = await Child.findOne({ uid: req.params.uid });
    if (!child) return res.status(404).json({ message: "Child not found" });

    const gamesToShow = child.selectedGames.filter(
      (game) => game.assignedLevel > game.currentLevel
    );

    res.json({ selectedGames: gamesToShow });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch games" });
  }
});

/* --------------------------------------------
   ✅ Get Child's Game Report
-------------------------------------------- */
router.get("/getchildreport/:uid", async (req, res) => {
  try {
    const uid = parseInt(req.params.uid, 10);
    const child = await Child.findOne({ uid });

    if (!child)
      return res
        .status(404)
        .json({ success: false, message: "Child not found" });

    if (!child.selectedGames || child.selectedGames.length === 0) {
      return res.json({
        success: false,
        message: "No games assigned to this child",
      });
    }

    res.json({ success: true, games: child.selectedGames });
  } catch (error) {
    console.error("Error fetching child report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* --------------------------------------------
   ✅ Get Profile
-------------------------------------------- */
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
