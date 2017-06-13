//////////////////////////////////////////
// triangle
//////////////////////////////////////////
// Again, we start out by requiring regl
var regl = require('regl')()

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

    // get the attribute (defined below) position_data and pass it to the vertex
    // shader
    attribute vec2 position_data;
    void main () {
      gl_Position = vec4(position_data, 0, 1);
    }
  `,

  //
  // Next, we define a fragment shader to tell the GPU what color to draw.
  //
  frag: `
    // This is program just colors the triangle white
    void main () {
      gl_FragColor = vec4(0.4, 0.5, 1, 1);
    }
  `,

  // Finally we need to give the vertices to the GPU
  attributes: {
    position_data: [
      [0.4, 0],
      [0, 1],
      [-1, -1]
    ]
  },

  // And also tell it how many vertices to draw
  count: 3
})

// Now that our command is defined, we hook a callback to draw it each frame:
regl.frame( function (){

  // First we clear the color and depth buffers like before
  // (does not appear to be necessary)
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  // Then we call the command that we just defined
  drawTriangle()

})
