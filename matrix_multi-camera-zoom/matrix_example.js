/*
  Making an interactive matrix using instancing.
 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})
var extend = require('xtend/mutable');
const vectorizeText = require('vectorize-text')
var zoom_rules = {};
var zoom_rules_high_mat = require('./zoom_rules_high_mat');
zoom_rules['row-labels'] = require('./zoom_rules_general');
zoom_rules['col-labels'] = require('./zoom_rules_general');

d3 = require('d3');
_ = require('underscore')


still_interacting = false;
initialize_viz = true;

// var filename = 'data/mnist.json'
// var filename = 'data/mnist_thin.json'
// var filename = 'data/cytof_25k.json'
var filename = 'data/mult_view.json'

require('resl')({
  manifest:{
    'viz':{
      type: 'text',
      src: filename
    }
  },
  onDone: (assets) => {
    run_viz(regl, assets);
  }
})

// max ~200 min ~20
var font_detail = 200;
text_vect = vectorizeText('Title', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true,
  size:font_detail,
  font:'"Open Sans", verdana, arial, sans-serif'
});

var zoom_function = function(context){
  return context.view;
}

// draw command
///////////////////
const draw_text_triangles = regl({
  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform mat4 zoom;

    void main () {
      // reverse y position to get words to be upright
      gl_Position = zoom * vec4( 0.25*position.x, -0.25 * position.y + 1.5, 0.0, 2.0);
    }`,
  frag: `
    precision mediump float;
    void main () {
      gl_FragColor = vec4(1, 0, 0, 1.0);
    }`,
  attributes: {
    position: text_vect.positions
  },
  elements: text_vect.cells,
  uniforms: {
    zoom: zoom_function
  }
})

function run_viz(regl, assets){

  network = JSON.parse(assets['viz'])

  // // generate fake data
  // //////////////////////////
  // var num_row = 30;
  // var num_col = 29;

  // mat_data = []
  // tmp = 1;
  // total = num_row * num_col;
  // for (var i=0; i < num_row; i++){
  //   mat_data[i] = []
  //   for (var j=0; j < num_col; j++){
  //     mat_data[i][j] = 2*Math.random() - 1;
  //     // mat_data[i][j] = 1/( i + j + 1) ;
  //     // mat_data[i][j] = (tmp / total) + 0.2;
  //     tmp = tmp + 1;
  //   }
  // }

  // need to generate fake row/col ordering data

  // use data from network
  //////////////////////////
  mat_data = network.mat

  var num_row = mat_data.length;
  var num_col = mat_data[0].length;

  zoom_restrict = {};

  // setting zoom high for CyTOF example
  max_zoom = 10;
  zoom_restrict.max_x = max_zoom;
  zoom_restrict.max_y = max_zoom;
  zoom_restrict.min_x = 1.0;
  zoom_restrict.min_y = 1.0;

  zoom_restrict.ratio_x = 1;
  zoom_restrict.ratio_y = 1;

  // run one fix of mat offset
  fix_once = true

  // increase max zoom in y or x direction
  if (num_row > num_col){
    zoom_restrict.max_y = zoom_restrict.max_y * ( num_row/num_col );
    zoom_restrict.ratio_y = num_row/num_col;
  } else if (num_col < num_row) {
    zoom_restrict.max_x = zoom_restrict.max_x * ( num_col/num_row );
    zoom_restrict.ratio_x = num_col/num_row;
  }

  // organize zoom rules into x and y components
  var zoom_data = {};
  _.each(['x', 'y'], function(inst_dim){
    info = {};
    // total zooming (formerly tsx)
    info.total_zoom = 1;
    // position of cursor (formerly x0)
    info.cursor_position = 0;
    // total panning
    info.total_pan_x = 0;
    // pan_by_zoom (formerly zdx)
    info.pan_by_zoom = 0;
    // add to zoom_data
    zoom_data[inst_dim] = info;
  });

  zoom_rules_high_mat(regl, zoom_restrict, zoom_data, 'mat');


  var zoom_infos = {}
  zoom_infos['row-labels'] = zoom_rules['row-labels'](regl, zoom_restrict, 'row-labels');
  zoom_infos['col-labels'] = zoom_rules['col-labels'](regl, zoom_restrict, 'col-labels');

  var draw_labels = {}
  draw_labels['row'] = require('./draw_mat_labels')(regl, num_row, 'row');
  draw_labels['col'] = require('./draw_mat_labels')(regl, num_col, 'col');

  flat_mat = [].concat.apply([], mat_data);

  var draw_cells = require('./draw_cells')(regl, network, mat_data);

  var ini_scale = 1.0 ;

  const camera = {}
  // requiring camera and
  camera['mat'] = require('./camera_2d_mat')(regl,
    {
      xrange: [-ini_scale, ini_scale],
      yrange: [-ini_scale, ini_scale]
    },
    zoom_data.x,
    'verbose'
  );

  camera['row-labels'] = require('./camera_2d_general')(
    regl,
    {
      xrange: [-ini_scale, ini_scale],
      yrange: [-ini_scale, ini_scale]
    },
    zoom_infos['row-labels']
  );

  camera['col-labels'] = require('./camera_2d_general')(regl,
    {
      xrange: [-ini_scale, ini_scale],
      yrange: [-ini_scale, ini_scale]
    },
    zoom_infos['col-labels']
  );

  window.addEventListener('resize', camera['mat'].resize);
  window.addEventListener('resize', camera['row-labels'].resize);
  window.addEventListener('resize', camera['col-labels'].resize);

  camera_type = 'mat'
  function draw_commands(){

    camera['mat'].draw(() => {
      regl.clear({ color: [0, 0, 0, 0] });
      draw_cells.top();
      draw_cells.bot();


    });

    camera['row-labels'].draw(() => {
      draw_labels['row']();
    });

    // camera['col-labels'].draw(() => {
    //   draw_text_triangles();
    //   draw_labels['col']();
    // });

  }

  regl.frame(function () {

    if (still_interacting == true || initialize_viz == true){
      initialize_viz = false;
      draw_commands();
    }

  })


}