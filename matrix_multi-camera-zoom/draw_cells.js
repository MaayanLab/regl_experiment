module.exports = function(regl, network, mat_data){

  num_row = mat_data.length;
  num_col = mat_data[0].length;

  console.log('num_row: ' + String(num_row))
  console.log('num_col: ' + String(num_col))

  flat_mat_data = [].concat.apply([], mat_data)

  abs_max_val = _.max(flat_mat_data, function(d){
    return Math.abs(d);
  })

  var zoom_function = function(context){
    return context.view;
  }

  // This buffer stores the opacities
  const opacity_buffer = regl.buffer({
    length: num_row * num_col * 2 ,
    type: 'float',
    usage: 'dynamic'
  })

  // flat_mat_data = _.each(flat_mat_data, function(d){
  //   return d/abs_max_val;
  // })

  opacity_scale = d3.scale.linear()

  opacity_domain = abs_max_val /1.5;
  opacity_range = 0.80;

  opacity_scale
    .domain([-opacity_domain, opacity_domain])
    .range([-opacity_range, opacity_range])
    .clamp(true);

  flat_mat_data = flat_mat_data.map(function(x) {
    return opacity_scale(x)
  });

  // initialize buffer
  // can use mat_data or flat_mat_data
  opacity_buffer(flat_mat_data);

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

  // generate x position array
  x_arr = Array(num_col).fill()
    .map(function(_, i){
      return i/num_col - offset.x
    });

  y_arr = Array(num_row).fill()
    .map(function(_, i){
      return -i/num_row + offset.y - 1/num_row
    });


  row_nodes = network.row_nodes;
  col_nodes = network.col_nodes;


  // generate x and y positions
  ////////////////////////////////
  function pos_xy_function(_, i){

    // var x =  (i % num_col) / num_col - offset.y;
    // var y =  offset.x - ( Math.floor(i  / num_col) + 1 ) / num_row ;

    // looking up x and y position
    var col_id = i % num_col;
    var row_id = Math.floor(i / num_col);

    row_order_id = num_row - 1 - row_nodes[row_id].clust;
    col_order_id = num_col - 1 - col_nodes[col_id].clust;

    // console.log(row_id)

    var x = x_arr[ col_order_id ];
    var y = y_arr[ row_order_id ];

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

      // manually tweaking opacity range, will improve to match old version

      if (var_opacity > 0.0){
        gl_FragColor = vec4(1, 0, 0, abs(var_opacity) + 0.15);
      } else {
        gl_FragColor = vec4(0, 0, 1, abs(var_opacity) + 0.15);
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