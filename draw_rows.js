/*
  tags: instancing, basic

  In this example, it is shown how you can draw a bunch of triangles using the
  instancing feature of regl.

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})

var m3 = require('./mat3_transform');

const camera = require('./camera-2d')(regl, {
  xrange: [-1.5, 1.5],
  yrange: [-1.5, 1.5]
});

var zoom_function = function(context){
  return context.view;
}

window.addEventListener('resize', camera.resize);

mat_scale = m3.scaling(0.1, 0.1);
mat_rotate = m3.rotation(Math.PI/4);
vec_translate = [-0.5, 0.5, 0.0];

// draw background
const draw_rows = regl({

  vert: `
    precision highp float;
    attribute vec2 position;
    varying vec3 new_position;
    uniform mat3 mat_rotate;
    uniform mat3 mat_scale;
    uniform vec3 vec_translate;
    uniform mat4 zoom;

    void main () {

      // zoom multiplication does zoom

      new_position = vec3(position, 0);

      // rotate, zoom and then translate
      new_position = mat_rotate * mat_scale * new_position + vec_translate;

      gl_Position = zoom * vec4(new_position, 1);

    }
  `,

  frag: `

    // color triangle red
    void main () {
      gl_FragColor = vec4(0, 0, 0, 1);
    }

  `,

  attributes: {
    position: [
      [-0.5, 0.5],
      [-0.5, -0.5],
      [0.5, -0.5],
    ]
  },

  uniforms: {
    zoom: zoom_function,
    mat_rotate: mat_rotate,
    mat_scale: mat_scale,
    vec_translate: vec_translate
  },

  count: 3

});


regl.frame(function () {

  camera.draw( () => {

    // clear the background
    regl.clear({
      color: [0, 0, 0, 0]
    });

    // draw two parts of the matrix cell
    draw_rows();

  });

})