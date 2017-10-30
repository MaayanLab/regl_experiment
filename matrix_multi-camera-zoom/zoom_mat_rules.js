var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');

module.exports = function(regl){

  var opts = opts || {};
  var options = extend({
      element: opts.element || regl._gl.canvas,
    }, opts || {});

  var element = options.element;

  var zoom_info = {};
  zoom_info.tsx = 1;
  zoom_info.tsy = 1;
  zoom_info.x0 = 0;
  zoom_info.y0 = 0;

  var max_zoom = 5;
  var min_zoom = 0.5;

  interactionEvents({
    element: element,
  }).on('interaction', function (ev) {

    if (ev.buttons || interaction_types.indexOf(ev.type) !== -1)  {

      switch (ev.type) {
        case 'wheel':
          ev.dsx = ev.dsy = Math.exp(-ev.dy / 100);
          ev.dx = ev.dy = 0;
          break;
      }

      zoom_info.dsx = ev.dsx;
      zoom_info.dsy = ev.dsy;
      zoom_info.dx = ev.dx;
      zoom_info.dy = ev.dy;
      zoom_info.x0 = ev.x0;
      zoom_info.y0 = ev.y0;

      // // X zooming rules
      // //////////////////////
      // // zooming within allowed range
      // if (zoom_info.tsx < max_zoom && zoom_info.tsx > min_zoom){
      //   zoom_info.tsx = zoom_info.tsx * ev.dsx;
      // }
      // // above max zoom (can only go down)
      // else if (zoom_info.tsx >= max_zoom) {
      //   if (zoom_info.dsx < 1){
      //     zoom_info.tsx = zoom_info.tsx * ev.dsx;
      //   }
      // }
      // // below min zoom (can only go up)
      // else if (zoom_info.tsx <= min_zoom){
      //   if (zoom_info.dsx > 1){
      //     zoom_info.tsx = zoom_info.tsx * ev.dsx;
      //   }
      // }

      // Y zooming rules
      ////////////////////////////
      // var inst_axis = 'y'

      _.each(['x', 'y'], function(inst_axis){

        var inst_ts = 'ts' + inst_axis;
        var inst_ds = 'ds' + inst_axis;

        // zooming within allowed range
        if (zoom_info[inst_ts] < max_zoom && zoom_info[inst_ts] > min_zoom){
          zoom_info[inst_ts] = zoom_info[inst_ts] * ev[inst_ds];
        }
        else if (zoom_info[inst_ts] >= max_zoom) {

          if (zoom_info[inst_ds] < 1){
            zoom_info[inst_ts] = zoom_info[inst_ts] * ev[inst_ds];
          } else {
            zoom_info[inst_ds] = max_zoom/zoom_info[inst_ts];
            zoom_info[inst_ts] = max_zoom;

          }
        }
        // below min zoom (can only go up)
        else if (zoom_info[inst_ts] <= min_zoom){

          if (zoom_info[inst_ds] > 1){
            zoom_info[inst_ts] = zoom_info[inst_ts] * ev[inst_ds];
          } else {
            zoom_info[inst_ds] = min_zoom/zoom_info[inst_ts];
            zoom_info[inst_ts] = min_zoom;
          }
        }

      });

      // interaction rules
      /////////////////////
      if (still_interacting == false){
        still_interacting = true;
        setTimeout(function(){
          return still_interacting = false;
        }, 1000)
      }

    }
  })

  return zoom_info;

};