/*
  tags: basic
  This example demonstrates how to use batch mode commands
  To use a command in batch mode, we pass in an array of objects.
  Then the command is executed once for each object in the array.
*/

// As usual, we start by creating a full screen regl object
const regl = require('regl')();

var tri_position =[
    0.5, 0,
    0, 0.5,
    0.5, 0.5
  ];

var triangle_data = [
    { offset: [-1, -1] },
    { offset: [-1, 0] },
    { offset: [-1, 1] },
    { offset: [0, -1] },
    { offset: [0, 0] },
    { offset: [0, 1] },
    { offset: [1, -1] },
    { offset: [1, 0] },
    { offset: [1, 1] }
  ];

// the batchId parameter gives the index of the command
var color_function = function({tick}, props, batchId){
  // red
  return [ Math.sin(0.02 * ((0.1 + Math.sin(batchId)) * tick + 3.0 * batchId)),
  0,0,1 ];
}

var angle_function = function({tick}){
  return 0.001 * tick;
}

var frag_string = `
    precision mediump float;
    uniform vec4 uni_color;
    void main() {
      gl_FragColor = uni_color;
    }`;

var vert_string = `
    precision mediump float;
    attribute vec2 position;

    // access the uniform angle (angle is a function)
    uniform float angle;

    // access the uniform offset (offset is a property of each data element)
    uniform vec2 offset;
    void main() {
      gl_Position = vec4(
        cos(angle) * position.x + sin(angle) * position.y + offset.x,
        -sin(angle) * position.x + cos(angle) * position.y + offset.y, 0, 1);
    }`;

// Next we create our command
const draw = regl({
  frag: frag_string,
  vert: vert_string,

  attributes: {
    position: tri_position
  },

  uniforms: {
    uni_color: color_function,
    angle: angle_function,
    offset: regl.prop('offset')
  },

  depth: {
    enable: false
  },

  count: 3
});



// Here we register a per-frame callback to draw the whole scene
frame_function = regl.frame(function () {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  // This tells regl to execute the command once for each object
  draw(triangle_data)
})