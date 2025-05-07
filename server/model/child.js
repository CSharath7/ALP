const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true },
    uid: { type: Number },
    therapist: { type: String },
    wordWizardLevel: { type: Number, default: 0 },
    selectedGames: [
      {
        name: String,
        level: { type: Number, min: 1, max: 4 }
      }
    ]
  },
  { timestamps: true }
);

const Child = mongoose.model("child", childSchema);
module.exports = Child;
