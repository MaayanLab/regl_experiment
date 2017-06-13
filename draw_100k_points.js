const d3 = require('d3')
const numPoints = 100000;

// the size of the points we draw on the screen
const pointWidth = 4;

// dimensions of the viewport we are drawing in
const width = window.innerWidth;
const height = window.innerHeight;

// random number generator from d3-random
rng = d3.randomNormal(0, 0.15);

console.log('here')
