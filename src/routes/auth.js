const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authenticateToken = require("../middlewares/auth");
const { makeReward } = require("../resolvers/rewards");
const { isAccountSuspended } = require("../resolvers/auth");
dotenv.config();
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Staircase Auth Server!");
});

router.post("/register", async (req, res) => {
  const { name, password, email, referralCode } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
  } else if (!password) {
    res.status(400).json({ message: "Password is required" });
  } else if (!name) {
    res.status(400).json({ message: "Name is required" });
  } else {
    // checking if user already exists
    const alreadyUser = await User.findOne({ email });
    if (alreadyUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    // create a new user
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = new User({
      name,
      email,
      passwordHash,
    });
    // adding referral reward to the user
    if (referralCode) {
      const referringUser = await User.findById(referralCode);
      if (referringUser) {
        const rewardToReferrer = makeReward({
          coins: 100,
          hints: 5,
          xp: 0,
          collectible: true,
          description: `Referral reward from ${user.name}`,
        });
        const rewardToUser = makeReward({
          coins: 100,
          hints: 5,
          xp: 0,
          collectible: true,
          description: `Referral reward for joining from ${referringUser.name}`,
        });
        user.rewards.push(rewardToUser);
        referringUser.rewards.push(rewardToReferrer);
        referringUser.referrals.push({
          id: user._id,
          name: user.name,
          time: Date.now(),
        });
        await referringUser.save();
      }
    }
    await user.save();
    // generating token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1w",
    });
    // sending token in a cookie
    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 604800000),
      })
      .json({
        message: "User registered successfully",
        user: { ...user._doc, passwordHash: "" },
      });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
  } else if (!password) {
    res.status(400).json({ message: "Password is required" });
  } else {
    // finding user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
    } else {
      // account suspension check
      if (isAccountSuspended(user)) {
        return res.status(401).json({
          suspended: true,
          message:
            Number(user.suspendedTillTimestamp) === -1
              ? "Account suspended indefinitely. Please contact support."
              : "Account suspended due to suspicious activity. Please contact support.",
          details:
            Number(user.suspendedTillTimestamp) === -1
              ? `Suspended till: Indefinite;\nSuspension Reason: ${user.suspensionReason}`
              : `Suspended till: ${new Date(
                  Number(user.suspendedTillTimestamp)
                ).toLocaleString("en-IN")};\nSuspension Reason: ${
                  user.suspensionReason
                }`,
        });
      }
      // checking password
      const passwordCorrect = bcrypt.compareSync(password, user.passwordHash);
      if (!passwordCorrect) {
        return res.status(400).json({ message: "Invalid password" });
      }
      // creating token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1w",
      });
      // sending token in a cookie
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          expires: new Date(Date.now() + 604800000),
        })
        .json({
          message: "User logged in successfully",
          user: { ...user._doc, passwordHash: "" },
        });
    }
  }
});

router.get("/logout", (req, res) => {
  res
    .status(200)
    .clearCookie("access_token")
    .json({ message: "User logged out successfully" });
});


//user status
router.get("/user", authenticateToken, async (req, res) => {
  const { id, token } = req.user;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found!",
    });
  }
  // account suspension check
  if (isAccountSuspended(user)) {
    return res.status(401).json({
      suspended: true,
      message:
        Number(user.suspendedTillTimestamp) === -1
          ? "Account suspended indefinitely. Please contact support."
          : "Account suspended due to suspicious activity. Please contact support.",
      details:
        Number(user.suspendedTillTimestamp) === -1
          ? null
          : `Suspended till: ${new Date(
              Number(user.suspendedTillTimestamp)
            ).toLocaleString()}\nSuspension Reason: ${user.suspensionReason}`,
    });
  }
  // sending token in a cookie
  return res
    .status(200)
    .cookie("access_token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + 604800000),
    })
    .json({
      message: "User logged in successfully",
      user: { ...user._doc, passwordHash: "" },
    });
});

module.exports = router;




