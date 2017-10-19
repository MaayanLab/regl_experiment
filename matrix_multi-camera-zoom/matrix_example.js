/*
  Making an interactive matrix using instancing.

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})

console.log('multi-camera-zooming, passing in opacity')

var num_row = 20;
var num_col = 10;

var draw_mat_rows = require('./draw_mat_labels')(regl, num_col, 'row');
var draw_mat_cols = require('./draw_mat_labels')(regl, num_row, 'col');

mat_data = []
for (var i=0; i < num_row; i++){
  mat_data[i] = []
  for (var j=0; j < num_col; j++){
    mat_data[i][j] = Math.random();
  }
}

flat_mat = [].concat.apply([], mat_data);
console.log(mat_data.length, mat_data[0].length)
console.log(flat_mat.length)

var draw_cells = require('./draw_cells')(regl, mat_data);

const camera_1 = require('./camera_1')(regl, {
  xrange: [-1.5, 1.5],
  yrange: [-1.5, 1.5]
});

const camera_2 = require('./camera_2')(regl, {
  xrange: [-1.5, 1.5],
  yrange: [-1.5, 1.5]
});

const camera_3 = require('./camera_3')(regl, {
  xrange: [-1.5, 1.5],
  yrange: [-1.5, 1.5]
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

  camera_3.draw(() => {
    draw_mat_cols();
  });

})