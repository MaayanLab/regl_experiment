/*
  <p> This example is a simple demonstration of how to use regl to draw a triangle. </p>
 */

// The default method exposed by the module wraps a canvas element
const regl = require('regl')()

// This clears the color buffer to black and the depth buffer to 1
regl.clear({
  color: [0, 0, 0, 1],
  depth: 1
})

// In regl, draw operations are specified declaratively using. Each JSON
// command is a complete description of all state. This removes the need to
// .bind() things like buffers or shaders. All the boilerplate of setting up
// and tearing down state is automated.
regl({

  // In a draw call, we can pass the shader source code to regl
  frag: `
  precision mediump float;
  uniform vec4 color;
  void main () {
    gl_FragColor = color;
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  void main () {
    gl_Position = vec4(position, 0, 1);
  }`,

  attributes: {
    position: [
      [-1, 0],
      [0, -1],
      [1, 1]
    ]
  },

  uniforms: {
    color: [1, 0, 0, 0.7]
  },

  blend: {
    enable: true,
    func: {
      srcRGB: 'src alpha',
      srcAlpha: 'src color',
      dstRGB: 'one',
      dstAlpha: 'one',
      // src: 'one',
      // dst: 'one'
    },
    equation: 'add',
    color: [0, 0, 0, 0]
  },

  count: 3
})()
