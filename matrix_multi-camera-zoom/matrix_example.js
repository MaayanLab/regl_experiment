/*
  Making an interactive matrix using instancing.
 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})
var extend = require('xtend/mutable');
var zoom_rules = {};
zoom_rules['mat'] = require('./zoom_rules_general');
zoom_rules['row-labels'] = require('./zoom_rules_general');
zoom_rules['col-labels'] = require('./zoom_rules_general');

d3 = require('d3');
_ = require('underscore')

var opts = opts || {};
var options = extend({
    element: opts.element || regl._gl.canvas,
  }, opts || {});

var element = options.element;

still_interacting = false;
initialize_viz = true;

interaction_types = ['wheel', 'touch', 'pinch'];

var filename = 'data/mnist.json'
// var filename = 'data/mult_view.json'

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
  zoom_restrict.max_x = 10.0;
  zoom_restrict.max_y = 10.0;
  zoom_restrict.min_x = 1.0;
  zoom_restrict.min_y = 1.0;

  zoom_restrict.ratio_x = 1;
  zoom_restrict.ratio_y = 1;

  // increase max zoom in y or x direction
  if (num_row > num_col){
    zoom_restrict.max_y = zoom_restrict.max_y * ( num_row/num_col );
    zoom_restrict.ratio_y = num_row/num_col;
  } else if (num_col < num_row) {
    zoom_restrict.max_x = zoom_restrict.max_x * ( num_col/num_row );
    zoom_restrict.ratio_x = num_col/num_row;
  }

  var zoom_info = {}
  zoom_info['mat'] = zoom_rules['mat'](regl, zoom_restrict, 'mat');
  zoom_info['row-labels'] = zoom_rules['row-labels'](regl, zoom_restrict, 'row-labels');
  zoom_info['col-labels'] = zoom_rules['col-labels'](regl, zoom_restrict, 'col-labels');

  var draw_labels = {}
  draw_labels['row'] = require('./draw_mat_labels')(regl, num_row, 'row');
  draw_labels['col'] = require('./draw_mat_labels')(regl, num_col, 'col');

  flat_mat = [].concat.apply([], mat_data);

  var draw_cells = require('./draw_cells')(regl, network, mat_data);

  var ini_scale = 0.8 ;

  const camera = {}
  camera['mat'] = require('./camera_2d_general')(regl,
    {
      xrange: [-ini_scale, ini_scale],
      yrange: [-ini_scale, ini_scale]
    },
    zoom_info['mat']
  );

  camera['row-labels'] = require('./camera_2d_general')(regl,
    {
      xrange: [-ini_scale, ini_scale],
      yrange: [-ini_scale, ini_scale]
    },
    zoom_info['row-labels']
  );

  camera['col-labels'] = require('./camera_2d_general')(regl,
    {
      xrange: [-ini_scale, ini_scale],
      yrange: [-ini_scale, ini_scale]
    },
    zoom_info['col-labels']
  );

  window.addEventListener('resize', camera['mat'].resize);
  window.addEventListener('resize', camera['row-labels'].resize);

  function draw_commands(){

    camera['mat'].draw(() => {
      regl.clear({ color: [0, 0, 0, 0] });
      draw_cells.top();
      draw_cells.bot();
    });

    camera['row-labels'].draw(() => {
      draw_labels['row']();
    });

    camera['col-labels'].draw(() => {
      draw_labels['col']();
    });

  }

  regl.frame(function () {

    if (still_interacting == true || initialize_viz == true){
      initialize_viz = false;
      draw_commands();
    }

  })


}