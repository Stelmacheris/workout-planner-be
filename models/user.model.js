const mongoose = require("mongoose");
const lengthValidator = {
  minlength: 6,
  maxlength: 255,
};

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["user", "admin", "trainer"],
    default: "user",
  },
});

module.exports = mongoose.model("User", UserSchema);
