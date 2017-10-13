module.exports = function(regl, num_cell, tot_zoom){

  console.log(tot_zoom)

  opacity = []
  for (var i = 0; i < num_cell * num_cell; i++) {
    opacity[i] = Math.random();
  }

  var zoom_function = function(context){
    return context.view;
  }

  // This buffer stores the opacities
  const opacity_buffer = regl.buffer({
    length: opacity.length * 4,
    type: 'float',
    usage: 'dynamic'
  })

  // initialize buffer
  opacity_buffer(opacity);

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
  function offset_function(_, i){
                var x = -0.5 +  ( Math.floor(i / num_cell) ) / num_cell ;
                x = tot_zoom * x;
                var y = -0.5 + (i % num_cell) / num_cell ;
                y = tot_zoom * y
                return [x, y];
              };

  var offset_array = Array(num_cell * num_cell)
            .fill()
            .map(offset_function);

  // bottom half
  var bottom_half = [
    [1/num_cell, 0.0],
    [0.0,       0.0],
    [0.0,       1/num_cell]];

  // top half
  var top_half = [
    [1/num_cell, 0.0 ],
    [1/num_cell, 1/num_cell],
    [0.0,       1/num_cell]
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
      gl_FragColor = vec4(inst_color, var_opacity);

    }`;

  var inst_half = bottom_half;

  regl_props = {
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
      inst_color: [1,0,0],
    },
    instances: num_cell * num_cell,
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