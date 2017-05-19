//////////////////////////////////////////////////
// smoothly animate points
//////////////////////////////////////////////////
const glsl = require('glslify')
const linspace = require('ndarray-linspace')
const vectorFill = require('ndarray-vector-fill')
const ndarray = require('ndarray')
const ease = require('eases/cubic-in-out')

require('regl')({onDone: require('fail-nicely')(run)})

function run (regl) {

  console.log('regl function')
  let max_nodes = 1000
  let datasets = []
  let datasetPtr = 0
  let pointRadius = 3
  let lastSwitchTime = 0
  let switchInterval = 7
  let switchDuration = 5

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
        gl_FragColor = vec4( 0, 0, 0, 1);
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
    count: () => max_nodes
  })

  regl.frame(({time}) => {
    // Check how long it's been since the last switch, and cycle the buffers
    // and reset the timer if it's time for a switch:
    if ((time - lastSwitchTime) > switchInterval) {
      lastSwitchTime = time
      datasetPtr++
      console.log('update: ' + String(datasetPtr))
    }

    drawPoints({interp: ease((time - lastSwitchTime) / switchDuration)})
  })

  // Initialize:
  createDatasets()

  function createDatasets(){
    datasets = [phyllotaxis, grid].map((func, i) =>
      (datasets[i] || regl.buffer)(vectorFill(ndarray([], [max_nodes, 2]), func(max_nodes)))
    )
  }

}


function phyllotaxis (max_nodes) {
  const theta = Math.PI * (3 - Math.sqrt(5))
  return function (i) {
    let r = Math.sqrt(i / max_nodes)
    let th = i * theta
    return [
      r * Math.cos(th),
      r * Math.sin(th)
    ]
  }
}

function grid (max_nodes) {
  const rowlen = Math.round(Math.sqrt(max_nodes))
  return (i) => [
    -0.8 + 1.6 / rowlen * (i % rowlen),
    -0.8 + 1.6 / rowlen * Math.floor(i / rowlen)
  ]
}
