/*
  tags: instancing, basic

  In this example, it is shown how you can draw a bunch of triangles using the
  instancing feature of regl.

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})

var draw_rows = require('./draw_rows_fun')(regl);
var draw_cells = require('./draw_cells')(regl);

const camera = require('./camera-2d')(regl, {
  xrange: [-1.5, 1.5],
  yrange: [-1.5, 1.5]
});


window.addEventListener('resize', camera.resize);


regl.frame(function () {

  camera.draw( () => {

    // clear the background
    regl.clear({
      color: [0, 0, 0, 0]
    });

    // draw two parts of the matrix cell
    draw_rows();
    draw_cells.top();
    draw_cells.bot();

  });

})