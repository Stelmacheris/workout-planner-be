const router = require("express").Router();
let User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const verifyToken = require("../verify/verify.js");
require("dotenv").config();

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

router.route("/register").post(async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const userType = req.body.userType;
  const user = new User({ username, email, password, userType });
  try {
    const usernameExist = await User.find({ username });
    const emailExist = await User.find({ email });
    if (usernameExist.length > 0) {
      res.status(400).json({ message: "Username exists!"});
    } else if (emailExist.length > 0) {
      res.status(400).json({ message: "E-mail exists!"});
    } else {
      const isSave = isValidRegister(user);
      if (!isSave.toSave) {
        res.status(400).json({ message: isSave.message });
      } else {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(201).json({ message: isSave.message});
      }
    }
  } catch (e) {
    res.status(400).json({ message: "Error"});
  }
});
const generateAccessToken = user =>{
  return jwt.sign({_id:user._id.toString(),userType:user.userType},process.env.SECRET_KEY,{expiresIn:"20m"});
}
const generateRefreshToken = user =>{
  return jwt.sign({_id:user._id.toString(),userType:user.userType},process.env.REFRESH_TOKEN,{expiresIn:"20m"});
}

let refreshTokens = [];
router.route("/login").post(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.find({ username });
  if (user.length === 0) {
    res.status(400).json({ error: "User does not exist" });
  } else {
    const dbPassword = user[0].password;
    const validPassword = await bcrypt.compare(password, dbPassword);
    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Wrong login credentials!", });
    } else {
      const accessToken = generateAccessToken(user[0]);
      const refreshToken = generateRefreshToken(user[0]);
      refreshTokens.push(refreshToken)
      console.log({_id:user[0]._id.toString(),userType:user[0].userType});
      res.status(201).json({user:user[0],accessToken,refreshToken});
      
    }
  }
});

router.route("/refresh").post(async(req,res) =>{
  const refreshToken = req.body.token;
console.log(refreshToken)
  if(!refreshToken) return res.sendStatus(401);
  if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

  jwt.verify(refreshToken,process.env.REFRESH_TOKEN, (err,user) =>{
    if(err) return res.sendStatus(401);

    refreshTokens = refreshTokens.filter(token => token !=refreshToken);

    const newAccesToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({accessToken:newAccesToken,refreshToken:newRefreshToken});


  })

})

router.route('/logout').post(verifyToken,(req,res)=>{
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.sendStatus(200)
})

module.exports = router;
