const regl = require('regl')()


const drawTriangle = regl({

  frag: `
    void main () {
      gl_FragColor = vec4(1, 1, 1, 1);
    }
  `,

  vert: `
    precision highp float;
    attribute vec2 position;
    uniform vec2 translate;
    void main() {
      gl_Position = vec4(position + translate, 0, 1);
    }
  `,


  attributes: {
    position: [
      [1, 0],
      [0, 1],
      [-1, -1]
    ]
  },

  uniforms: {
    translate: [0,0]
  },

  count: 3
})



regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawTriangle()
})
