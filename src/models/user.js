const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
  coins: {
    type: Number,
    default: 25,
  },
  hints: {
    type: Number,
    default: 10,
  },
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  totalHintsUsed: {
    type: Number,
    default: 0,
  },
  rewards: {
    type: Array,
    default: [],
  },
  collectibles: {
    type: Array,
    default: [],
  },
  purchasesCoinsAmount: {
    type: Number,
    default: 0,
  },
  purchasesHintsAmount: {
    type: Number,
    default: 0,
  },
  referrals: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  suspendedTillTimestamp: {
    type: String, // string of number timestamp
    default: "0",
  },
  suspensionReason: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
