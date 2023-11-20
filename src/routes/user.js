const express = require("express");
const User = require("./../models/user.js");
const router = express.Router();
const { storeItems } = require("./../constants/store.js");
const { getNewAchievements } = require("./../resolvers/achievements.js");
const { makeReward } = require("./../resolvers/rewards.js");

router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ xp: -1 }).limit(10);
    res.status(200).json({
      users: users,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/achievements", async (req, res) => {
  const { achievements } = require("./../constants/achievements.js");
  res.status(200).json({
    achievements: achievements,
  });
});

router.get("/:id", async (req, res) => {
  const id = req.user.id;
  try {
    const user = await User.findById(id);
    if (user == null) {
      return res.status(404).json({
        message: "Cannot find user",
      });
    }
    res.status(200).json({
      user: user._doc,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/", (req, res) => {
  res.send("Staircase User Server!");
});

router.patch("/transaction", async (req, res) => {
  const id = req.user.id;
  const { itemID } = req.body;
  try {
    const user = await User.findById(id);
    if (user == null) {
      return res.status(404).json({
        message: "Cannot find user",
      });
    }

    let item = null;
    for (let x of storeItems) {
      if (x.id === itemID) {
        item = x;
        break;
      }
    }
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }
    user.coins = user.coins - item.cost.coins + item.quantity.coins;
    user.hints = user.hints - item.cost.hints + item.quantity.hints;
    user.purchasesCoinsAmount = user.purchasesCoinsAmount + item.cost.coins;
    user.purchasesHintsAmount = user.purchasesHintsAmount + item.cost.hints;
    // get new achievements
    // only responsible for purchases achievements
    const newAchievements = await getNewAchievements({
      purchases: user.purchasesCoinsAmount,
    });
    for (let i = 0; i < newAchievements.length; i++) {
      user.rewards.push(makeReward(newAchievements[i].rewards));
    }
    await user.save();
    res.status(200).json({
      message: "Item purchased",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.patch("/openreward", async (req, res) => {
  const id = req.user.id;
  const { rewardID } = req.body;
  try {
    const user = await User.findById(id);
    if (user == null) {
      return res.status(404).json({
        message: "Cannot find user",
      });
    }
    let reward = null;
    for (let x of user.rewards) {
      if (x.id === rewardID) {
        reward = x;
        break;
      }
    }
    if (!reward) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }
    user.xp = user.xp + reward.rewards.xp ?? 0;
    user.level = Math.max(
      user.level,
      Math.ceil((Math.sqrt(625 + 100 * user.xp) - 25) / 50)
    );
    user.coins = user.coins + reward.rewards.coins ?? 0;
    user.hints = user.hints + reward.rewards.hints ?? 0;
    user.collectibles = user.collectibles.filter((collectible) => typeof collectible === 'object');
    if(typeof reward.rewards.collectible === 'object')
    user.collectibles = [
      ...user.collectibles,
      reward.rewards.collectible,
    ];
    user.rewards = user.rewards.filter((reward) => reward.id !== rewardID);
    await user.save();
    res.status(200).json({
      message: "Reward opened",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
