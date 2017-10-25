/*
  Making an interactive matrix using instancing.

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})

console.log('multi-camera-zooming, passing in opacity')

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
  // var num_row = 10;
  // var num_col = 10;

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

  mat_data = network.mat

  var num_row = mat_data.length;
  var num_col = mat_data[0].length;

  var draw_mat_rows = require('./draw_mat_labels')(regl, num_row, 'row');
  var draw_mat_cols = require('./draw_mat_labels')(regl, num_col, 'col');

  flat_mat = [].concat.apply([], mat_data);

  var draw_cells = require('./draw_cells')(regl, mat_data);

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

  regl.frame(function () {

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

  })

}