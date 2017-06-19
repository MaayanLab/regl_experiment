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

// bunny = require('bunny')

bunny = text_vect;

const normals = require('angle-normals')

const camera = require('./camera')(regl, {
  center: [0, 2.5, 0]
})

const drawBunny = regl({
  vert: `
    precision mediump float;
    uniform mat4 projection, view;
    attribute vec3 position, normal;
    varying vec3 vnormal;
    void main () {
      vnormal = normal;
      gl_Position = projection * view * vec4(position, 1.0);
    }`,
  frag: `
    precision mediump float;
    varying vec3 vnormal;
    void main () {
      gl_FragColor = vec4(1, 0, 0, 1.0);
    }`,
  attributes: {
    position: bunny.positions,
    normal: normals(bunny.cells, bunny.positions)
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