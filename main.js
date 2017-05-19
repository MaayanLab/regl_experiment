const regl = require('regl')()
const mouse = require('mouse-change')()
const camera = require('regl-camera')(regl)
const mesh = require('bunny')
const normals = require('angle-normals')

console.log('here')
g_regal = regl;

function processMesh (mesh){

  return regl({

    frag: `
      precision highp float;
      varying vec3 color;
      void main () {
        gl_FragColor = vec4(color, 1);
      }
    `,

    vert: `
      precision highp float;
      varying vec3 color;
      attribute vec3 position, normal;
      uniform vec2 translate;
      uniform mat4 projection, view;
      uniform float t;
      void main() {
        color = 0.5 * (1. + normal);
        gl_Position = projection * view * vec4(position , 1);
      }
    `,


    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },

    uniforms: {
      t: ({tick}) => Math.cos(0.0000001 * tick)
    },

    elements: mesh.cells

  })


}

const drawMesh = processMesh(mesh)

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  camera(() => {
    drawMesh()
  })

})
