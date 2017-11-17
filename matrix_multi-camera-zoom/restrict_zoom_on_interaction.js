var zoom_rules_low_mat = require('./zoom_rules_low_mat');

module.exports = function restrict_zoom_on_interaction(ev, zoom_info, viz_component){

  switch (ev.type) {
    case 'wheel':
      ev.dsx = ev.dsy = Math.exp(-ev.dy / 100);
      ev.dx = ev.dy = 0;
      break;
  }

  // transfer data from event to zoom_info
  zoom_info.dsx = ev.dsx;
  zoom_info.pan_by_drag_x = ev.dx;
  zoom_info.x0 = ev.x0;

  zoom_info.dsy = ev.dsy;
  zoom_info.pan_by_drag_y = ev.dy;
  zoom_info.y0 = ev.y0;

  // moved low level rules into zoom_rules_low
  zoom_info = zoom_rules_low_mat(zoom_info, zoom_restrict);

  if (still_interacting == false){
    still_interacting = true;
    setTimeout(function(){
      return still_interacting = false;
    }, 1000)
  }

  // component specific zooming
  if (viz_component == 'col-labels'){
    // do not allow zooming or panning along the y axis
    zoom_info.pan_by_drag_y = 0;
    zoom_info.dsy = 1.0;
    zoom_info.zdy = 0;
  }

  if (viz_component == 'row-labels'){
    // do not allow zooming or panning along the x axis
    zoom_info.pan_by_drag_x = 0;
    zoom_info.dsx = 1.0;
    zoom_info.zdx = 0;
  }

  // tmp disable y zooming
  ///////////////////////////
  zoom_info.pan_by_drag_y = 0;
  zoom_info.dsy = 1.0;
  zoom_info.zdy = 0;


};