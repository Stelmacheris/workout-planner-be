const mongoose = require("mongoose");

const MeasurementSchema = new mongoose.Schema({
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

MeasurementSchema.set("timestamps", true);

module.exports = mongoose.model("measurements", MeasurementSchema);
