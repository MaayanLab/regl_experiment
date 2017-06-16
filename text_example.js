/*
  <p>This example shows how you can draw vectorized text in regl.</p>

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})
const vectorizeText = require('vectorize-text')
const perspective = require('gl-mat4/perspective')
const lookAt = require('gl-mat4/lookAt')

const textMesh = vectorizeText('something!', {
  textAlign: 'center',
  textBaseline: 'middle'
})

var num_instances = 20;

function offset_function(_, i){
              return i/num_instances;
            };

offset_array = Array(num_instances)
          .fill()
          .map(offset_function);


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
  attribute float offset;

  void main () {
    // gl_Position = projection * view * vec4(position, 0, 1);
    gl_Position = projection * view * vec4(position.x + offset, position.y, 0, 1);
  }`,

  attributes: {
    position: textMesh.positions,
    offset: {
      buffer: regl.buffer(offset_array),
      divisor: 1
    }
  },

  elements: textMesh.edges,

  uniforms: {
    t: ({tick}) => 0.01 * tick,

    view: ({tick}) => {
      const t = 0.01 * tick
      return lookAt([],
        [0 , 0, -5 ],
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

  depth: {enable: false},
  instances: num_instances,
})

regl.frame(() => {
  drawText();
})
