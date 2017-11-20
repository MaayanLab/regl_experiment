var zoom_rules_low_mat = require('./zoom_rules_low_mat');

module.exports = function restrict_zoom_on_interaction(ev, zoom_restrict, zoom_data, viz_component, viz_dim){

  switch (ev.type) {
    case 'wheel':
      ev.dsx = ev.dsy = Math.exp(-ev.dy / 100);
      ev.dx = ev.dy = 0;
      break;
  }

  // transfer data from event to zoom_data
  zoom_data.inst_zoom = ev.dsx;
  zoom_data.pan_by_drag = ev.dx;
  zoom_data.cursor_position = ev.x0;

  // moved low level rules into zoom_rules_low
  zoom_data = zoom_rules_low_mat(zoom_data, zoom_restrict, viz_dim);

  if (still_interacting == false){
    still_interacting = true;
    setTimeout(function(){
      return still_interacting = false;
    }, 1000)
  }

  // tmp disable y zooming
  ///////////////////////////
  zoom_data.pan_by_drag_y = 0;
  zoom_data.dsy = 1.0;
  zoom_data.zdy = 0;

};