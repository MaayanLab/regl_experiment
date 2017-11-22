/*
  Making an interactive matrix using instancing.

  use the following to run using budo:
  budo matrix_example.js --open --live -- -t es2020

  use the following command to create a bundle:
  browserify -r es2020 matrix_example.js > ../cytof_example_2/bundle.js

  Bugs
  **************
  1. resizing causes errors with tracking zooming/panning
  2. resizing does not immediately redraw figure

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

tick = 0
has_been_both = false


still_interacting = false;
initialize_viz = true;

var filename = 'data/mult_view.json'
// var filename = 'data/mnist.json'
// var filename = 'data/mnist_thin.json'
// var filename = 'data/cytof_10k.json'
// var filename = 'data/cytof_25k.json'
// var filename = 'data/cytof_35k.json'

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
      gl_Position = zoom * vec4( 0.25*position.x, -0.25 * position.y + 1.2, 0.0, 2.0);
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
  zoom_data = {};
  _.each(['x', 'y'], function(inst_dim){
    inst_data = {};
    // total zooming (formerly tsx)
    inst_data.total_zoom = 1;
    // position of cursor (formerly x0)
    inst_data.cursor_position = 0;
    // total panning relative to the min
    inst_data.total_pan_min = 0;
    // total panning relative to the max
    inst_data.total_pan_max = 0;
    // pan_room (allowed negative panning)
    inst_data.pan_room = 0;
    // pan_by_zoom (formerly zdx)
    inst_data.pan_by_zoom = 0;
    inst_data.pan_by_drag = 0;
    inst_data.inst_zoom = 1;

    // keep track of previous restrictions
    inst_data.prev_restrict = false;

    // add to zoom_data
    zoom_data[inst_dim] = inst_data;
  });


  // working on improved matrix zooming
  zoom_restrict_mat = {};

  zoom_restrict_mat.x = {};
  zoom_restrict_mat.x.max = max_zoom;
  zoom_restrict_mat.x.min = 1.0;
  zoom_restrict_mat.x.ratio = 1;

  zoom_restrict_mat.y = {};
  zoom_restrict_mat.y.max = max_zoom;
  zoom_restrict_mat.y.min = 1.0;
  zoom_restrict_mat.y.ratio = 1;

  // increase max zoom in y or x direction
  if (num_row > num_col){
    zoom_restrict_mat.y.max = zoom_restrict_mat.y.max * ( num_row/num_col );
    zoom_restrict_mat.y.ratio = num_row/num_col;
  } else if (num_col < num_row) {
    zoom_restrict_mat.x.max = zoom_restrict_mat.x.max * ( num_col/num_row );
    zoom_restrict_mat.x.ratio = num_col/num_row;
  }

  // Set up viz_dim
  ///////////////////////
  var opts = opts || {};
  var options = extend({
      element: opts.element || regl._gl.canvas,
    }, opts || {});

  var element = options.element;

  viz_dim = {};
  viz_dim.canvas = {};
  viz_dim.mat = {};

  _.each(['width', 'height'], function(inst_dim){
    viz_dim.canvas[inst_dim] = Number.parseFloat(d3.select(element)
      .style(inst_dim).replace('px', ''));
  });

  // square matrix size set by width of canvas
  viz_dim.mat.width = viz_dim.canvas.width/2;
  viz_dim.mat.height = viz_dim.canvas.width/2;

  // min and max position of matrix
  viz_dim.mat.x = {};
  viz_dim.mat.x.min = viz_dim.canvas.width/2 - viz_dim.mat.width/2;
  viz_dim.mat.x.max = viz_dim.canvas.width/2 + viz_dim.mat.width/2;

  viz_dim.mat.y = {};
  viz_dim.mat.y.min = viz_dim.canvas.height/2 - viz_dim.mat.height/2;
  viz_dim.mat.y.max = viz_dim.canvas.height/2 + viz_dim.mat.height/2;

  zoom_rules_high_mat(regl, zoom_restrict_mat, zoom_data, 'mat', viz_dim);

  var zoom_infos = {};
  zoom_infos['row-labels'] = zoom_rules['row-labels'](regl, zoom_restrict, 'row-labels');
  zoom_infos['col-labels'] = zoom_rules['col-labels'](regl, zoom_restrict, 'col-labels');

  var draw_labels = {};
  draw_labels['row'] = require('./draw_mat_labels')(regl, num_row, 'row');
  draw_labels['col'] = require('./draw_mat_labels')(regl, num_col, 'col');

  var draw_dendro = {};
  draw_dendro['row'] = require('./draw_dendro')(regl, num_row, 'row');
  draw_dendro['col'] = require('./draw_dendro')(regl, num_col, 'col');


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
    zoom_data,
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
      draw_labels['col']();

      draw_dendro['row']();
      draw_dendro['col']();

      draw_text_triangles();
    });

  }

  regl.frame(function () {

    if (still_interacting == true || initialize_viz == true){
      initialize_viz = false;
      draw_commands();
    }

  })


}