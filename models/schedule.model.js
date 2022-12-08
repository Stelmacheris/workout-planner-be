const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
  },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  workout: { type: mongoose.Schema.Types.ObjectId, ref: "Workout" },
});

ScheduleSchema.set("timestamps", true);

module.exports = mongoose.model("schedules", ScheduleSchema);
