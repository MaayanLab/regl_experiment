/*
  tags: basic
  This example shows how to implement a movable camera with regl.
 */

const regl = require('regl')()

const vectorizeText = require('vectorize-text')

text_vect = vectorizeText('something!', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true
});

const camera = require('./camera')(regl, {
  center: [0, 0, 0]
})

const draw_text = regl({
  vert: `
    precision mediump float;
    uniform mat4 projection, view;
    attribute vec2 position;

    void main () {
      gl_Position = vec4(position, 0.0, 1.0);
    }`,
  frag: `
    precision mediump float;
    void main () {
      gl_FragColor = vec4(1, 0, 0, 1.0);
    }`,
  attributes: {
    position: text_vect.positions,
  },
  elements: text_vect.cells
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    draw_text()
  })
})