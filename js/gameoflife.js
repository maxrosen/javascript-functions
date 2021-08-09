const { arrayExpression } = require("jscodeshift");

function seed() {
  return Array.from(arguments);
}

function same([x, y], [j, k]) {
  return x===j && y===k;
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  for (i in this){
    if(same(cell, this[i])) return true;
  }
  return false;
}

const printCell = (cell, state) => {
  if (contains.call(state, cell)){
    return '\u25A3';
  } else {
    return '\u25A2';
  }
};

const corners = (state = []) => {
  if(state.length >= 1){
    let corners = {topRight: [state[0][0], state[0][1]], bottomLeft: [state[0][0], state[0][1]]};

    for (let i=0; i<state.length; i++){
      if(state[i][0] > corners.topRight[0]) {corners.topRight[0] = state[i][0]};
      if(state[i][0] < corners.bottomLeft[0]) {corners.bottomLeft[0] = state[i][0]};
      if(state[i][1] < corners.bottomLeft[1]) {corners.bottomLeft[1] = state[i][1]};
      if(state[i][1] > corners.topRight[1]) {corners.topRight[1] = state[i][1]};
    }
    return corners;
  } else {
    return {topRight: [0, 0], bottomLeft: [0,0]};
  }
};

const printCells = (state) => {
  let corner = corners(state);
  let board = "";

  for(let i=corner.bottomLeft[1]; i<=corner.topRight[1]; i++){
    for(let j=corner.bottomLeft[0]; j<=corner.topRight[0]; j++){
      board += printCell([j,i], state);
    }
    board += "\n";
  }

  console.log(board);
  return board;
};

const getNeighborsOf = ([x, y]) => {return [[x-1,y+1],[x,y+1],[x+1,y+1],[x-1,y],[x+1,y],[x-1,y-1],[x,y-1],[x+1,y-1]]};

const getLivingNeighbors = (cell, state) => {
  neighbors = getNeighborsOf(cell);
  livingNeighbors = [];

  for(let i=0; i<neighbors.length; i++){
    if(contains.call(state, neighbors[i])){
      livingNeighbors.push(neighbors[i]);
    }
  }
  return livingNeighbors;
};

const willBeAlive = (cell, state) => {
  livingNeighbors = getLivingNeighbors(cell, state);
  livingNum = livingNeighbors.length;

  if(contains.call(state, cell) && livingNum === 2){
    return true;
  }
  if(livingNum === 3){
    return true;
  }
  return false;
};

const calculateNext = (state) => {
  let corner = corners(state);
  corner.bottomLeft[0]--;
  corner.bottomLeft[1]--;
  corner.topRight[0]++;  
  corner.topRight[1]++;
  let nextState = []

  for(let i=corner.bottomLeft[1]; i<=corner.topRight[1]; i++){
    for(let j=corner.bottomLeft[0]; j<=corner.topRight[0]; j++){
      if(willBeAlive([j,i], state)){
        nextState.push([j,i]);
      }
    }
  }

  return nextState;
};

const iterate = (state, iterations) => {
  gameStates = [state]
  for(let i=0; i<iterations; i++){
    gameStates.push(calculateNext(gameStates[i]));
  }
  return gameStates;
};

const main = (pattern, iterations) => {
  state = startPatterns[pattern];
  gameStates = iterate(state, iterations);

  for(let i=0; i<=iterations; i++){
    printCells(gameStates[i]);
  }
};

const startPatterns = {
    rpentomino: [
      [3, 2],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4]
    ],
    glider: [
      [-2, -2],
      [-1, -2],
      [-2, -1],
      [-1, -1],
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 3]
    ],
    square: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2]
    ]
  };
  
  const [pattern, iterations] = process.argv.slice(2);
  const runAsScript = require.main === module;
  
  if (runAsScript) {
    if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
      main(pattern, parseInt(iterations));
    } else {
      console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
  }
  
  exports.seed = seed;
  exports.same = same;
  exports.contains = contains;
  exports.getNeighborsOf = getNeighborsOf;
  exports.getLivingNeighbors = getLivingNeighbors;
  exports.willBeAlive = willBeAlive;
  exports.corners = corners;
  exports.calculateNext = calculateNext;
  exports.printCell = printCell;
  exports.printCells = printCells;
  exports.startPatterns = startPatterns;
  exports.iterate = iterate;
  exports.main = main;