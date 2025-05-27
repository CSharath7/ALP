
const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true },
    uid: { type: Number },
    therapist: { type: String },
    selectedGames: [
      {
        name: String,
        assignedLevel: { type: Number, min: 0, max: 4 },
        currentLevel: { type: Number, min: 0, max: 4, default: 0 }
      }
    ],
    session:[
      {
        gameName:String,
        level:Number,
        maxEmotion:String,
        minEmotion:String,
        score:Number
      }
    ]
  },
  { timestamps: true }
);


const Child = mongoose.model("child", childSchema);
module.exports = Child;