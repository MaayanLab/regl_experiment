/*
  Making an interactive matrix using instancing.
 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})
var interactionEvents = require('interaction-events');

num_cell = 20;

old_num_cell = num_cell;


var draw_mat_rows = require('./draw_mat_labels')(regl, num_cell, 'row');
var draw_mat_cols = require('./draw_mat_labels')(regl, num_cell, 'col');
var draw_cells = require('./draw_cells')(regl, num_cell);

const camera = require('./camera-2d_matrix-example')(regl, {
  xrange: [-1.5, 1.5],
  yrange: [-1.5, 1.5]
});

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

        console.log('doing something')

        // dViewport[0] = ev.dsx;
        // dViewport[1] = 0;
        // dViewport[2] = 0;
        // dViewport[3] = 0;
        // dViewport[4] = 0;
        // dViewport[5] = ev.dsy;
        // dViewport[6] = 0;
        // dViewport[7] = 0;
        // dViewport[8] = 0;
        // dViewport[9] = 0;
        // dViewport[10] = 1;
        // dViewport[11] = 0;
        // dViewport[12] = -ev.dsx * ev.x0 + ev.x0 + ev.dx;
        // dViewport[13] = -ev.dsy * ev.y0 + ev.y0 + ev.dy;
        // dViewport[14] = 0;
        // dViewport[15] = 1;

        // mat4.multiply(dViewport, dViewport, mViewport);
        // mat4.multiply(dViewport, mInvViewport, dViewport);
        // mat4.multiply(mView, dViewport, mView);

        // dirty = true;
      }

      // var xy = vec4.transformMat4([],
      //   vec4.transformMat4([], [ev.x0, ev.y0, 0, 1], mInvViewport),
      //   mat4.invert([], mView)
      // );

      // ev.x = xy[0];
      // ev.y = xy[1];

      // emitter.emit('move', ev);

    });

regl.frame(function () {

  camera.draw(() => {

    // clear the background
    regl.clear({
      color: [0, 0, 0, 0]
    });

    // check if num cell is updated
    if (old_num_cell != num_cell){
      console.log('updating num_cell')
      old_num_cell = num_cell;

      draw_mat_rows = require('./draw_mat_labels')(regl, num_cell, 'row');
      draw_mat_cols = require('./draw_mat_labels')(regl, num_cell, 'col');
      draw_cells = require('./draw_cells')(regl, num_cell);

    }

    // draw two parts of the matrix cell
    draw_cells.top();
    draw_cells.bot();
    draw_mat_rows();
    draw_mat_cols();

  });

})