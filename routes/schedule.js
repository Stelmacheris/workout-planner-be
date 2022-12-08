const router = require("express").Router();

const { model } = require("mongoose");
let Schedule = require("../models/schedule.model");
let Workout = require("../models/workout.model");
let User = require("../models/user.model");
const {ObjectId} = require('mongodb');

router.route("/").post(async (req, res) => {
  try {
    const workout = await Workout.findById(req.body.workout);
    const scheduleWorkout = new Schedule({
      date: req.body.date,
      user: ObjectId("6351b75769c3ee646a031ca0"),
      workout: req.body.workout,
    });
    if (
      req.body.date === undefined ||
      req.body.workout === undefined ||
      req.body.date.trim().length === 0 ||
      req.body.workout.trim().length === 0
    ) {
      res.status(400).json({ message: "All credentials should be not empty!" });
    } else {
      const response = await scheduleWorkout.save();
      if (response) {
        res.status(201).json({
          message: "Workout added to your schedule",
          _id: scheduleWorkout._id,
        });
      } else {
        res.status(400).json({ message: "Error" });
      }
    }
  } catch {
    res.status(404).json({ message: "Not found" });
  }
});

router.route("/:workoutId").get(async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.workoutId);
    if (schedule) {
      res.status(200).json({ schedule });
    } else {
      res.status(400).json({ message: "Error", status: 400 });
    }
  } catch {
    res.status(404).json({ message: "Not found" });
  }
});

router.route("/:scheduleId").put(async (req, res) => {
  try {
    if (
      req.body.date === undefined ||
      req.body.workout === undefined ||
      req.body.date.trim().length === 0 ||
      req.body.workout.trim().length === 0
    ) {
      res.status(400).json({ message: "All credentials should be not empty!" });
    } else {
      const schedule = await Schedule.findById(req.params.scheduleId);
      const response = await Schedule.findByIdAndUpdate(
        req.params.scheduleId,
        req.body,
        {
          new: true,
        }
      );
      if (response) {
        res.status(200).json({ message: "Updated succesfully" });
      } else {
        res.status(400).json({ message: "Error" });
      }
    }
  } catch {
    res.status(404).json({ message: "Not found" });
  }
});

router.route("/:scheduleId").delete(async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.scheduleId);

    if ( schedule) {
      const response = await Schedule.findByIdAndDelete(req.params.scheduleId);
      res.status(204).json({ message: "Deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch {
    res.status(404).json({ message: "Not found" });
  }
});
module.exports = router;
