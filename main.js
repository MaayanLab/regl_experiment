const regl = require('regl')()
const mouse = require('mouse-change')()
const camera = require('regl-camera')(regl)
const mesh = require('bunny')

const drawMesh = regl({

  frag: `
    void main () {
      gl_FragColor = vec4(1, 1, 1, 1);
    }
  `,

  vert: `
    precision highp float;
    attribute vec3 position;
    uniform vec2 translate;
    uniform mat4 projection, view;
    void main() {
      gl_Position = projection * view * vec4(position, 1);
    }
  `,


  attributes: {
    position: mesh.positions
  },

  elements: mesh.cells

})



regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  camera(() => {
    drawMesh()
  })

})
