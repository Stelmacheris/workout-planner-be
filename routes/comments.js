const router = require("express").Router();
let Comment = require("../models/comment.model");
let Workout = require("../models/workout.model");
let User = require("../models/user.model");
let Sportsman = require("../models/sportsman.model");
const verifyToken = require("../verify/verify.js");
const { ObjectId } = require("mongodb");
//Workout comments
router.route("/:commentId/").get(verifyToken, async (req, res) => {
  if (req.user) {
    const sportsmanId = req.baseUrl.split("/");
    const sportsman1 = sportsmanId[2];
    const workout1 = sportsmanId[4];
    try {
      const sportsman = await Sportsman.findById(ObjectId(sportsman1));
      const workouts = await Workout.find({
        _id: ObjectId(workout1),
        sportsman: sportsman._id,
      });
      const comments = await Comment.find({
        _id: req.params.commentId,
        trainer: sportsman._id,
        workout: workouts[0]._id,
      });
      res.status(200).json(comments[0]);
    } catch {
      res.status(404).json({ message: "Not found" });
    }
  } else {
    return res.sendStatus(401);
  }
});

router.route("/").get(verifyToken, async (req, res) => {
  if (req.user) {
    const sportsmanId = req.baseUrl.split("/");
    const sportsman1 = sportsmanId[2];
    const workout1 = sportsmanId[4];
    // try {
    const sportsman = await Sportsman.findById(ObjectId(sportsman1));
    const workouts = await Workout.find({
      _id: ObjectId(workout1),
      sportsman: sportsman._id,
    });
    const comments = await Comment.find({
      workout: workouts[0]._id,
      trainer: sportsman._id,
    });
    res.status(200).json(comments);

    // } catch {
    //   res.status(404).json({ message: "Not found1" });
    // }
  } else {
    return req.sendStatus(401);
  }
});

router.route("/").post(verifyToken, async (req, res) => {
  const sportsmanId = req.baseUrl.split("/");
  const sportsman1 = sportsmanId[2];
  const workout1 = sportsmanId[4];
  const sportsman = await Sportsman.findById(ObjectId(sportsman1));
  const workouts = await Workout.find({
    _id: ObjectId(workout1),
    sportsman: sportsman._id,
  });
  const comment = new Comment({
    name: req.body.name,
    description: req.body.description,
    user: req.user._id,
    workout: workouts[0]._id,
    trainer: sportsman1,
  });
  await comment.save();
  res.status(201).json(comment);
});

router.route("/:commentId").put(verifyToken, async (req, res) => {
  const sportsmanId = req.baseUrl.split("/");
  const sportsman1 = sportsmanId[2];
  const workout1 = sportsmanId[4];
  try {
    const sportsman = await Sportsman.findById(ObjectId(sportsman1));
    const workouts = await Workout.find({
      _id: ObjectId(workout1),
      sportsman: sportsman._id,
    });
    const comments = await Comment.find({
      _id: req.params.commentId,
      trainer: sportsman._id,
      workout: workouts[0]._id,
    });
    console.log("req.user._id, comments[0].user.toString()");
    if (req.user._id === comments[0].user.toString()) {
      await Comment.findByIdAndUpdate(req.params.commentId, req.body, {
        new: true,
      });
      res.status(200).json({ message: "Updates succesfully" });
    }
  } catch {
    res.status(404).json({ message: "Not found" });
  }
});

router.route("/:commentId").delete(verifyToken, async (req, res) => {
  console.log("tets");
  const sportsmanId = req.baseUrl.split("/");
  const sportsman1 = sportsmanId[2];
  const workout1 = sportsmanId[4];
  try {
    const sportsman = await Sportsman.findById(ObjectId(sportsman1));
    const workouts = await Workout.find({
      _id: ObjectId(workout1),
      sportsman: sportsman._id,
    });
    if (workouts[0] && sportsman) {
      const comments = await Comment.find({
        _id: req.params.commentId,
        trainer: sportsman._id,
        workout: workouts[0]._id,
      });
      console.log(comments);
      if (req.user._id === comments[0].user.toString()) {
        if (comments.length !== 0) {
          await Comment.findByIdAndDelete(req.params.commentId);
          res.status(204).json({ message: "Deleted succesfully" });
        } else {
          res.status(404).json({ message: "Not found3" });
        }
      } else {
        res.sendStatus(403);
      }
    } else {
      res.status(404).json({ message: "Not found2" });
    }
  } catch {
    res.status(404).json({ message: "Not found1" });
  }
});
module.exports = router;
