var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');
var zoom_rules_low_mat = require('./zoom_rules_low_mat');

module.exports = function zoom_rules_high_mat(regl, zoom_restrict, zoom_data, viz_component, viz_dim){

  var opts = opts || {};
  var options = extend({
      element: opts.element || regl._gl.canvas,
    }, opts || {});

  var element = options.element;

  var interaction_types = ['wheel', 'touch', 'pinch'];

  interactionEvents({
    element: element,
  })
  .on('interaction', function(ev){
    if (ev.buttons || interaction_types.indexOf(ev.type) !== -1)  {

      switch (ev.type) {
        case 'wheel':
          ev.dsx = ev.dsy = Math.exp(-ev.dy / 100);
          ev.dx = ev.dy = 0;
          break;
      }

      // transfer data from ev to zoom_data
      // zoom_data.x.inst_zoom = 1;
      zoom_data.x.inst_zoom = ev.dsx;

      // zoom_data.x.pan_by_drag = 0;
      zoom_data.x.pan_by_drag = ev.dx;

      zoom_data.x.cursor_position = ev.x0;

      // disable y zooming and panning
      ///////////////////////////////////

      // zoom_data.y.inst_zoom = 1;
      zoom_data.y.inst_zoom = ev.dsy;

      // zoom_data.y.pan_by_drag = 0;
      zoom_data.y.pan_by_drag = ev.dy;

      zoom_data.y.cursor_position = ev.y0;

      /*
      There is a problem toggling X-zoom when zooming quickly
      */

      // var inst_zoom_ratio =


      /*
      Zoom Switch only working for tall matrices not wide matrices
      */


      // set up two-stage zooming
      if (zoom_data.y.total_zoom < zoom_restrict.y.ratio){

        zoom_data.x.inst_zoom = 1;

        // console.log(zoom_data.y.inst_zoom)
        var potential_zoom = zoom_data.y.total_zoom * zoom_data.y.inst_zoom;

        // check potential_zoom
        if (potential_zoom > zoom_restrict.y.ratio){
          // console.log('--------------------------')
          // console.log('passed threshold ' + potential_zoom)

          // bump x inst_zoom
          zoom_data.x.inst_zoom = potential_zoom / zoom_restrict.y.ratio;

          // console.log()
          // console.log('--------------------------')
        }

      }

      // else {

      //   // // checking total_zoom when
      //   // console.log(
      //   //   zoom_data.y.total_zoom,
      //   //   zoom_data.x.total_zoom,
      //   //   zoom_data.y.total_zoom / zoom_data.x.total_zoom
      //   // )

      //   // Fix for fast zoom_switching
      //   //////////////////////////////////
      //   /*
      //   1. Check whether zoom ratio is off
      //   2. adjust x.inst_zoom to fix ratio
      //   3. adjust x.total_zoom to fix ratio
      //   */

      //   // if (zoom_data.y.total_zoom/)

      // }



      zoom_data.x = zoom_rules_low_mat(zoom_restrict.x, zoom_data.x, viz_dim.mat.x, viz_component, 'x');
      zoom_data.y = zoom_rules_low_mat(zoom_restrict.y, zoom_data.y, viz_dim.mat.y, viz_component, 'y');

      if (still_interacting == false){
        still_interacting = true;
        setTimeout(function(){
          return still_interacting = false;
        }, 1000)
      }

    }
  });

};