const mongoose = require("mongoose");
const idschema = new mongoose.Schema(
  { 
    key:{
        type:String,
        default:"ALP"
    },
    value:{
        type:Number,
        default:373
    },
  },
  { timestamps: true }
);
const Id = mongoose.model("id", idschema);
module.exports = Id;
