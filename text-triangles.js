/*
  <p>This example shows how you can draw vectorized text in regl.</p>

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})
const vectorizeText = require('vectorize-text')
const perspective = require('gl-mat4/perspective')
const lookAt = require('gl-mat4/lookAt')

var num_instances = 1000;

textMesh = vectorizeText('something!', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true
});

const camera = require('./camera-2d')(regl, {
  xrange: [-2, 2],
  yrange: [-2, 2]
});

window.addEventListener('resize', camera.resize);

var zoom_function = function(context){
  return context.view;
}

function offset_function(_, i){
              return 2*(i/num_instances);
            };

offset_array = Array(num_instances)
          .fill()
          .map(offset_function);


const drawText = regl({
  frag: `
  precision mediump float;
  uniform float t;
  varying float text_color;
  void main () {
    gl_FragColor = vec4(1, 0, text_color, 1);
  }`,

  vert: `
  attribute vec2 position;
  uniform mat4 projection, view;
  attribute float offset;
  uniform mat4 zoom;
  varying float text_color;

  void main () {
    // gl_Position = projection * view * vec4(position, 0, 1);
    gl_Position = zoom * projection * view * vec4(position.x + offset - 1.0, position.y + offset - 1.0, 0, 1);
    text_color = offset;
  }`,

  attributes: {
    position: textMesh.positions,
    offset: {
      buffer: regl.buffer(offset_array),
      divisor: 1
    }
  },

  elements: textMesh.cells,

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
        1000),

    zoom: zoom_function
  },

  depth: {enable: false},
  instances: num_instances,
})

regl.frame(() => {

  camera.draw( () => {
    drawText();
  })
})