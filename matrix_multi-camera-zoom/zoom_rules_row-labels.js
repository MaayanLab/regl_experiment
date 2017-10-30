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

  var max_zoom = 10.0;
  var min_zoom = 0.1;

  interactionEvents({
    element: element,
  })
  .on('interaction', function(ev, zoom_info){
    if (ev.buttons || interaction_types.indexOf(ev.type) !== -1)  {
      restrict_zooming(ev);
    }
  });

  function restrict_zooming(ev) {

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

    // X and Y zooming rules
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
      else if (zoom_info[inst_ts] <= min_zoom){
        if (zoom_info[inst_ds] > 1){
          zoom_info[inst_ts] = zoom_info[inst_ts] * ev[inst_ds];
        } else {
          zoom_info[inst_ds] = min_zoom/zoom_info[inst_ts];
          zoom_info[inst_ts] = min_zoom;
        }
      }

    });

    if (still_interacting == false){
      still_interacting = true;
      setTimeout(function(){
        return still_interacting = false;
      }, 1000)
    }

    // do not allow zooming or panning along the x axis
    zoom_info.dx = 0;
    zoom_info.dsx = 1.0;

  }


  return zoom_info;

};