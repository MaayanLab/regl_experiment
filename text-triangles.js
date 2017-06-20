/*
  tags: basic
  This example shows how to implement a movable camera with regl.
 */

const regl = require('regl')()

const vectorizeText = require('vectorize-text')

const camera = require('./camera-2d')(regl, {
  xrange: [-1, 1],
  yrange: [-1, 1]
});

var zoom_function = function(context){
  return context.view;
}

text_vect = vectorizeText('Something!', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true
});

const draw_text = regl({
  vert: `
    precision highp float;
    attribute vec2 position;
    uniform mat4 zoom;

    void main () {
      gl_Position = zoom * vec4(position, 0.0, 1.0);
    }`,
  frag: `
    precision highp float;
    void main () {
      gl_FragColor = vec4(1, 0, 0, 1.0);
    }`,
  attributes: {
    position: text_vect.positions,
  },
  elements: text_vect.cells,
  uniforms: {
    zoom: zoom_function,
  }
})

regl.frame(() => {

  camera.draw( () => {
    regl.clear({
      color: [0, 0, 0, 1]
    })
    draw_text()
  })

})