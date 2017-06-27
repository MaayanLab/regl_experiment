module.exports = function(regl){

  var m3 = require('./mat3_transform');

  var zoom_function = function(context){
    return context.view;
  }


  mat_scale = m3.scaling(0.1, 0.1);
  mat_rotate = m3.rotation(Math.PI/4);
  vec_translate = [-0.5, 0.43, 0.0];

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
        [-0.5, 0.5],
        [-0.5, -0.5],
        [0.5, -0.5],
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