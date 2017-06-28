/*
  Making an interactive matrix using instancing.

 */

regl = require('regl')({extensions: ['angle_instanced_arrays']})

var num_cell = 10;

var draw_mat_rows = require('./draw_mat_labels')(regl, num_cell, 'row');
var draw_mat_cols = require('./draw_mat_labels')(regl, num_cell, 'col');
var draw_cells = require('./draw_cells')(regl, num_cell);

const camera = require('./camera-2d')(regl, {
  xrange: [-1.5, 1.5],
  yrange: [-1.5, 1.5]
});

window.addEventListener('resize', camera.resize);

make_viz = function(){

  regl.frame(function () {

    camera.draw(() => {

      // clear the background
      regl.clear({
        color: [0, 0, 0, 0]
      });

      // draw two parts of the matrix cell
      draw_cells.top();
      draw_cells.bot();
      draw_mat_rows();
      draw_mat_cols();

    });

  })

}

make_viz()
