/*
  <p>This example shows how you can draw vectorized text in regl.</p>

 */

const regl = require('regl')()
const vectorizeText = require('vectorize-text')
const perspective = require('gl-mat4/perspective')
const lookAt = require('gl-mat4/lookAt')

const textMesh = vectorizeText('nick!', {
  textAlign: 'center',
  textBaseline: 'middle'
})

const drawText = regl({
  frag: `
  precision mediump float;
  uniform float t;
  void main () {
    gl_FragColor = vec4(1, 0, 0, 1);
  }`,

  vert: `
  attribute vec2 position;
  uniform mat4 projection, view;
  void main () {
    gl_Position = projection * view * vec4(position, 0, 1);
  }`,

  attributes: {
    position: textMesh.positions
  },

  elements: textMesh.edges,

  uniforms: {
    t: ({tick}) => 0.01 * tick,

    view: ({tick}) => {
      const t = 0.01 * tick
      return lookAt([],
        [5 * Math.sin(t), 0, -5 * Math.cos(t)],
        [0, 0, 0],
        [0, -1, 0])
    },

    projection: ({viewportWidth, viewportHeight}) =>
      perspective([],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000)
  },

  depth: {enable: false}
})

regl.frame(() => {
  drawText()
})
