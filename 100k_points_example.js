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

var lastSwitchTime = 0;
var switchInterval = 5;
let switchDuration = 3;
var inst_state = 1;
var pointRadius = 10;
var datasets = [];

function run_viz(regl, assets) {

  var n = parseInt(assets.num_points);

  var blend_info = {
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
    };

  var datasets = createDatasets();

  var vert_string = `
      precision mediump float;
      attribute vec2 pos_ini, pos_fin;
      uniform float interp_uni, radius;
      void main () {

        // Interpolate between the two positions using the interpolate uniform
        vec2 pos = mix(pos_ini, pos_fin, interp_uni);

        gl_Position = vec4(pos[0], pos[1], 0, 1);

        gl_PointSize = radius;

      }`;

  var frag_string = glsl(`
      precision mediump float;

      uniform float radius;

      void main () {
        gl_FragColor = vec4(0, 0, 0, radius);
      }
    `);

  const drawPoints = regl({

    frag: frag_string,

    vert: vert_string,

    attributes: {
      // Pass two buffers between which we ease in the vertex shader:
      // passs dataset info as attributes
      pos_ini: datasets[inst_state % datasets.length],
      pos_fin: datasets[(inst_state + 1) % datasets.length],
    },

    uniforms: {
      radius: pointRadius,
      // The current interpolation position, from 0 to 1:
      interp_uni: (ctx, props) => Math.max(0, Math.min(1, props.interp_prop))
    },
    primitive: 'point',
    count: n,
    // necessary for opacity control
    blend: blend_info

  });

  regl.frame( run_draw );

  function run_draw({time}){

    // Check how long it's been since the last switch, and cycle the buffers
    // and reset the timer if it's time for a switch:
    if ((time - lastSwitchTime) > switchInterval) {
      lastSwitchTime = time
      inst_state++
    };

    // pass in interpolation function as property, interp_prop
    drawPoints({
      interp_prop: interp_fun(time)
    });

  }

  function createDatasets() {
    var datasets;
    datasets = [phyllotaxis, grid]
      .map(
        function(func, i){
          var inst_array = ndarray([], [n, 2]);
          return vectorFill(inst_array, func(n));
        }
      );

    return datasets;
  }

}


  function interp_fun(time){
    return ease((time - lastSwitchTime) / switchDuration)
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
