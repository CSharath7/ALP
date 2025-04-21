require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Import bcrypt
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const { PendingTherapist, Therapist } = require("./model/therapist");
const apiRouter = require("./routes/api");
const defaultRouter = require("./routes/default");
const app = express();
const port = 5000;
const JWT_SECRET =process.env.JWT_SECRET; // Replace with a secure secret key

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database Connection
<<<<<<< HEAD
mongoose.connect("mongodb+srv://G373:DeleteDyslexia@cluster0.rtm72oj.mongodb.net/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});
=======
mongoose
  .connect("mongodb+srv://G373:DeleteDyslexia@cluster0.rtm72oj.mongodb.net/therapistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
>>>>>>> 010cbc12dfe368b42b4f539f42fddff8b332ae1d
app.use("/", defaultRouter);
app.use("/api", apiRouter);

// Login Route

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
