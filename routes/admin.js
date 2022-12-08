const router = require("express").Router();
let Workout = require("../models/workout.model");
let User = require("../models/user.model");
let Sportsman = require("../models/sportsman.model");
const validator = require("validator");
const bcrypt = require("bcrypt");
const verifyToken = require("../verify/verify.js");
const isValidRegister = (user) => {
  if (!validator.isEmail(user.email)) {
    return {
      toSave: false,
      message: "E-mail is not valid!",
    };
  }

  if (!validator.isLength(user.password, { min: 6, max: 24 })) {
    console.log(user.password);
    return {
      toSave: false,
      message: "Password should be between 6 and 24 characters!",
    };
  }

  if (!validator.isLength(user.username, { min: 6, max: 24 })) {
    return {
      toSave: false,
      message: "Username should be between 6 and 24 characters!",
    };
  }

  return {
    toSave: true,
    message: "User added succesfully",
  };
};

router.route("/").post(verifyToken, async (req, res) => {
  if (req.user?.userType === "admin") {
    try {
      const { name, club, username, password, email } = req.body;
      if (
        name === undefined ||
        club === undefined ||
        name.trim().length === 0 ||
        club.trim().length === 0 ||
        username === undefined ||
        username.trim().length === 0 ||
        password === undefined ||
        password.trim().length === 0 ||
        email === undefined ||
        email.trim().length === 0
      ) {
        res.status(400).json({
          message: "All credentials should be not empty!",
        });
      } else {
        const sportsman = new Sportsman({
          name,
          club,
          username,
          password,
        });

        const user = new User({
          username,
          email,
          password,
          userType: "trainer",
        });

        const usernameExist = await User.find({ username });
        const emailExist = await User.find({ email });
        if (usernameExist.length > 0) {
          res.status(400).json({ message: "Username exists!" });
        } else if (emailExist.length > 0) {
          res.status(400).json({ message: "E-mail exists!" });
        } else {
          const isSave = isValidRegister(user);
          if (!isSave.toSave) {
            res.status(400).json({ message: isSave.message });
          } else {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            sportsman.password = await bcrypt.hash(password, salt);
            sportsman._id = user._id;
            await sportsman.save();
            await user.save();
            res.status(201).json(sportsman);
          }
        }
      }
    } catch {
      res.status(404).json({ message: "Not found" });
    }
  } else {
    res.sendStatus(403);
  }
});

router.route("/:sportsmanId").get(verifyToken, async (req, res) => {
  try {
    const sportsmans = await Sportsman.findById(req.params.sportsmanId);
    if (sportsmans.length !== 0) {
      res.status(200).json(sportsmans);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch {
    res.status(404).json({ message: "Not found" });
  }
});
router.route("/").get(verifyToken, async (req, res) => {
  try {
    const sportsmans = await Sportsman.find({});
    res.status(200).json(sportsmans);
  } catch {
    res.status(404).json({ message: "Not found" });
  }
});

router.route("/:sportsmanId").delete(verifyToken, async (req, res) => {
  if (
    req.user.userType === "admin" ||
    req.params.sportsmanId === req.user._id
  ) {
    try {
      const sportsman = await Workout.findById(req.params.sportsmanId);
      await User.findByIdAndDelete(req.params.sportsmanId);
      await Sportsman.findByIdAndDelete(req.params.sportsmanId);
      res.status(204).json({ message: "Deleted succesfully" });
    } catch {
      res.status(404).json({ message: "Not found" });
    }
  } else {
    res.sendStatus(403);
  }
});

router.route("/:sportsmanId").put(verifyToken, async (req, res) => {
  if (
    req.user.userType === "admin" ||
    req.params.sportsmanId === req.user._id
  ) {
    try {
      const { name, club } = req.body;

      const sportsman = await Sportsman.findById(req.params.sportsmanId);
      if (
        name === undefined ||
        club === undefined ||
        name.trim().length === 0 ||
        club.trim().length === 0
      ) {
        res.status(400).json({
          message: "All credentials should be not empty!",
        });
      } else {
        const sportsman = await Sportsman.findByIdAndUpdate(
          req.params.sportsmanId,
          req.body,
          {
            new: true,
          }
        );
        res.status(200).json({ message: "Updated succesfully!" });
      }
    } catch {
      res.status(404).json({ message: "User or workout not found" });
    }
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
