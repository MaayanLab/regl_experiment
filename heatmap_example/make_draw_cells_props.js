var make_draw_cells_buffers = require('./make_draw_cells_buffers');
var blend_info = require('./blend_info')
var $ = require('jquery')

module.exports = function make_draw_cells_props(arrs){

  // transfer to buffers is sort of slow
  //////////////////////////////////////////
  var buffers = make_draw_cells_buffers(arrs.position_arr,
                                        arrs.opacity_arr);

  var opacity_buffer = buffers.opacity_buffer;
  var position_buffer = buffers.position_buffer;

  // bottom half
  var bottom_half_verts = [
    [1/num_col, 0.0],
    [0.0,       0.0],
    [0.0,       1/num_row]
  ];

  // top half
  var top_half_verts = [
    [1/num_col, 0.0 ],
    [1/num_col, 1/num_row],
    [0.0,       1/num_row]
    ];

  var vert_string = `
    precision highp float;

    attribute vec2 position;

    // These three are instanced attributes.
    attribute vec2 pos_att;
    attribute float opacity_att;
    uniform mat4 zoom;

    // pass varying variables to fragment from vector
    varying float var_opacity;

    void main() {

      gl_Position = zoom *
                    vec4( position.x + pos_att.x,
                          position.y + pos_att.y,
                          // positioned further down (spillover recst are
                          // above at 0.5)
                          0.75,
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

  var num_instances = arrs.position_arr.length;

  var zoom_function = function(context){
    return context.view;
  }

  var regl_props = {
    vert: vert_string,
    frag: frag_string,
    attributes: {
      position: '',
      pos_att: {
        buffer: position_buffer,
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
    instances: num_instances,
    depth: {
      enable: true,
      mask: true,
      func: 'less',
      // func: 'greater',
      range: [0, 1]
    },
  };

  // draw top and bottom of matrix cells
  //////////////////////////////////////
  var draw_cells_props = {};
  draw_cells_props.regl_props = {};

  top_props = $.extend(true, {}, regl_props);
  top_props.attributes.position = top_half_verts;
  draw_cells_props.regl_props['top'] = top_props;

  bot_props = $.extend(true, {}, regl_props);
  bot_props.attributes.position = bottom_half_verts;
  draw_cells_props.regl_props['bot'] = bot_props;

  return draw_cells_props;

};