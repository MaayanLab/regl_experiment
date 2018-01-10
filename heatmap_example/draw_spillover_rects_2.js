// const vectorizeText = require('vectorize-text')

module.exports = function draw_spillover_rects(regl, zoom_function){
  console.log('draw spillover_rects')

  // Spillover triangles
  ///////////////////////////////

  var args = {
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
      position: regl.prop('pos')
    },

    uniforms: {
      color: [0, 0, 1, 0.5],
      // offset: regl.prop('pos')
    },

    count: 3,
  }

  draw_function = regl(args)

  return draw_function;

};