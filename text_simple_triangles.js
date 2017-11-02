/*
  <p>This example shows how you can draw vectorized text in regl.</p>
 */

console.log('text_simple_triangles')

const regl = require('regl')()
const vectorizeText = require('vectorize-text')

// max ~200 min ~20
font_detail = 20;
text_vect = vectorizeText('something!', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true,
  size:font_detail,
  font:'"Open Sans", verdana, arial, sans-serif'
});

// camera stuff
////////////////////////
camera = require('./camera-2d')(regl, {
  xrange: [-2, 2],
  yrange: [-2, 2]
});

var zoom_function = function(context){
  return context.view;
}


// draw command
///////////////////
const draw_text_triangles = regl({
  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform mat4 zoom;

    void main () {
      // reverse y position to get words to be upright
      gl_Position = zoom * vec4(position.x, -position.y, 0.0, 2.0);
    }`,
  frag: `
    precision mediump float;
    void main () {
      gl_FragColor = vec4(1, 0, 0, 1.0);
    }`,
  attributes: {
    position: text_vect.positions
  },
  elements: text_vect.cells,
  uniforms: {
    zoom: zoom_function
  }
})


regl.frame(() => {
  camera.draw( () => {
    draw_text_triangles();
  })
})


window.addEventListener('resize', function(){
  console.log('resizing')
    camera.resize()
  });