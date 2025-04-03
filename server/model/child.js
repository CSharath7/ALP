const mongoose = require("mongoose");
const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Integer,
      required: true,
      
    },
    gender:{
      type:String,
      required: true,
    },
    contact:{
      type: String,
      required: true,
    },
    username:{
      type: String,
      required: true,
      unique: true,
    },
    password:{
      type: String,
      required: true,
    },
    fathername:{
      type: String,
      required: true,
    },
    therapist:{
      type:String,
      required: true,
    }
  },
  { timestamps: true }
);
const child = mongoose.model("user", childSchema);
module.exports = child;
