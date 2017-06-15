/*
  tags: instancing, basic

  In this example, it is shown how you can draw a bunch of triangles using the
  instancing feature of regl.

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})

const camera = require('./camera-2d')(regl, {
  xrange: [-1, 1],
  yrange: [-1, 1]
});

var zoom_function = function(context){
  return context.view;
}

window.addEventListener('resize', camera.resize);

var num_row = 1e2;
var num_col = 1e2;

var angle = []
for (var i = 0; i < num_row * num_col; i++) {
  angle[i] = Math.random();
}

console.log(angle.length)

// This buffer stores the angles of all
// the instanced triangles.
const angle_buffer = regl.buffer({
  length: angle.length * 4,
  type: 'float',
  usage: 'dynamic'
})

// initialize buffer (previously used subdata)
angle_buffer(angle);

// set up offset array for buffer
function offset_function(_, i){
              var x = -0.5 +  Math.floor(i / num_row) / num_row + 0.1;
              var y = -0.5 + (i % num_col) / num_col + 0.1;
              return [x, y];
            };


var offset_array = Array(num_row * num_col)
          .fill()
          .map(offset_function);

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

const draw = regl({

  vert: `
  precision highp float;

  attribute vec2 position;

  // These three are instanced attributes.
  attribute vec3 color_att;
  attribute vec2 offset;
  attribute float angle;
  uniform mat4 zoom;

  // pass varying variables to fragment from vector
  varying float opacity;

  void main() {

    gl_Position = zoom * vec4( position.x + offset.x, position.y + offset.y, 0, 1);


    // pass angle attribute in vert to opacity varying in frag
    opacity = sin(angle) + 0.1;

  }`,

  frag: `
      precision highp float;
      varying float opacity;
      uniform vec3 inst_color;
      void main() {

        // using opacity value
        // gl_FragColor = vec4(1, 0, 0, opacity);
        gl_FragColor = vec4(inst_color, opacity);

      }`,

  attributes: {
    position: [
      [1/num_row, 0.0],
      [0.0, 0.0],
      [0.0, 1/num_row],
      ],

    offset: {
      buffer: regl.buffer(offset_array),
      divisor: 1 // one separate offset for every triangle.
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

  uniforms: {
    zoom: zoom_function,
    inst_color: [0,0,1],
  },

  instances: num_row * num_row,

})

regl.frame(function () {

  camera.draw( () => {
    // clear the background
    regl.clear({
      color: [0, 0, 0, 0]
    });
    // draw
    draw();
  });

})