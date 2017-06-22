//////////////////////////////////////////
// triangle
//////////////////////////////////////////
// Again, we start out by requiring regl
var regl = require('regl')()

m3 = {
  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },
};

mat_scale = m3.scaling(0.5, 0.5);
mat_rotate = m3.rotation(1.6);
mat_translate = m3.translation(10, 10);
// mat_translate = m3.scaling(1, 1);
vec_translate = [0.5, 0.5, 0.0];

// Next, we create a new command.
//
// To do this, we call the main regl function and pass it an object giving a
// description of the rendering command and its properties:
//
var drawTriangle = regl({
  //
  // First we define a vertex shader.  This is a program which tells the GPU
  // where to draw the vertices.
  //
  vert: `
    // This is a simple vertex shader that just passes the position through

    // get the attribute (defined below) position_ini and pass it to the vertex
    // shader
    attribute vec3 position_ini;
    varying vec3 position_new;
    uniform mat3 mat_rotate;
    uniform mat3 mat_scale;
    uniform vec3 vec_translate;

    void main () {

      position_new = (mat_rotate * mat_scale * position_ini + vec_translate);

      gl_Position = vec4( position_new, 1);
    }
  `,

  //
  // Next, we define a fragment shader to tell the GPU what color to draw.
  //
  frag: `
    // This is program just colors the triangle white

    void main () {
      gl_FragColor = vec4(1, 0, 0, 1);
    }
  `,

  // Finally we need to give the vertices to the GPU
  attributes: {
    position_ini: [
      [0.0,  0.0, 0.0],
      [0.3,  0.0, 1.0],
      [0.0, 0.15, 1.0]
    ],
  },

  // And also tell it how many vertices to draw
  count: 3,
  uniforms: {
    mat_rotate: mat_rotate,
    mat_scale: mat_scale,
    vec_translate: vec_translate
  }
})

// Now that our command is defined, we hook a callback to draw it each frame:
// regl.frame( function (){

  // First we clear the color and depth buffers like before
  // (does not appear to be necessary)
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  // Then we call the command that we just defined
  drawTriangle()

// })
