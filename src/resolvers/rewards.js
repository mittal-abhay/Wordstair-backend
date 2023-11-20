const { v4: uuidv4 } = require("uuid");

const makeReward = (rewards) => {
  const uid = uuidv4();
  if (rewards.collectible) rewards.collectible = makeCollectible();
  return {
    id: uid,
    rewards,
  };
};

const makeCollectible = () => {
  const uid = uuidv4();
  const collectible = biasedRandomCollectible(collectibles);
  return {
    id: uid,
    ...collectible,
  };
};

// randomize collectible
const collectibles = [
  { value: "a", frequency: 3, name: "Aero" },
  { value: "b", frequency: 3, name: "Bee" },
  { value: "c", frequency: 3, name: "Cactus" },
  { value: "d", frequency: 3, name: "Disco" },
  { value: "e", frequency: 3, name: "Elo" },
  { value: "f", frequency: 3, name: "Fizz" },
  { value: "g", frequency: 3, name: "Glow" },
  { value: "h", frequency: 3, name: "Hype" },
  { value: "i", frequency: 3, name: "Ice" },
  { value: "j", frequency: 3, name: "Jelly" },
  { value: "k", frequency: 3, name: "Kooky" },
  { value: "l", frequency: 3, name: "Lush" },
  { value: "m", frequency: 3, name: "Mint" },
  { value: "n", frequency: 2, name: "Neon" },
  { value: "o", frequency: 2, name: "Orbit" },
  { value: "p", frequency: 2, name: "Pulse" },
  { value: "q", frequency: 2, name: "Qwirky" },
  { value: "r", frequency: 2, name: "Retro" },
  { value: "s", frequency: 2, name: "Slick" },
  { value: "t", frequency: 2, name: "Tasty" },
  { value: "u", frequency: 1, name: "Ultra" },
  { value: "v", frequency: 1, name: "Vibe" },
  { value: "w", frequency: 1, name: "Wavy" },
  { value: "x", frequency: 1, name: "Xtreme" },
  { value: "y", frequency: 1, name: "Yummy" },
  { value: "z", frequency: 1, name: "Zesty" },
];
function biasedRandomCollectible(biases) {
  const totalWeight = biases.reduce((acc, curr) => acc + curr.frequency, 0);
  const randomNum = Math.floor(Math.random() * totalWeight);
  let sum = 0;
  for (let i = 0; i < biases.length; i++) {
    sum += biases[i].frequency;
    if (randomNum < sum) {
      return biases[i];
    }
  }
}

module.exports = {
  makeReward,
};
