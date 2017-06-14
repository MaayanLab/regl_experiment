const d3 = require('d3')
const regl = require('regl')()

// initialize regl
regl({
  // // callback when regl is initialized
  // onDone: main
});


const numPoints = 100000;
const pointWidth = 4;
const width = window.innerWidth;
const height = window.innerHeight;

// duration of the animation ignoring delays
const duration = 1500; // 1500ms = 1.5s

// helper to layout points in a green fuzzy circle
function greenCircleLayout(points) {
  const rng = d3.randomNormal(0, 0.05);
  points.forEach((d, i) => {
    d.x = (rng() + Math.cos(i)) * (width / 2.5) + (width / 2);
    d.y = (rng() + Math.sin(i)) * (height / 2.5) + (height / 2);
    d.color = [0, Math.random(), 0]; // random amount of green
  });
}

// helper to layout points in a normally distributed area, colored blue
function blueNormalLayout(points) {
  const rng = d3.randomNormal(0, 0.15);
  points.forEach(d => {
    d.x = (rng() * width) + (width / 2);
    d.y = (rng() * height) + (height / 2);
    d.color = [0, d.color[1] * 0.5, 0.9]; // some previous green and 0.9 blue
  });
}

// set the order of the layouts and some initial animation state
const layouts = [greenCircleLayout, blueNormalLayout];
let currentLayout = 0; // start with green circle layout

// function to compile a draw points regl func
function createDrawPoints(points) {
  const drawPoints = regl({
    frag: `
    // set the precision of floating point numbers
    precision highp float;

    // this value is populated by the vertex shader
    varying vec3 fragColor;

    void main() {
      // gl_FragColor is a special variable that holds the color of a pixel
      gl_FragColor = vec4(fragColor, 1);
    }
    `,

    vert: `
    // per vertex attributes
    attribute vec2 positionStart;
    attribute vec2 positionEnd;
    attribute vec3 colorStart;
    attribute vec3 colorEnd;

    // variables to send to the fragment shader
    varying vec3 fragColor;

    // values that are the same for all vertices
    uniform float pointWidth;
    uniform float stageWidth;
    uniform float stageHeight;
    uniform float elapsed;
    uniform float duration;

    // helper function to transform from pixel space to normalized device coordinates (NDC)
    // in NDC (0,0) is the middle, (-1, 1) is the top left and (1, -1) is the bottom right.
    vec2 normalizeCoords(vec2 position) {
      // read in the positions into x and y vars
      float x = position[0];
      float y = position[1];

      return vec2(
        2.0 * ((x / stageWidth) - 0.5),
        // invert y since we think [0,0] is bottom left in pixel space
        -(2.0 * ((y / stageHeight) - 0.5)));
    }

    // helper function to handle cubic easing (copied from d3 for consistency)
    // note there are pre-made easing functions available via glslify.
    float easeCubicInOut(float t) {
      t *= 2.0;
      t = (t <= 1.0 ? t * t * t : (t -= 2.0) * t * t + 2.0) / 2.0;

      if (t > 1.0) {
        t = 1.0;
      }

      return t;
    }

    void main() {
      // update the size of a point based on the prop pointWidth
      gl_PointSize = pointWidth;

      // number between 0 and 1 indicating how far through the animation this
      // vertex is.
      float t;

      // drawing without animation, so show end state immediately
      if (duration == 0.0) {
        t = 1.0;

      // otherwise we are animating, so use cubic easing
      } else {
        t = easeCubicInOut(elapsed / duration);
      }

      // interpolate position
      vec2 position = mix(positionStart, positionEnd, t);

      // interpolate and send color to the fragment shader
      fragColor = mix(colorStart, colorEnd, t);

      // scale to normalized device coordinates
      // gl_Position is a special variable that holds the position of a vertex
      gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
    }
    `,

    attributes: {
      // each of these gets mapped to a single entry for each of the points.
      // this means the vertex shader will receive just the relevant value for a given point.
      positionStart: points.map(d => [d.sx, d.sy]),
      positionEnd: points.map(d => [d.tx, d.ty]),
      colorStart: points.map(d => d.colorStart),
      colorEnd: points.map(d => d.colorEnd),
    },

    uniforms: {
      // by using `regl.prop` to pass these in, we can specify them as arguments
      // to our drawPoints function
      pointWidth: regl.prop('pointWidth'),

      // regl actually provides these as viewportWidth and viewportHeight but I
      // am using these outside and I want to ensure they are the same numbers,
      // so I am explicitly passing them in.
      stageWidth: regl.prop('stageWidth'),
      stageHeight: regl.prop('stageHeight'),

      duration: regl.prop('duration'),
      // time in milliseconds since the prop startTime (i.e. time elapsed)
      // note that `time` is passed by regl whereas `startTime` is a prop passed
      // to the drawPoints function.
      elapsed: ({ time }, { startTime = 0 }) => (time - startTime) * 1000,
    },

    // specify the number of points to draw
    count: points.length,

    // specify that each vertex is a point (not part of a mesh)
    primitive: 'points',
  });

  return drawPoints;
}

// function to start the animation loop (note: time is in seconds)
function animate(layout, points) {
  console.log('animating with new layout');
  // make previous end the new beginning
  points.forEach(d => {
    d.sx = d.tx;
    d.sy = d.ty;
    d.colorStart = d.colorEnd;
  });

  // layout points
  layout(points);

  // copy layout x y to end positions
  points.forEach((d, i) => {
    d.tx = d.x;
    d.ty = d.y;
    d.colorEnd = d.color;
  });

  // create the regl function with the new start and end points
  const drawPoints = createDrawPoints(points);

  // start an animation loop
  let startTime = null; // in seconds
  const frameLoop = regl.frame(({ time }) => {
    // keep track of start time so we can get time elapsed
    // this is important since time doesn't reset when starting new animations
    if (startTime === null) {
      startTime = time;
    }

    // clear the buffer
    regl.clear({
      // background color (black)
      color: [0, 0, 0, 1],
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

      // start a new animation loop with next layout function
      animate(layouts[currentLayout], points);
    }
  });
}

// create initial set of points
// initialize with all the points in the middle of the screen and black
const points = d3.range(numPoints).map(i => ({
  tx: width / 2,
  ty: height / 2,
  colorEnd: [0, 0, 0],
}));

// start the initial animation
animate(layouts[currentLayout], points);

