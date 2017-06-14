// reorganized version of animate 100k points
const glsl = require('glslify')
const linspace = require('ndarray-linspace')
const vectorFill = require('ndarray-vector-fill')
const ndarray = require('ndarray')
const ease = require('eases/cubic-in-out')
const regl = require('regl')()

var filename = 'data/num_points.txt'

require('resl')({
  manifest:{
    'num_points':{
      type: 'text',
      src: filename
    }
  },
  onDone: (assets) => {
    run_viz(regl, assets);
  }
})


function run_viz(regl, assets) {

  var n = parseInt(assets.num_points);
  var datasets = [];
  var colorBasis;
  var datasetPtr = 0;
  var pointRadius = 10;
  var opacity = 0.2;
  var lastSwitchTime = 0;
  var switchInterval = 5;
  let switchDuration = 3;

  createDatasets();

  var vert_string = `
      precision mediump float;
      attribute vec2 xy0, xy1;
      uniform float aspect, interp_uni, radius;
      void main () {

        // Interpolate between the two positions using the interpolate uniform
        vec2 pos = mix(xy0, xy1, interp_uni);
        gl_Position = vec4(pos.x, pos.y * aspect, 0, 1);
        gl_PointSize = radius;

      }`;

  var frag_string = glsl(`
      precision mediump float;
      varying vec3 fragColor;
      void main () {
        gl_FragColor = vec4(0, 0, 0, 0.2);
      }
    `);

  const drawPoints = regl({

    frag: frag_string,

    vert: vert_string,

    attributes: {

      // Pass two buffers between which we ease in the vertex shader:
      xy0: () => datasets[datasetPtr % datasets.length],
      xy1: () => datasets[(datasetPtr + 1) % datasets.length],

    },

    uniforms: {

      radius: pointRadius,

      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,

      // The current interpolation position, from 0 to 1:
      interp_uni: (ctx, props) => Math.max(0, Math.min(1, props.interp_prop))

    },

    primitive: 'point',

    count: () => n,

    // necessary for opacity control
    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 'src color',
        dstRGB: 'one',
        dstAlpha: 'one',
        // src: 'one',
        // dst: 'one'
      },
      equation: 'add',
      color: [0, 0, 0, 0]
    }

  });

  function run_draw({time}){

    // Check how long it's been since the last switch, and cycle the buffers
    // and reset the timer if it's time for a switch:
    if ((time - lastSwitchTime) > switchInterval) {
      lastSwitchTime = time
      datasetPtr++
    };

    // pass in interpolation function as property, interp_prop
    drawPoints({
      interp_prop: interp_fun(time)
    });

  }

  function interp_fun(time){
    return ease((time - lastSwitchTime) / switchDuration)
  }

  function createDatasets() {

    return datasets = [phyllotaxis, grid]
      .map(
        function(func, i){
          // return (datasets[i] || regl.buffer)(vectorFill(ndarray([], [n, 2]), func(n)));
          var inst_array = ndarray([], [n, 2]);
          return vectorFill(inst_array, func(n));
        }
      );

  }

  regl.frame( run_draw );

}



function phyllotaxis (n) {
  const theta = Math.PI * (3 - Math.sqrt(5))
  return function (i) {
    let r = Math.sqrt(i / n)
    let th = i * theta
    return [
      r * Math.cos(th),
      r * Math.sin(th)
    ]
  }
}

function grid (n) {
  const rowlen = Math.round(Math.sqrt(n))
  return (i) => [
    -0.8 + 1.6 / rowlen * (i % rowlen),
    -0.8 + 1.6 / rowlen * Math.floor(i / rowlen)
  ]
}
