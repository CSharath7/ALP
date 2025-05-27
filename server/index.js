require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PendingTherapist, Therapist } = require("./model/therapist");
const apiRouter = require("./routes/api");
const defaultRouter = require("./routes/default");
const superAdminRoutes = require("./routes/superadmin");

const app = express();
const port = 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect("mongodb+srv://G373:DeleteDyslexia@cluster0.rtm72oj.mongodb.net/therapistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});
app.post('/landmark_emotion', (req, res) => {
  const data = req.body;
  console.log("🎭 Received emotion data:", data);
  
  // You can process, log, store, or emit this data here
  res.status(200).json({ status: 'received' });
});

// Routers
app.use("/", defaultRouter);
app.use("/api", apiRouter);
app.use("/superadmin", superAdminRoutes);

// Game Route
app.get("/game", (req, res) => {
  res.send("Game server running.");
});


// Start Server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
