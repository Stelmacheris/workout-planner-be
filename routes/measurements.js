const router = require("express").Router();
let Measurement = require("../models/measurements.model");
let Workout = require("../models/workout.model");
let User = require("../models/user.model");
const verifyToken = require("../verify/verify.js");
const { ObjectId } = require("mongodb");

router.route("/:id").get(verifyToken, async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);
    if (measurement) {
      res.status(200).json(measurement);
    } else {
      res.sendStatus(404);
    }
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});
router.route("/").get(verifyToken, async (req, res) => {
  try {
    const measurements = await Measurement.find({ userId: req.user._id });
    res.status(200).json(measurements);
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

router.route("/").post(verifyToken, async (req, res) => {
  try {
    if (
      req.body.height.trim().length === 0 ||
      req.body.weight.trim().length === 0
    ) {
      res.sendStatus(400);
    } else {
      const measurement = new Measurement({
        height: req.body.height,
        weight: req.body.weight,
        userId: req.user._id,
      });
      await measurement.save();
      res.status(201).json(measurement);
    }
  } catch {
    res.sendStatus(404);
  }
});

router.route("/:measurementId").put(verifyToken, async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.measurementId);
    if (
      req.body.height.trim().length === 0 ||
      req.body.weight.trim().length === 0 ||
      req.body.height === undefined ||
      req.body.weight === undefined
    ) {
      res.sendStatus(400);
    } else {
      if (measurement) {
        const measurements = await Measurement.findByIdAndUpdate(
          req.params.measurementId,
          req.body,
          {
            new: true,
          }
        );
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    }
  } catch {}
});

router.route("/:measurementId").delete(async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.measurementId);
    if (measurement) {
      await Measurement.findByIdAndDelete(req.params.measurementId);
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch {}
});

module.exports = router;
