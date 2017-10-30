/*
  Making an interactive matrix using instancing.
 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})
var extend = require('xtend/mutable');
var zoom_rules = require('./zoom_rules_no-rules');

zoom_info = zoom_rules(regl);

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

var max_zoom = 10;
var min_zoom = 0.5;

// var filename = 'data/mnist.json'
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

function run_viz(regl, assets){

  network = JSON.parse(assets['viz'])

  // // generate fake data
  // //////////////////////////
  // var num_row = 20;
  // var num_col = 5;

  // mat_data = []
  // tmp = 1;
  // total = num_row * num_col;
  // for (var i=0; i < num_row; i++){
  //   mat_data[i] = []
  //   for (var j=0; j < num_col; j++){
  //     // mat_data[i][j] = 2*Math.random() - 1;
  //     // mat_data[i][j] = 1/( i + j + 1) ;
  //     mat_data[i][j] = (tmp / total) + 0.2;
  //     tmp = tmp + 1;
  //   }
  // }

  // use data from network
  //////////////////////////
  mat_data = network.mat

  var num_row = mat_data.length;
  var num_col = mat_data[0].length;

  var draw_mat_rows = require('./draw_mat_labels')(regl, num_row, 'row');
  var draw_mat_cols = require('./draw_mat_labels')(regl, num_col, 'col');

  flat_mat = [].concat.apply([], mat_data);

  var draw_cells = require('./draw_cells')(regl, network, mat_data);

  var ini_scale = 0.8 ;
  const camera_vert_zoom = require('./camera_vert_zoom')(
    regl,
    {
      xrange: [-ini_scale, ini_scale],
      yrange: [-ini_scale, ini_scale]
    },
    zoom_info
  );

  const camera_1 = require('./camera_1')(regl,
    {
      xrange: [-ini_scale, ini_scale],
      yrange: [-ini_scale, ini_scale]
    },
    zoom_info
  );

  const camera_3 = require('./camera_3')(regl, {
    xrange: [-ini_scale, ini_scale],
    yrange: [-ini_scale, ini_scale]
  });

  window.addEventListener('resize', camera_vert_zoom.resize);
  // window.addEventListener('resize', camera_2.resize);
  window.addEventListener('resize', camera_3.resize);

  function draw_commands(){

    camera_1.draw(() => {
      regl.clear({ color: [0, 0, 0, 0] });
      draw_cells.top();
      draw_cells.bot();
    });

    // camera_vert_zoom.draw(() => {
    //   draw_mat_rows();
    // });

    camera_1.draw(() => {
      draw_mat_rows();
    });

  }

  regl.frame(function () {

    if (still_interacting == true || initialize_viz == true){
      initialize_viz = false;
      draw_commands();
    }

  })


}