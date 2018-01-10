// const vectorizeText = require('vectorize-text')

module.exports = function draw_spillover_rects(regl, zoom_function, inst_depth,
                                               inst_color=[1, 1, 1, 1]){
  console.log('draw spillover_rects')

  console.log(inst_color)

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
    uniform float inst_depth;
    void main () {
      // positioned further up (matrix is lower at 0.)
      gl_Position = vec4(position, inst_depth, 1);
    }`,

    attributes: {
      position: regl.prop('pos')
    },

    uniforms: {
      color: inst_color,
      inst_depth: inst_depth
      // offset: regl.prop('pos')
    },

    count: 3,
    depth: {
      enable: true,
      mask: true,
      func: 'less',
      // func: 'greater',
      range: [0, 1]
    },
  }

  draw_function = regl(args)

  return draw_function;

};