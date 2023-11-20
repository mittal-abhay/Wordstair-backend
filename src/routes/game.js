const express = require("express");
const dotenv = require("dotenv");
const User = require("./../models/user.js");
const { bfs, getRandomPair } = require("../utility/word_graph");
dotenv.config();
const router = express.Router();

const graph3 = require("./../../data/graph3.js");
const graph4 = require("./../../data/graph4.js");
const graph5 = require("./../../data/graph5.js");
const graph6 = require("./../../data/graph6.js");
const cc3 = require("./../../data/cc3.js");
const cc4 = require("./../../data/cc4.js");
const cc5 = require("./../../data/cc5.js");
const cc6 = require("./../../data/cc6.js");
const dict3 = require("./../../data/dict3.js");
const dict4 = require("./../../data/dict4.js");
const dict5 = require("./../../data/dict5.js");
const dict6 = require("./../../data/dict6.js");

const { getNewAchievements } = require("./../resolvers/achievements.js");
const { makeReward } = require("./../resolvers/rewards.js");

router.get("/", (req, res) => {
  res.send("Staircase Game Server!");
});

// get a random pair of words
router.get("/pair", (req, res) => {
  const difficulty = req.query.difficulty;
  let pair = [],
    path = [];
  switch (difficulty) {
    case "beginner":
      pair = getRandomPair(cc3, graph3, []);
      path = bfs(graph3, pair[0], pair[1]);
      break;
    case "easy":
      pair = getRandomPair(cc4, graph4, []);
      path = bfs(graph4, pair[0], pair[1]);
      break;
    case "medium":
      pair = getRandomPair(cc5, graph5, []);
      path = bfs(graph5, pair[0], pair[1]);
      break;
    case "hard":
      pair = getRandomPair(cc6, graph6, []);
      path = bfs(graph6, pair[0], pair[1]);
      break;
  }
  res.status(200).json({ start: pair[0], end: pair[1], path });
});

// get hint for a word and its meaning
router.get("/hint", async (req, res) => {
  const { id } = req.user;
  const difficulty = req.query.difficulty;
  const start = req.query.start;
  const end = req.query.end;
  let path = [];
  let next = "";
  let nextMeaning = "";
  switch (difficulty) {
    case "beginner":
      path = bfs(graph3, start, end);
      next = path[1];
      nextMeaning = dict3[next];
      break;
    case "easy":
      path = bfs(graph4, start, end);
      next = path[1];
      nextMeaning = dict4[next];
      break;
    case "medium":
      path = bfs(graph5, start, end);
      next = path[1];
      nextMeaning = dict5[next];
      break;

    case "hard":
      path = bfs(graph6, start, end);
      next = path[1];
      nextMeaning = dict6[next];
      break;
  }
  if (path.length === 0) {
    return res.status(200).json({
      path,
      next,
      hint: nextMeaning,
      message: "Cannot reach target from here.",
    });
  }
  const user = await User.findById(id);
  if (!user) return res.status(400).json({ message: "User not found." });
  user.hints -= 1;
  user.totalHintsUsed += 1;
  // check for new achievements
  // only responsible for hints used achievement
  const newAchievements = await getNewAchievements({
    totalHintsUsed: user.totalHintsUsed,
  });
  for (let i = 0; i < newAchievements.length; i++) {
    user.rewards.push(makeReward(newAchievements[i].rewards));
  }
  await user.save();
  res.status(200).json({ path, next, hint: nextMeaning });
});

// get meaning of a word
router.get("/meaning", (req, res) => {
  const difficulty = req.body.difficulty;
  const word = req.body.word;
  let meaning = "";
  switch (difficulty) {
    case "beginner":
      meaning = dict3[word];
      break;
    case "easy":
      meaning = dict4[word];
      break;
    case "medium":
      meaning = dict5[word];
      break;
    case "hard":
      meaning = dict6[word];
      break;
  }
  res.status(200).json({ meaning });
});

router.get("/store", (req, res) => {
  const { storeItems } = require("./../constants/store.js");
  res.status(200).json({ storeItems });
});

// update user xp and coins  
// formula used for xp and level calculation is: XP = 25 * level * (1 + level)
router.patch("/update", async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) {
    res.status(400).json({ message: "User not found" });
  } else {
    const { start, end, moves, penalties, hintsUsed } = req.body;
    const oldUser = { ...user };
    let xpInc = 0,
      coinsInc = 0;
    let difficulty = start.length;
    if (difficulty === 3) {
      const path = bfs(graph3, start, end);
      xpInc = Math.max(
        0,
        10 - penalties * Math.floor(user.level / 2) - hintsUsed - (moves - path.length)
      );
    } else if (difficulty === 4) {
      const path = bfs(graph4, start, end);
      xpInc = Math.max(
        0,
        20 - penalties * Math.floor(user.level / 2) - hintsUsed - (moves - path.length)
      );
    } else if (difficulty === 5) {
      const path = bfs(graph5, start, end);
      xpInc = Math.max(
        0,
        30 - penalties * Math.floor(user.level / 2) - hintsUsed - (moves - path.length)
      );
    } else if (difficulty === 6) {
      const path = bfs(graph6, start, end);
      xpInc = Math.max(
        0,
        40 - penalties * Math.floor(user.level / 2) - hintsUsed - (moves - path.length)
      );
    }
    coinsInc = Math.max(0, Math.floor(xpInc * Math.PI));
    user.xp = user.xp + Math.floor(Math.max(xpInc, 0));
    const prevLevel = user.level;
    user.level = Math.max(
      user.level,
      Math.ceil((Math.sqrt(625 + 100 * user.xp) - 25) / 50)
    );
    const isLevelUp = user.level > prevLevel;
    let bonusCoins = 0,
      bonusHints = 0;
    if (isLevelUp) {
      bonusCoins = Math.floor(user.level * Math.PI * 20);
      bonusHints = Math.floor(user.level * Math.PI);
    }
    user.coins = user.coins + coinsInc + bonusCoins;
    user.hints = user.hints + bonusHints;
    user.gamesPlayed = user.gamesPlayed + 1;
    // update achievements
    // only responsible for games played achievements
    const newAchievements = await getNewAchievements({
      games: user.gamesPlayed,
    });
    for (let i = 0; i < newAchievements.length; i++) {
      user.rewards.push(makeReward(newAchievements[i].rewards));
    }
    await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: {
        ...user._doc,
        passwordHash: "",
      },
      gameChanges: {
        oldUser,
        hintsUsed,
        penalties,
        moves,
        coinsInc,
        xpInc,
        isLevelUp,
        bonusCoins,
        bonusHints,
      },
    });
  }
});

module.exports = router;
