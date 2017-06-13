const d3 = require('d3')
const regl = require('regl')()

// the size of the points we draw on the screen
const pointWidth = 4;

// dimensions of the viewport we are drawing in
const width = window.innerWidth;
const height = window.innerHeight;

// generate points
//////////////////////////
const numPoints = 100000;

// random number generator from d3-random
const rng = d3.randomNormal(0, 0.15);

// create the initial set of points
const points = d3.range(numPoints).map(i => ({
  x: (rng() * width) + (width / 2),
  y: (rng() * height) + (height / 2),
  color: [0, Math.random(), 0],
}));


// regl draw loop
///////////////////////
regl.frame(() => {
  // clear the buffer
  regl.clear({
    // background color
    color: [1, 1, 1, 1],
    depth: 1,
  });


})