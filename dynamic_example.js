/*
  tags: basic

  <p> This example shows how to pass props to draw commands </p>
*/

const regl = require('regl')()

var frag_string = `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`;

var vert_string = `
    precision mediump float;
    attribute vec2 position;
    uniform float angle;
    void main() {
      gl_Position = vec4(
        cos(angle) * position.x + sin(angle) * position.y,
        -sin(angle) * position.x + cos(angle) * position.y, 0, 1);
    }`;

var position_var = [
      -1, 0,
      0, -1,
      1, 1];

const draw = regl({
  frag: frag_string,

  vert: vert_string,

  attributes: {
    position: position_var
  },

  uniforms: {
    color: regl.prop('color'),

    // pass the batchid and use it to offset the triangles
    angle: ({tick}, props, batchId) => 0.01 * tick + 2*batchId
  },

  depth: {
    enable: false
  },

  count: 3
})

var run_draw = function({tick}){

  // clear background
  regl.clear({
    color: [0, 0, 0, 1]
  })

  // draw, passing in color, will access as prop
  draw([
  {
    color: [
      Math.sin(0.02 * (0.001 * tick)),
      Math.cos(0.02 * (0.02 * tick)),
      Math.sin(0.02 * (0.3 * tick)),
      1
    ]
  },
  {
    color: [
      Math.sin(0.02 * (0.01 * tick)),
      Math.cos(0.02 * (0.02 * tick)),
      Math.sin(0.02 * (0.3 * tick)),
      1
    ]
  }
  ])

}

regl.frame( run_draw );