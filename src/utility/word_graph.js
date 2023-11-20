const { words3, words4, words5, words6 } = require("../../data/words.js");
const dict3 = require("../../data/dict3.js");
const { writeFileSync } = require("fs");

function build_graph(words) {
  const buckets = {};
  const graph = {};

  // creating buckets
  for (let word of words) {
    for (let i in word) {
      i = parseInt(i);
      const left = word.slice(0, i);
      const right = word.slice(i + 1);
      const bucket = left + "_" + right;
      buckets[bucket] = buckets[bucket] || [];
      buckets[bucket].push(word);
    }
  }

  // creating graph
  for (let bucket in buckets) {
    for (let word1 of buckets[bucket]) {
      for (let word2 of buckets[bucket]) {
        if (word1 !== word2) {
          graph[word1] = graph[word1] || [];
          if (!graph[word1].includes(word2)) graph[word1].push(word2);
          graph[word2] = graph[word2] || [];
          if (!graph[word2].includes(word1)) graph[word2].push(word1);
        }
      }
    }
  }
  return graph;
}

function bfs(graph, start, end) {
  const queue = [[start]];
  const visited = new Set();

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === end) {
      return path;
    }

    if (!visited.has(node)) {
      visited.add(node);
      for (let neighbor of graph[node]) {
        queue.push([...path, neighbor]);
      }
    }
  }
}

function dfs(node, graph, visited, componentsList) {
  if (!visited.has(node)) {
    visited.add(node);
    componentsList.push(node);
    for (let nbr of graph[node]) {
      dfs(nbr, graph, visited, componentsList);
    }
  }
}

function connectedComponents(graph) {
  const visited = new Set();
  const connectedComponentsList = [];

  for (let word of Object.keys(graph)) {
    if (!visited.has(word)) {
      const componentsList = [];
      dfs(word, graph, visited, componentsList);
      connectedComponentsList.push(JSON.parse(JSON.stringify(componentsList)));
    }
  }

  return connectedComponentsList;
}

// const graph = build_graph(words5);

// const cc = connectedComponents(graph).filter((cc) => cc.length > 3);

// writeFileSync("./data/cc3.js", `module.exports = ${JSON.stringify(cc)}`);
// console.log(cc.length);

// console.log(find_path("smart", "brain"));
// console.log(find_path("slack", "brain"));
// console.log(find_path("brand", "brain"));

// -------------------------------------------------------------------------------
// for generating random pairs of words that are connected in graph and not have a direct edge between them

// const cc3 = require("./data/cc3.js");
// const cc4 = require("./data/cc4.js");
// const cc5 = require("./data/cc5.js");
// const cc6 = require("./data/cc6.js");

// const pairs3 = [];
// const pairs4 = [];
// const pairs5 = [];
// const pairs6 = [];

// const graph3 = build_graph(words3);
// const graph4 = build_graph(words4);
// const graph5 = build_graph(words5);
// const graph6 = build_graph(words6);

// for (let cc of cc3) {
//   for (let w1 of cc) {
//     for (let w2 of cc) {
//       if (w1 !== w2 && !graph3[w1].includes(w2) && !graph3[w2].includes(w1)) {
//         pairs3.push(`${w1} ${w2}`);
//       }
//     }
//   }
// }

// writeFileSync("./data/pairs3.js", `module.exports = ${JSON.stringify(pairs3)}`);

// for (let cc of cc4) {
//   for (let w1 of cc) {
//     for (let w2 of cc) {
//       if (w1 !== w2 && !graph4[w1].includes(w2) && !graph4[w2].includes(w1)) {
//         pairs4.push(`${w1} ${w2}`);
//       }
//     }
//   }
// }

// writeFileSync("./data/pairs4.js", `module.exports = ${JSON.stringify(pairs4)}`);

// for (let cc of cc5) {
//   for (let w1 of cc) {
//     for (let w2 of cc) {
//       if (w1 !== w2 && !graph5[w1].includes(w2) && !graph5[w2].includes(w1)) {
//         pairs5.push(`${w1} ${w2}`);
//       }
//     }
//   }
// }

// writeFileSync("./data/pairs5.js", `module.exports = ${JSON.stringify(pairs5)}`);

// for (let cc of cc6) {
//   for (let w1 of cc) {
//     for (let w2 of cc) {
//       if (w1 !== w2 && !graph6[w1].includes(w2) && !graph6[w2].includes(w1)) {
//         pairs6.push(`${w1} ${w2}`);
//       }
//     }
//   }
// }

// writeFileSync("./data/pairs6.js", `module.exports = ${JSON.stringify(pairs6)}`);

// better to do it everytime instead of storing it in a file because it takes a lot of space
// -----------------------------------------------------------------------------------------

function getRandomPair(cc, graph, alreadyUsedPairs) {
  let randomCC = cc[Math.floor(Math.random() * cc.length)];
  let randomWord1 = randomCC[Math.floor(Math.random() * randomCC.length)];
  let randomWord2 = randomCC[Math.floor(Math.random() * randomCC.length)];
  while (
    randomWord1 === randomWord2 ||
    bfs(graph, randomWord1, randomWord2).length < randomWord1.length ||
    alreadyUsedPairs.includes(`${randomWord1} ${randomWord2}`)
  ) {
    randomCC = cc[Math.floor(Math.random() * cc.length)];
    randomWord1 = randomCC[Math.floor(Math.random() * randomCC.length)];
    randomWord2 = randomCC[Math.floor(Math.random() * randomCC.length)];
  }
  return [randomWord1, randomWord2];
}

module.exports = {
  bfs,
  getRandomPair,
};
