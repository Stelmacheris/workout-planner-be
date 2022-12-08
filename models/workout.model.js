const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  link: {
    type: String,
  },
  description: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  sportsman: { type: mongoose.Schema.Types.ObjectId, ref: "Sportsman" },

});

module.exports = mongoose.model("Workout", WorkoutSchema);
