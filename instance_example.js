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

var num_row = 10;
var num_col = 10;

var opacity = []
for (var i = 0; i < num_row * num_col; i++) {
  opacity[i] = Math.random();
}

// This buffer stores the opacities
const opacity_buffer = regl.buffer({
  length: opacity.length * 4,
  type: 'float',
  usage: 'dynamic'
})

// initialize buffer (previously used subdata)
opacity_buffer(opacity);

// set up offset array for buffer
function offset_function(_, i){
              var x = -0.5 +  Math.floor(i / num_col) / num_col + 0.1;
              var y = -0.5 + (i % num_row) / num_row + 0.1;
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

// // bottom half
var bottom_half = [[1/num_col, 0.0],
[0.0, 0.0],
[0.0, 1/num_row]];

// top half
var top_half = [
  [-1/num_col, 0.0],
  [0.0, 0.0],
  [0.0, -1/num_row]
  ];

var vert_string = `
  precision highp float;

  attribute vec2 position;

  // These three are instanced attributes.
  attribute vec3 color_att;
  attribute vec2 offset;
  attribute float opacity_att;
  uniform mat4 zoom;

  // pass varying variables to fragment from vector
  varying float var_opacity;

  void main() {

    gl_Position = zoom * vec4( position.x + offset.x, position.y + offset.y, 0, 1);

    // pass attribute (in vert) to varying in frag
    var_opacity = sin(opacity_att) + 0.1;

  }`;

var frag_string = `
  precision highp float;
  varying float var_opacity;
  uniform vec3 inst_color;
  void main() {

    // using var_opacity value
    // gl_FragColor = vec4(1, 0, 0, var_opacity);
    gl_FragColor = vec4(inst_color, var_opacity);

  }`;

var inst_half = bottom_half;

const draw_bottom = regl({
  vert: vert_string,
  frag: frag_string,
  attributes: {
    position: bottom_half,
    offset: {
      buffer: regl.buffer(offset_array),
      divisor: 1
    },
    opacity_att: {
      buffer: opacity_buffer,
      divisor: 1
      }
  },
  depth: {
    enable: false
  },
  blend: blend_info,
  count: 3,
  uniforms: {
    zoom: zoom_function,
    inst_color: [0,0,1],
  },
  instances: num_row * num_col,
});

const draw_top = regl({
  vert: vert_string,
  frag: frag_string,
  attributes: {
    position: top_half,
    offset: {
      buffer: regl.buffer(offset_array),
      divisor: 1
    },
    opacity_att: {
      buffer: opacity_buffer,
      divisor: 1
      }
  },
  depth: {
    enable: false
  },
  blend: blend_info,
  count: 3,
  uniforms: {
    zoom: zoom_function,
    inst_color: [0,0,1],
  },
  instances: num_row * num_col,
});

regl.frame(function () {

  camera.draw( () => {
    // clear the background
    regl.clear({
      color: [0, 0, 0, 0]
    });
    // draw two parts of the matrix cell
    draw_top();
    draw_bottom();
  });

})