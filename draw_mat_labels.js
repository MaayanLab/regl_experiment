module.exports = function draw_mat_labels(regl, num_rows, inst_rc){

  var row_width = 0.05;
  var row_height = 1/num_rows;

  var m3 = require('./mat3_transform');

  var zoom_function = function(context){
    return context.view;
  }

  /////////////////////////////////
  // make buffer for row offsets
  /////////////////////////////////

  var x_offset = -0.55;

  y_offset_array = [];
  for (var i = 0; i < num_rows; i++){
    y_offset_array[i] = 0.5 - row_height/2 - i * row_height
  }

  const y_offset_buffer = regl.buffer({
    length: num_rows,
    type: 'float',
    usage: 'dynamic'
  });

  y_offset_buffer(y_offset_array);

  mat_scale = m3.scaling(1, 1);

  var rotation_radians;
  if (inst_rc === 'row'){
    rotation_radians = 0;
  } else if (inst_rc === 'col'){
    rotation_radians = Math.PI/2;
  }

  mat_rotate = m3.rotation(rotation_radians);

  // draw background
  const draw_rows = regl({

    vert: `
      precision highp float;
      attribute vec2 position;
      attribute float y_offset_att;

      uniform mat3 mat_rotate;
      uniform mat3 mat_scale;
      uniform mat4 zoom;
      uniform float x_offset;

      varying vec3 new_position;
      varying vec3 vec_translate;

      void main () {

        new_position = vec3(position, 0);

        vec_translate = vec3(x_offset, y_offset_att, 0);

        // new_position = mat_rotate * mat_scale * new_position + vec_translate;
        new_position = mat_rotate * ( mat_scale * new_position + vec_translate ) ;

        gl_Position = zoom * vec4(new_position, 1);

      }
    `,

    frag: `

      // color triangle red
      void main () {
        gl_FragColor = vec4(0.5, 0.5, 0.5, 1);
      }

    `,

    attributes: {
      position: [
        [row_width,  row_height/2],
        [0.00,  0.0],
        [row_width, -row_height/2],
      ],
      y_offset_att: {
        buffer: y_offset_buffer,
        divisor: 1
      }
    },

    uniforms: {
      zoom: zoom_function,
      mat_rotate: mat_rotate,
      mat_scale: mat_scale,
      x_offset: x_offset
    },

    count: 3,
    instances: num_rows

  });

  return draw_rows;

};