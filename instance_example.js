/*
  tags: instancing, basic

  In this example, it is shown how you can draw a bunch of triangles using the
  instancing feature of regl.

  gitter info

  "yeah, instancing uses gpu hardware
  batching reduces number of bind state changes, but still requires multiple draw calls
  instancing reuses the same draw call, but requires an extension"

  Mikola Lysenko @mikolalysenko 15:24
  in general yes

  Nicolas Fernandez @cornhundred 15:24
  thanks

  Mikola Lysenko @mikolalysenko 15:24
  as always there are caveats and special cases....

  Nicolas Fernandez @cornhundred 15:25
  okay

  Mikola Lysenko @mikolalysenko 15:27
  but instancing is generally < draw calls/vertex processing which means better per

 */
const regl = require('regl')({extensions: ['angle_instanced_arrays']})

var num_tri = 10 // N triangles on the width, N triangles on the height.

var angle = []
for (var i = 0; i < num_tri * num_tri; i++) {
  // generate random initial angle.
  angle[i] = Math.random() * (2 * Math.PI)
}

// This buffer stores the angles of all
// the instanced triangles.
const angleBuffer = regl.buffer({
  length: angle.length * 4,
  type: 'float',
  usage: 'dynamic'
})

const draw = regl({
  frag: `
  precision mediump float;

  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }`,

  vert: `
  precision mediump float;

  attribute vec2 position;

  // These three are instanced attributes.
  attribute vec3 color;
  attribute vec2 offset;
  attribute float angle;

  varying vec3 vColor;

  void main() {
    gl_Position = vec4(
      cos(angle) * position.x + sin(angle) * position.y + offset.x,
        -sin(angle) * position.x + cos(angle) * position.y + offset.y, 0, 1);
    vColor = color;
  }`,

  attributes: {
    position: [[0.0, -0.05], [-0.05, 0.0], [0.05, 0.05]],

    offset: {
      buffer: regl.buffer(
        Array(num_tri * num_tri).fill().map((_, i) => {
          var x = -1 + 2 * Math.floor(i / num_tri) / num_tri + 0.1
          var y = -1 + 2 * (i % num_tri) / num_tri + 0.1
          return [x, y]
        })),
      divisor: 1 // one separate offset for every triangle.
    },

    color: {
      buffer: regl.buffer(
        Array(num_tri * num_tri).fill().map((_, i) => {
          var r = Math.floor(i / num_tri) / num_tri
          var g = (i % num_tri) / num_tri
          return [r, g, r * g + 0.2]
        })),
      divisor: 1 // one separate color for every triangle
    },

    angle: {
      buffer: angleBuffer,
      divisor: 1 // one separate angle for every triangle
    }
  },

  depth: {
    enable: false
  },

  // Every triangle is just three vertices.
  // However, every such triangle are drawn N * N times,
  // through instancing.
  count: 3,
  instances: num_tri * num_tri
})

regl.frame(function () {
  regl.clear({
    color: [0, 0, 0, 1]
  })

  // rotate the triangles every frame.
  for (var i = 0; i < num_tri * num_tri; i++) {
    angle[i] += 0.01
  }
  angleBuffer.subdata(angle)

  draw()
})