module.exports = function zoom_rules_low_mat(zoom_info, zoom_restrict){

  // X Zooming Rules
  var max_zoom = zoom_restrict.max_x/ zoom_restrict.ratio_y;
  var min_zoom = zoom_restrict.min_x;

  // calc unsanitized potential_total_zoom
  // checking this prevents the real total_zoom from going out of bounds
  potential_total_zoom = zoom_info.total_zoom * zoom_info.inst_zoom;

  // zooming within allowed range
  if (potential_total_zoom < max_zoom && potential_total_zoom > min_zoom){
    zoom_info.total_zoom = potential_total_zoom;
  }

  // causing problems with example cytof data
  ////////////////////////////////////////////

  // zoom above allowed range
  else if (potential_total_zoom >= max_zoom) {
    if (zoom_info.inst_zoom < 1){
      zoom_info.total_zoom = zoom_info.total_zoom * zoom_info.inst_zoom;
    } else {
      // bump zoom up to max
      zoom_info.inst_zoom = max_zoom/zoom_info.total_zoom;
      // set zoom to max
      zoom_info.total_zoom = max_zoom;
    }
  }
  else if (potential_total_zoom <= min_zoom){
    if (zoom_info.inst_zoom > 1){
      zoom_info.total_zoom = zoom_info.total_zoom * zoom_info.inst_zoom;
    } else {
      zoom_info.inst_zoom =  min_zoom/zoom_info.total_zoom;
      zoom_info.total_zoom = min_zoom;
    }
  }

  var zoom_eff = 1 - zoom_info.inst_zoom;

  // restrict positive pan_by_drag if necessary
  if (zoom_info.pan_by_drag > 0){
    if (zoom_info.total_pan + zoom_info.pan_by_drag >= 0){
      // push to edge
      zoom_info.pan_by_drag = - zoom_info.total_pan;
    }
  }

  // restrict effective position of mouse
  if (zoom_info.cursor_position < viz_dim.mat.min_x){
    zoom_info.cursor_position = viz_dim.mat.min_x;
  } else if (zoom_info.cursor_position > viz_dim.mat.max_x){
    zoom_info.cursor_position = viz_dim.mat.max_x;
  }

  // tracking cursor offset (working)
  var cursor_relative_axis = zoom_info.cursor_position - viz_dim.mat.min_x;

  // negative cursor offsets are set to zero
  // (cannot zoom with cursor to left of matrix)
  if (cursor_relative_axis < 0){
    cursor_relative_axis = 0;
  } else if (cursor_relative_axis > viz_dim.mat.max_x){
    cursor_relative_axis = viz_dim.mat.max_x;
  }

  // pan by zoom relative to the axis
  zoom_info.pbz_relative_axis = zoom_eff * cursor_relative_axis;

  var potential_total_pan = zoom_info.total_pan +
                 zoom_info.pan_by_drag / zoom_info.total_zoom  +
                 zoom_info.pbz_relative_axis / zoom_info.total_zoom ;


  if (potential_total_pan <= 0.0001){

    zoom_info.pan_by_zoom = zoom_eff * zoom_info.cursor_position;

    zoom_info.total_pan = potential_total_pan;

  } else {

    /*
    reposition total_pan to the left, and use the camera to bump it over
    */

    //////////////////////////////////////
    // pan-by-zoom restriction seems to be
    // working when zooming out with mouse
    // (zoom in, pan right, zoom out)
    //////////////////////////////////////

    // push over by total pan (negative position) times total zoom applied
    // (since need to push more when matrix has been effectively increased in
    // size)
    var push_by_total_pan = zoom_info.total_pan * zoom_info.total_zoom;

    zoom_info.pan_by_zoom = zoom_eff * viz_dim.mat.min_x - push_by_total_pan;
    zoom_info.total_pan = 0

  }

  // console.log(zoom_info.total_pan)

  return zoom_info;

};