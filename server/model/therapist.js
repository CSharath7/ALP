const mongoose = require("mongoose");

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true },
  gender: { type: String, required: true },
  experience: { type: String, required: true },
  specialization: { type: String, required: true },
  contact: { type: String, required: true },
  password: { type: String, required: false },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "child" }] // <-- add this line
});


const PendingTherapist = mongoose.model("PendingTherapist", therapistSchema);
const Therapist = mongoose.model("Therapist", therapistSchema);

module.exports = { PendingTherapist, Therapist };
