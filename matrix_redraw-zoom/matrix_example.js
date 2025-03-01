/*
  Making an interactive matrix using instancing.
 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})
var interactionEvents = require('interaction-events');

num_cell = 500;

old_num_cell = num_cell;

console.log('redrawing zoom')


var draw_mat_rows = require('./draw_mat_labels')(regl, num_cell, 'row');
var draw_mat_cols = require('./draw_mat_labels')(regl, num_cell, 'col');

const camera = require('./camera-2d_matrix-example')(regl, {
  xrange: [-1.5, 1.5],
  yrange: [-1.5, 1.5]
});

var opacity = []
  for (var i = 0; i < num_cell * num_cell; i++) {
    opacity[i] = Math.random();
  }

var draw_cells = require('./draw_cells')(regl, num_cell, 1, opacity);

window.addEventListener('resize', camera.resize);

// Create nice controls:
require('control-panel')(
    [
      {type: 'range', min: 100, max: 1000, label: 'num_cell', initial: num_cell, step: 100}
    ],
    {width: 400}
  )
  .on('input', (data) => {

    num_cell = data.num_cell;

    // pointRadius = data.radius
    // if (data.n !== n) {
    //   n = Math.round(data.n)
    //   createDatasets()
    // }

  })

tot_zoom = 1;
prev_tot_zoom = 0;

// Interaction Events
interactionEvents()
  .on('interactionstart', function (ev) {
    ev.preventDefault();
  })
  .on('interactionend', function (ev) {
    ev.preventDefault();
  })
  .on('interaction', function (ev) {

    switch (ev.type) {
      case 'wheel':
        ev.dsx = ev.dsy = Math.exp(-ev.dy / 100);
        ev.dx = ev.dy = 0;
        break;
    }

    if (ev.buttons || ['wheel', 'touch', 'pinch'].indexOf(ev.type) !== -1)  {

      ev.preventDefault();

      // console.log('scroll x', ev.dsx)
      // console.log('scroll y', ev.dsy)

      // // change the number of cells with instantaneous zoom
      // /////////////////////////////////////////////////////
      // tmp = ev.dsx * 10 + 5
      // if (tmp > 1000) {
      //   tmp = 1000;
      // }
      // num_cell = Math.round(tmp)

      // change the number of cells with instantaneous zoom
      /////////////////////////////////////////////////////
      tot_zoom = tot_zoom * ev.dsx

      // tmp = tot_zoom * 10 + 5
      // if (tmp > 1000) {
      //   tmp = 1000;
      // }
      // num_cell = Math.round(tmp)


    }

  });

regl.frame(function () {

  camera.draw(() => {

    // clear the background
    regl.clear({
      color: [0, 0, 0, 0]
    });

    // check if num cell is updated
    // if (old_num_cell != num_cell){
    if (prev_tot_zoom != tot_zoom){

      prev_tot_zoom = tot_zoom;

      old_num_cell = num_cell;

      draw_mat_rows = require('./draw_mat_labels')(regl, num_cell, 'row');
      draw_mat_cols = require('./draw_mat_labels')(regl, num_cell, 'col');
      draw_cells = require('./draw_cells')(regl, num_cell, tot_zoom, opacity);

    }

    // draw two parts of the matrix cell
    draw_cells.top();
    draw_cells.bot();
    draw_mat_rows();
    draw_mat_cols();

  });

})