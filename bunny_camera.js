/*
  tags: basic

  <p>This example shows how to implement a movable camera with regl.</p>
 */

const regl = require('regl')()

const vectorizeText = require('vectorize-text')

text_vect = vectorizeText('something!', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true
});

// add third dimension to text triangles
text_vect.positions.forEach(function(inst_pos){
  inst_pos.push(0.0);
});

// bunny = require('bunny')

// bunny.positions.forEach(function(inst_pos){
//   // inst_pos[0] = 0;
//   // inst_pos[1] = 0;
//   inst_pos[2] = 0;
// })

bunny = text_vect

const camera = require('./camera')(regl, {
  center: [0, 0.2, 0]
})

const drawBunny = regl({
  vert: `
    precision mediump float;
    uniform mat4 projection, view;
    attribute vec3 position;
    void main () {
      // gl_Position = projection * view * vec4(position, 1.0);
      gl_Position = vec4(position, 1.0);
    }`,
  frag: `
    precision mediump float;
    void main () {
      gl_FragColor = vec4(1, 0, 0, 1.0);
    }`,
  attributes: {
    position: bunny.positions,
  },
  elements: bunny.cells
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    drawBunny()
  })
})