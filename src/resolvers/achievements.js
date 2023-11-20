const { achievements } = require("../constants/achievements.js");

const getNewAchievements = async ({
  purchases = 0,
  games = 0,
  totalHintsUsed = 0,
}) => {
  const newAchievements = achievements.filter((achievement) => {
    if (
      achievement.type === "purchases-from-coins" &&
      purchases === achievement.condition
    ) {
      return true;
    }
    if (
      achievement.type === "hints-used" &&
      totalHintsUsed === achievement.condition
    ) {
      return true;
    }
    if (
      achievement.type === "games-played" &&
      games === achievement.condition
    ) {
      return true;
    }
    return false;
  });

  return newAchievements;
};

module.exports = {
  getNewAchievements,
};
