module.exports = function(regl, num_cell){

  var row_width = 0.05;
  var row_height = 1/(num_cell);

  var m3 = require('./mat3_transform');

  var zoom_function = function(context){
    return context.view;
  }

  /////////////////////////////////
  // make buffer for row offsets
  /////////////////////////////////

  var x_offset = -0.55;
  var y_offset = 0.5 - row_height/2 - 1*row_height;

  mat_scale = m3.scaling(1, 1);
  // mat_rotate = m3.rotation(Math.PI/4);
  mat_rotate = m3.rotation(0);
  vec_translate = [x_offset, y_offset, 0.0];

  // draw background
  const draw_rows = regl({

    vert: `
      precision highp float;
      attribute vec2 position;
      varying vec3 new_position;
      uniform mat3 mat_rotate;
      uniform mat3 mat_scale;
      uniform vec3 vec_translate;
      uniform mat4 zoom;

      void main () {

        new_position = vec3(position, 0);
        new_position = mat_rotate * mat_scale * new_position + vec_translate;

        gl_Position = zoom * vec4(new_position, 1);

      }
    `,

    frag: `

      // color triangle red
      void main () {
        gl_FragColor = vec4(0, 0, 0, 1);
      }

    `,

    attributes: {
      position: [
        [row_width,  row_height/2],
        [0.00,  0.0],
        [row_width, -row_height/2],
      ]
    },

    uniforms: {
      zoom: zoom_function,
      mat_rotate: mat_rotate,
      mat_scale: mat_scale,
      vec_translate: vec_translate
    },

    count: 3

  });

  return draw_rows;

};