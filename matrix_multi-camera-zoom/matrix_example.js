/*
  Making an interactive matrix using instancing.

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})
var extend = require('xtend/mutable');
var EventEmitter = require('event-emitter');
var interactionEvents = require('interaction-events');

var emitter = new EventEmitter();

var opts = opts || {};
var options = extend({
    element: opts.element || regl._gl.canvas,
  }, opts || {});

var element = options.element;

still_interacting = false;
initialize_viz = true;

interactionEvents({
    element: element,
  }).on('interactionstart', function (ev) {
    // ev.preventDefault();

  }).on('interactionend', function (ev) {
    // ev.preventDefault();
    // console.log('stopped')
  }).on('interaction', function (ev) {

    if (ev.buttons || ['wheel', 'touch', 'pinch'].indexOf(ev.type) !== -1)  {
      // console.log('interacting')

      if (still_interacting == false){

        still_interacting = true;

        // any interaction will make this false

        setTimeout(function(){
          // console.log('done')
          return still_interacting = false;
        }, 1000)
      }
    }

  })

d3 = require('d3');
_ = require('underscore')

console.log('multi-camera-zooming, passing in opacity')
console.log(d3.version)


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

  var ini_scale = 1.0 ;
  const camera_1 = require('./camera_vert_zoom')(regl, {
    xrange: [-ini_scale, ini_scale],
    yrange: [-ini_scale, ini_scale]
  });

  const camera_2 = require('./camera_2')(regl, {
    xrange: [-ini_scale, ini_scale],
    yrange: [-ini_scale, ini_scale]
  });

  const camera_3 = require('./camera_3')(regl, {
    xrange: [-ini_scale, ini_scale],
    yrange: [-ini_scale, ini_scale]
  });

  window.addEventListener('resize', camera_1.resize);
  window.addEventListener('resize', camera_2.resize);
  window.addEventListener('resize', camera_3.resize);

  function draw_commands(){

    // console.log('running draw commands')
    // draw command 1
    camera_1.draw(() => {

      regl.clear({ color: [0, 0, 0, 0] });

      // draw two parts of the matrix cell
      draw_cells.top();
      draw_cells.bot();

    });

    // draw command 2
    camera_2.draw(() => {
      draw_mat_rows();
    });

    // camera_3.draw(() => {
    //   draw_mat_cols();
    // });

  }


  // // working on setting up something to only re-render after interaction
  // var options = extend(
  //       {
  //         element: opts.element || regl._gl.canvas,
  //       },
  //       opts || {}
  //     );

  // var element = options.element;

  regl.frame(function () {

    if (still_interacting == true || initialize_viz == true){
      initialize_viz = false;
      draw_commands();
    }

  })


}