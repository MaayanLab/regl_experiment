const d3 = require('d3')
const regl = require('regl')()

// the size of the points we draw on the screen
const pointWidth = 4;

// dimensions of the viewport we are drawing in
const width = window.innerWidth;
const height = window.innerHeight;

// duration of the animation ignoring delays
const duration = 1500; // 1500ms = 1.5s


// generate points
//////////////////////////
const numPoints = 100000;

// random number generator from d3-random
const rng = d3.randomNormal(0, 0.15);

// set the order of the layouts and some initial animation state
const layouts = [greenCircleLayout, blueNormalLayout];
let currentLayout = 0; // start with green circle layout


// create the initial set of points
const points = d3.range(numPoints).map(i => ({
  x: (rng() * width) + (width / 2),
  y: (rng() * height) + (height / 2),
  color: [0, Math.random(), 0],
}));

// here's a layout algorithm that randomly positions the points
/////////////////////////////////////////////////////////////////
function blueNormalLayout(points){
  // random number generator based on a normal distribution
  // with mean = 0, std dev = 0.15
  const rng = d3.randomNormal(0, 0.15);

  points.forEach(d => {
    // set the x and y attributes
    d.x = (rng() * width) +  (width/2);
    d.y = (rng() * height) + (height/2);

    // blue-green color
    d.color = [0.0, 0.5, 0.9];
  });
}

// helper to layout points in a green fuzzy circle
function greenCircleLayout(points) {
  const rng = d3.randomNormal(0, 0.05);
  points.forEach((d, i) => {
    d.x = (rng() + Math.cos(i)) * (width / 2.5) + (width / 2);
    d.y = (rng() + Math.sin(i)) * (height / 2.5) + (height / 2);
    d.color = [0, Math.random(), 0]; // random amount of green
  });
}

// Animate Function
/////////////////////
function animate(layout, points){
  // make previous end the new beginning
  points.forEach(d => {
    d.sx = d.tx;
    d.sy = d.ty;
    d.colorStart = d.colorEnd;
  });

  // layout points, updating x, y, and color attributes
  // (the layout function is passed to animate)
  layout(points);

  // copy layout x, y, and color to end values
  points.forEach((d,i) => {
    d.tx = d.x;
    d.ty = d.y;
    d.colorEnd = d.color;
  });

}

// each point object contains
// {
//   sx: start x position - number between 0 and width
//   sy: start y position - number between 0 and height
//   colorStart: array with 3 entries between 0 and 1
//   tx: end x position - number between 0 ane width
//   ty: end y position - number between 0 and height
//   colorEnd: array with 3 entries between 0 and 1
// }


// regl draw loop
///////////////////////
let startTime = null; // in seconds

// (why is time in curly brackets?)
regl.frame( ({time}) => {

  // keep track of start time so we can get time elapsed
  // this is important since time doesn't reset when starting
  // new animations
  if (startTime === null){
    startTime = time;
  }

  // clear the buffer
  regl.clear({
    // background color
    color: [1, 1, 1, 1],
    depth: 1,
  });

  // draw the points using our created regl function
  // note that the arguments are available via regl.prop
  drawPoints({

    pointWidth,
    stageWidth: width,
    stageHeight: height,

    // here we pass in the new props
    duration,
    startTime

  });

   const frameLoop = regl.frame(({ time }) => {
    // keep track of start time so we can get time elapsed
    // this is important since time doesn't reset when starting new animations
    if (startTime === null) {
      startTime = time;
    }

    // clear the buffer
    regl.clear({
      // background color (black)
      color: [1, 1, 1, 1],
      depth: 1,
    });

    // draw the points using our created regl func
    // note that the arguments are available via `regl.prop`.
    drawPoints({
      pointWidth,
      stageWidth: width,
      stageHeight: height,
      duration,
      startTime,
    });

    // if we have exceeded the maximum duration, move on to the next animation
    if (time - startTime > (duration / 1000)) {
      console.log('done animating, moving to next layout');

      // cancel this loop, we are going to start another
      frameLoop.cancel();

      // increment to use next layout function
      currentLayout = (currentLayout + 1) % layouts.length;
      animate(layouts[currentLayout], points);
    }
  });

  // // if we have exceeded the aximum duration, move on to the
  // // next animation
  // if (time - startTime > (duration/1000)){
  //     console.log('done animating, moving to next layout');

  //     // cancel this loop, we are going to start another
  //     frameLoop.cancel();

  //     // increment to use next layout function
  //     currentLayout = (currentLayout + 1) % layouts.length;

  //     // start a new animation loop with next layout function
  //     animate(layouts[currentLayout], points);
  // }

});

const drawPoints = regl({
  frag: `
  // set the precision of floating point numbers
  precision highp float;

  // thi value is populated by the vertex shader
  varying vec3 fragColor;

  void main(){
    // gl_FragColor is a special variable that holds the color
    // of a pixel
    gl_FragColor = vec4(fragColor, 1);
  }
  `,
  vert: `
  // per vertex attributes
  attribute vec2 position;
  attribute vec3 color;

  // variables to send to the fragment shader
  varying vec3 fragColor;

  // values that are the same for all vertices
  uniform float pointWidth;
  uniform float stageWidth;
  uniform float stageHeight;

  // helper function to transform from pixel space to normalized
  // device coordinates (NDC). In NDC (0,0) is the middle,
  // (-1, 1) is the top left and (1, -1) is the bottom right.
  vec2 normalizeCoords(vec2 position) {
    // read in the positions into x and y vars
    float x = position[0];
    float y = position[1];

    return vec2(
      2.0 * ((x / stageWidth) - 0.5),
      // invert y to treat [0,0] as bottom left in pixel space
      -(2.0 * ((y / stageHeight) - 0.5)));
  }

  void main() {
    // update the size of a point based on the prop pointWidth
    gl_PointSize = pointWidth;

    // send color to the fragment shader
    fragColor = color;

    // scale to normalized device coordinates
    // gl_Position is a special variable that holds the position
    // of a vertex
    gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
  }
  `,

  attributes: {
    // each of these gets mapped to a single entry for each of
    // the points. This means the vertex shader will receive
    // just the relevant value for a given point
    position: points.map(d => [d.x, d.y]),
    color: points.map(d => d.color),
  },

  uniforms: {
    // by using regl.prop to pass these in, we can specify
    // them as arguments to our drawPoints function
    pointWidth: regl.prop('pointWidth'),

    // regl actually provides these as viewportWidth and
    // viewportHeight but I am using these outside and I want
    // to snsure they are the same numbers, so I am explicitly
    // passing them in.
    stageWidth: regl.prop('stageWidth'),
    stageHeight: regl.prop('stageHeight'),
  },

  // specify the number of points to draw
  count: points.length,

  // specify that each vertex is a point (not part of a mesh)
  primitive: 'points',
});

