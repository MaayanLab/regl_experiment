module.exports = function(regl, mat_data){

  num_row = mat_data.length;
  num_col = mat_data[0].length;

  console.log('num_row: ' + String(num_row))
  console.log('num_col: ' + String(num_col))

  var zoom_function = function(context){
    return context.view;
  }

  // This buffer stores the opacities
  const opacity_buffer = regl.buffer({
    length: num_row * num_col * 2 ,
    type: 'float',
    usage: 'dynamic'
  })

  // initialize buffer
  opacity_buffer(mat_data);

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

  // draw matrix cells
  /////////////////////////////////////////
  // set up offset array for buffer
  var offset = {};
  offset.x = 0.5;
  offset.y = 0.5;


  //
  function pos_xy_function(_, i){

    var x =  (i % num_col) / num_col - offset.y;
    var y =  offset.x - ( Math.floor(i  / num_col) + 1 ) / num_row ;

    return [x, y];

  };

  pos_xy_array = Array(num_row * num_col)
            .fill()
            .map(pos_xy_function);



  // bottom half
  var bottom_half = [
    [1/num_col, 0.0],
    [0.0,       0.0],
    [0.0,       1/num_row]
  ];

  // top half
  var top_half = [
    [1/num_col, 0.0 ],
    [1/num_col, 1/num_row],
    [0.0,       1/num_row]
    ];

  var vert_string = `
    precision highp float;

    attribute vec2 position;

    // These three are instanced attributes.
    attribute vec3 color_att;
    attribute vec2 inst_pos;
    attribute float opacity_att;
    uniform mat4 zoom;

    // pass varying variables to fragment from vector
    varying float var_opacity;

    void main() {

      gl_Position = zoom *
                    vec4( position.x + inst_pos.x,
                          position.y + inst_pos.y,
                          0,
                          1
                        );

      // pass attribute (in vert) to varying in frag
      var_opacity = opacity_att;

    }`;

  var frag_string = `
    precision highp float;
    varying float var_opacity;
    uniform vec3 inst_color;
    varying vec3 tmp_color;
    void main() {

      // tmp_color = vec3(0, 0, 1);

      if (var_opacity > 0.0){
        gl_FragColor = vec4(1, 0, 0, abs(var_opacity));
      } else {
        gl_FragColor = vec4(0, 0, 1, abs(var_opacity));
      }

    }`;

  var inst_half = bottom_half;

  regl_props = {
    vert: vert_string,
    frag: frag_string,
    attributes: {
      position: top_half,
      inst_pos: {
        buffer: regl.buffer(pos_xy_array),
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
  };

  bot_props = regl_props;
  bot_props.attributes.position = bottom_half;

  var draw_cells = {};

  draw_cells.bot = regl(bot_props)

  top_props = regl_props;
  top_props.attributes.position = top_half;

  draw_cells.top = regl(top_props);

  return draw_cells;

};