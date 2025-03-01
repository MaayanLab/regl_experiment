/*
  tags: basic

  <p>This example show how you can render point particles in regl</p>
 */

const regl = require('regl')()
const mat4 = require('gl-mat4')
const hsv2rgb = require('hsv2rgb')

const NUM_POINTS = 1e3
const VERT_SIZE = 4 * (4 + 4 + 3)

pointBuffer = regl.buffer(Array(NUM_POINTS).fill().map(function () {

  console.log('running point buffer')

  // randomly generating colors, one for each point buffer
  const rand_color = hsv2rgb(Math.random() * 360, 0.6, 1)

  return [
    // freq
    Math.random() * 10,
    Math.random() * 10,
    Math.random() * 10,
    Math.random() * 10,
    // phase
    2.0 * Math.PI * Math.random(),
    2.0 * Math.PI * Math.random(),
    2.0 * Math.PI * Math.random(),
    2.0 * Math.PI * Math.random(),
    rand_color[0] / 255, rand_color[1] / 255, rand_color[2] / 255
  ]

}))

const drawParticles = regl({
  vert: `
  precision mediump float;
  attribute vec4 freq, phase;
  attribute vec3 color_var;
  uniform float time;
  uniform mat4 view, projection;
  varying vec3 frag_color;
  void main() {
    vec3 position = 8.0 * cos(freq.xyz * time + phase.xyz);
    gl_PointSize = 10.0*(cos(freq.w * time + phase.w));
    // gl_PointSize = 10.;
    gl_Position = projection * view * vec4(position, 1);

    // this is where the frac_color is being modified
    frag_color = color_var;
  }`,

  frag: `
  precision lowp float;
  varying vec3 frag_color;
  void main() {
    if (length(gl_PointCoord.xy - 0.5) > 0.5) {
      discard;
    }
    gl_FragColor = vec4(frag_color, 1);
  }`,

  attributes: {
    freq: {
      buffer: pointBuffer,
      stride: VERT_SIZE,
      offset: 0
    },
    phase: {
      buffer: pointBuffer,
      stride: VERT_SIZE,
      offset: 16
    },
    color_var: {
      buffer: pointBuffer,
      stride: VERT_SIZE,
      offset: 32
    }
  },

  uniforms: {
    view: ({tick}) => {
      const t = 0.01 * tick
      return mat4.lookAt([],
        [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
        [0, 0, 0],
        [0, 1, 0])
    },
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000),
    time: ({tick}) => tick * 0.001
  },

  count: NUM_POINTS,

  primitive: 'points'
})

regl.frame(() => {
  regl.clear({
    depth: 1,
    color: [1, 1, 1, 1]
  })

  drawParticles()
})