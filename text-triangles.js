/*
  tags: instancing, basic

  <p> In this example, it is shown how you can draw a bunch of triangles using the
  instancing feature of regl. </p>
 */
const regl = require('regl')({extensions: ['angle_instanced_arrays']})
const vectorizeText = require('vectorize-text')

text_vect = vectorizeText('something!', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true
});

var N = 10 // N triangles on the width, N triangles on the height.

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

const draw = regl({
  vert: `
  precision mediump float;

  // These three are instanced attributes.
  attribute vec2 offset;
  attribute vec2 position;

  void main() {
    gl_Position = vec4(
        -0.1 - offset[0],
        position[1] - offset[1],
        0,
        1);
  }`,

  frag: `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`,

  attributes: {

    // position: [[0.0, 1.0], [0.0, 0.0], [1, 0]],
    position: tri_verts[1],

    // position: {
    //   buffer: regl.buffer(tri_verts),
    //   divisor: 1 //
    // // },

    offset: {
      // buffer: regl.buffer(text_vect.positions),
      buffer: regl.buffer(tri_verts),
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

  draw();
})