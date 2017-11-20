var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');
var zoom_rules_low_mat = require('./zoom_rules_low_mat');

module.exports = function zoom_rules_high_mat(regl, zoom_restrict, zoom_data, viz_component, viz_dim){

  var opts = opts || {};
  var options = extend({
      element: opts.element || regl._gl.canvas,
    }, opts || {});

  var element = options.element;

  global_translate = 0
  lock_left = false

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
      zoom_data.x.inst_zoom = ev.dsx;
      zoom_data.x.pan_by_drag = ev.dx;
      zoom_data.x.cursor_position = ev.x0;

      zoom_rules_low_mat(ev, zoom_restrict.x, zoom_data.x, viz_component, viz_dim.mat.x);

      // tmp disable y zooming
      ///////////////////////////
      zoom_data.x.pan_by_drag_y = 0;
      zoom_data.x.dsy = 1.0;
      zoom_data.x.zdy = 0;

      if (still_interacting == false){
        still_interacting = true;
        setTimeout(function(){
          return still_interacting = false;
        }, 1000)
      }

    }
  });

};