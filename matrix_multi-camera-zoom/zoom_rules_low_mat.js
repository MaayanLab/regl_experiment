
module.exports = function zoom_rules_low_mat(zoom_restrict, zoom_data, viz_dim_mat, viz_component){

  /////////////////////////
  // Zooming Rules
  /////////////////////////

  var max_zoom = zoom_restrict.max;
  var min_zoom = zoom_restrict.min;

  // calc unsanitized potential_total_zoom
  // checking this prevents the real total_zoom from going out of bounds
  var potential_total_zoom = zoom_data.total_zoom * zoom_data.inst_zoom;

  // zooming within allowed range
  if (potential_total_zoom < max_zoom && potential_total_zoom > min_zoom){
    zoom_data.total_zoom = potential_total_zoom;
  }

  // Zoom above max
  else if (potential_total_zoom >= max_zoom) {
    if (zoom_data.inst_zoom < 1){
      zoom_data.total_zoom = zoom_data.total_zoom * zoom_data.inst_zoom;
    } else {
      // bump zoom up to max
      zoom_data.inst_zoom = max_zoom/zoom_data.total_zoom;
      // set zoom to max
      zoom_data.total_zoom = max_zoom;
    }
  }
  // Zoom below min
  else if (potential_total_zoom <= min_zoom){
    if (zoom_data.inst_zoom > 1){
      zoom_data.total_zoom = zoom_data.total_zoom * zoom_data.inst_zoom;
    } else {
      // bump zoom up to max
      zoom_data.inst_zoom =  min_zoom/zoom_data.total_zoom;
      // set zoom to max
      zoom_data.total_zoom = min_zoom;
    }
  }

  //////////////////////////////////
  // Pan Rules
  //////////////////////////////////

  // restrict positive pan_by_drag if necessary
  if (zoom_data.pan_by_drag > 0){
    if (zoom_data.total_pan + zoom_data.pan_by_drag >= 0){
      // push to edge
      zoom_data.pan_by_drag = - zoom_data.total_pan;
    }
  }

  // restrict effective position of mouse
  if (zoom_data.cursor_position < viz_dim_mat.min){
    zoom_data.cursor_position = viz_dim_mat.min;
  } else if (zoom_data.cursor_position > viz_dim_mat.max){
    zoom_data.cursor_position = viz_dim_mat.max;
  }

  // tracking cursor offset (working)
  var cursor_relative_axis = zoom_data.cursor_position - viz_dim_mat.min;

  // restrict cursor_relative_axis
  if (cursor_relative_axis < 0){
    cursor_relative_axis = 0;
  } else if (cursor_relative_axis > viz_dim_mat.max){
    cursor_relative_axis = viz_dim_mat.max;
  }

  // pan by zoom relative to the axis
  var zoom_eff = 1 - zoom_data.inst_zoom;
  zoom_data.pbz_relative_axis = zoom_eff * cursor_relative_axis;

  var potential_total_pan = zoom_data.total_pan +
                 zoom_data.pan_by_drag / zoom_data.total_zoom  +
                 zoom_data.pbz_relative_axis / zoom_data.total_zoom ;


  // Panning in bounds
  if (potential_total_pan <= 0.0001){

    zoom_data.pan_by_zoom = zoom_eff * zoom_data.cursor_position;
    zoom_data.total_pan = potential_total_pan;

  } else {


    // push over by total_pan (negative value) times total zoom applied
    // since need to push more when matrix has been effectively increased in
    // size
    var push_matrix = zoom_data.total_pan * zoom_data.total_zoom;

    zoom_data.pan_by_zoom = zoom_eff * viz_dim_mat.min - push_matrix;
    zoom_data.total_pan = 0

  }

};