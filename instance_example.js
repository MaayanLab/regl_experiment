/*
  tags: instancing, basic

  In this example, it is shown how you can draw a bunch of triangles using the
  instancing feature of regl.

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})

const camera = require('./camera-2d')(regl, {
  xrange: [-5, 5],
  yrange: [-5, 5]
});

window.addEventListener('resize', camera.resize);

// N triangles on the width, N triangles on the height.
var num_tri = 10

var angle = []
for (var i = 0; i < num_tri * num_tri; i++) {
  // generate random initial angle.
  angle[i] = 0;//Math.random() * (2 * Math.PI)
}

// This buffer stores the angles of all
// the instanced triangles.
const angle_buffer = regl.buffer({
  length: angle.length * 4,
  type: 'float',
  usage: 'dynamic'
})

// set up offset array for buffer
function offset_function(_, i){
              var x = -1 + 2 * Math.floor(i / num_tri) / num_tri + 0.1;
              var y = -1 + 2 * (i % num_tri) / num_tri + 0.1;
              return [x, y];
            };


var offset_array = Array(num_tri * num_tri)
          .fill()
          .map(offset_function);

// set up color array for buffer
function color_function(_, i){
              var r = Math.floor(i / num_tri) / num_tri;
              var g = (i % num_tri) / num_tri;
              // return [r, g, r * g + 0.2];
              return [1, 0, 0, 1];
            };

var color_array = Array(num_tri * num_tri)
          .fill()
          .map(color_function);

  var blend_info = {
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
    };

var frag_string = `
  precision highp float;

  varying vec3 inst_color;
  varying float opacity;

  void main() {

    // gl_FragColor = vec4(inst_color, 1.0);

    // using opacity value
    gl_FragColor = vec4(1, 0, 0, opacity);

  }`;

vert_string = `
  precision highp float;

  attribute vec2 position;

  // These three are instanced attributes.
  attribute vec3 color_att;
  attribute vec2 offset;
  attribute float angle;

  // pass varying variables to fragment from vector
  varying vec3 inst_color;
  varying float opacity;

  void main() {

    gl_Position = vec4(
      cos(angle) * position.x + sin(angle) * position.y + offset.x,
        -sin(angle) * position.x + cos(angle) * position.y + offset.y, 0, 1);

    // pass color_att attribute in vert to inst_color varying in frag
    inst_color = color_att;

    // pass angle attribute in vert to opacity varying in frag
    opacity = sin(angle);

  }`;

const draw = regl({

  frag: frag_string,

  vert: vert_string,

  attributes: {
    position: [[0.0, -0.05], [-0.05, 0.0], [0.05, 0.05]],

    offset: {
      buffer: regl.buffer(offset_array),
      divisor: 1 // one separate offset for every triangle.
    },

    color_att: {
      buffer: regl.buffer(color_array),
      divisor: 1 // one separate color for every triangle
    },

    angle: {
      buffer: angle_buffer,
      divisor: 1 // one separate angle for every triangle
    }
  },

  depth: {
    enable: false
  },

  blend: blend_info,

  // Every triangle is just three vertices.
  // However, every such triangle are drawn N * N times,
  // through instancing.
  count: 3,

  instances: num_tri * num_tri,

})

// draw the scene
regl.frame(function () {

  camera.draw( () => {

    // clear the background
    regl.clear({
      color: [0, 0, 0, 0]
    });

    // rotate all triangles every frame.
    for (var i = 0; i < num_tri * num_tri; i++) {
      angle[i] += 0.002/num_tri * i;
    }

    // re-initialize buffer (previously used subdata)
    angle_buffer(angle);

    draw();

  });
})