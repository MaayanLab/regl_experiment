const vectorizeText = require('vectorize-text')

text_vect = vectorizeText('something!', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true
});
tri_verts = [];
text_vect.cells.forEach(
  function(inst_cell){

    // get triangle verts
    vert_1 = text_vect.positions[inst_cell[0]]
    vert_2 = text_vect.positions[inst_cell[1]]
    vert_3 = text_vect.positions[inst_cell[2]]

    // merge verts into position vector
    inst_verts = [vert_1, vert_2, vert_3];

    tri_verts.push(inst_verts);

  });


/*
  tags: instancing, basic

  <p> In this example, it is shown how you can draw a bunch of triangles using the
  instancing feature of regl. </p>
 */
const regl = require('regl')({extensions: ['angle_instanced_arrays']})

var N = 10 // N triangles on the width, N triangles on the height.

offset_array = Array(N * N).fill().map((_, i) => {
          var x = -1 + 2 * Math.floor(i / N) / N + 0.1
          var y = -1 + 2 * (i % N) / N + 0.1
          return [x, y]
        })

const draw = regl({
  vert: `
  precision mediump float;
  attribute vec2 position;

  // These three are instanced attributes.
  attribute vec3 color;
  attribute vec2 offset;


  void main() {
    gl_Position = vec4(
         position.x + position.y + offset.x,
        -position.x + position.y + offset.y, 0, 1);
  }`,

  frag: `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`,

  attributes: {
    position: [[0.0, -0.05], [-0.05, 0.0], [0.05, 0.05]],

    offset: {
      buffer: regl.buffer(offset_array),
      divisor: 1 // one separate offset for every triangle.
    },

  },

  depth: {
    enable: false
  },

  // Every triangle is just three vertices.
  // However, every such triangle are drawn N * N times,
  // through instancing.
  count: 3,
  instances: N * N
})

regl.frame(function () {
  regl.clear({
    color: [0, 0, 0, 1]
  })

  draw()
})