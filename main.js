//////////////////////////////////////////////////
// smoothly animate points
//////////////////////////////////////////////////
const glsl = require('glslify')
const linspace = require('ndarray-linspace')
const vectorFill = require('ndarray-vector-fill')
const ndarray = require('ndarray')
const ease = require('eases/cubic-in-out')
const regl = require('regl')()

var something = {thing:'something'}

require('resl')({
  manifest:{
    'scores':{
      type: 'text',
      src: 'data/scores.csv'
    }
  },
  onDone: (assets) => {

    // require('regl')({
    //   onDone: require('fail-nicely')(run)
    // })

    run(regl, something);

  }
})

// // original way of running
// ///////////////////////////
// require('regl')({
//   onDone: require('fail-nicely')(run)
// })

// // run and pass argument
// /////////////////////////
// run(regl, something);

function run (regl, new_thing) {

  // debugger

  console.log('running')
  console.log(new_thing)

  let max_nodes = 1000
  let n = max_nodes/10
  let datasets = []
  let colorBasis
  let datasetPtr = 0

  let pointRadius = 4

  let lastSwitchTime = 0
  let switchInterval = 5
  let switchDuration = 3

  const createDatasets = () => {
    datasets = [phyllotaxis, grid].map((func, i) =>
      (datasets[i] || regl.buffer)(vectorFill(ndarray([], [n, 2]), func(n)))
    )
  }

  // Initialize:
  createDatasets()

  // Create nice controls:
  require('control-panel')([
    {type: 'range', min: 10, max: max_nodes/2, label: 'n', initial: n, step: 50}
  ], {width: 400}).on('input', (data) => {
    if (data.n !== n) {
      n = Math.round(data.n)
      createDatasets()
    }
  })

  const drawPoints = regl({
    vert: `
      precision mediump float;
      attribute vec2 xy0, xy1;
      attribute float;
      varying float t;
      uniform float aspect, interp, radius;
      void main () {
        // Interpolate between the two positions:
        vec2 pos = mix(xy0, xy1, interp);
        gl_Position = vec4(pos.x, pos.y * aspect, 0, 1);
        gl_PointSize = radius;
      }
    `,
    frag: glsl(`
      precision mediump float;
      varying float t;
      void main () {
        gl_FragColor = vec4(0, 0, 0, 1);
      }
    `),
    depth: {enable: false},
    attributes: {
      // Pass two buffers between which we ease in the vertex shader:
      xy0: () => datasets[datasetPtr % datasets.length],
      xy1: () => datasets[(datasetPtr + 1) % datasets.length],
    },
    uniforms: {
      radius: () => pointRadius,
      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,
      // The current interpolation position, from 0 to 1:
      interp: (ctx, props) => Math.max(0, Math.min(1, props.interp))
    },
    primitive: 'point',
    count: () => n
  })

  regl.frame(({time}) => {
    // Check how long it's been since the last switch, and cycle the buffers
    // and reset the timer if it's time for a switch:
    if ((time - lastSwitchTime) > switchInterval) {
      lastSwitchTime = time
      datasetPtr++
    }

    drawPoints({interp: ease((time - lastSwitchTime) / switchDuration)})
  })
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
