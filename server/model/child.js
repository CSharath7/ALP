const mongoose = require("mongoose");
const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true
    },
    uid: {
      type: Number,
    },
    therapist:{
      type: String,
    },
  },
  { timestamps: true }
);
const Child = mongoose.model("child", childSchema);
module.exports = Child;
