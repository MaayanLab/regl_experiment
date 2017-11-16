module.exports = function zoom_rules_low_mat(zoom_info, zoom_info2, zoom_restrict){

  console.log(zoom_info.tsx, zoom_info2.ts)

  // X Zooming Rules
  var max_zoom = zoom_restrict.max_x/ zoom_restrict.ratio_y;
  var min_zoom = zoom_restrict.min_x;

  // calc potential_total_zoom, this is unsanitized
  // checking the potential_total_zoom prevents the real tsx from becoming out of
  // range
  potential_total_zoom = zoom_info.tsx * zoom_info2.ds;

  // zooming within allowed range
  if (potential_total_zoom < max_zoom && potential_total_zoom > min_zoom){
    zoom_info.tsx = zoom_info.tsx * zoom_info2.ds;
  }

  // causing problems with example cytof data
  ////////////////////////////////////////////

  // zoom above allowed range
  else if (potential_total_zoom >= max_zoom) {
    if (zoom_info.dsx < 1){
      zoom_info.tsx = zoom_info.tsx * zoom_info.dsx;
    } else {
      // bump zoom up to max
      zoom_info.dsx = max_zoom/zoom_info.tsx;
      // set zoom to max
      zoom_info.tsx = max_zoom;
    }
  }
  else if (potential_total_zoom <= min_zoom){
    if (zoom_info.dsx > 1){
      zoom_info.tsx = zoom_info.tsx * zoom_info.dsx;
    } else {
      zoom_info.dsx =  min_zoom/zoom_info.tsx;
      zoom_info.tsx = min_zoom;
    }
  }

  var zoom_eff = 1 - zoom_info.dsx;

  // restrict positive pan_by_drag if necessary
  if (zoom_info.pan_by_drag_x > 0){
    if (zoom_info2.total_pan + zoom_info.pan_by_drag_x >= 0){
      // push to edge
      zoom_info.pan_by_drag_x = - zoom_info2.total_pan;
    }
  }

  // restrict effective position of mouse
  if (zoom_info.x0 < viz_dim.mat.min_x){
    zoom_info.x0 = viz_dim.mat.min_x;
  } else if (zoom_info.x0 > viz_dim.mat.max_x){
    zoom_info.x0 = viz_dim.mat.max_x;
  }

  // tracking cursor offset (working)
  var cursor_offset = zoom_info.x0 - viz_dim.mat.min_x

  // negative cursor offsets are set to zero
  // (cannot zoom with cursor to left of matrix)
  if (cursor_offset < 0){
    cursor_offset = 0;
  } else if (cursor_offset > viz_dim.mat.max_x){
    cursor_offset = viz_dim.mat.max_x;
  }

  zoom_info.pan_by_zoom_x = zoom_eff * cursor_offset;

  potential_total_pan_x = zoom_info2.total_pan +
                 zoom_info.pan_by_drag_x / zoom_info.tsx  +
                 zoom_info.pan_by_zoom_x / zoom_info.tsx ;


  if (potential_total_pan_x <= 0.0001){

    zoom_info.zdx = zoom_eff * zoom_info.x0

    // track zoom displacement in original coordinate system
    zoom_info2.total_pan = zoom_info2.total_pan +
                   zoom_info.pan_by_drag_x / zoom_info.tsx  +
                   zoom_info.pan_by_zoom_x / zoom_info.tsx ;

  } else {

    /*
    keep matrix positined at the left, and bump it to the left
    */

    //////////////////////////////////////
    // pan-by-zoom restriction seems to be
    // working when zooming out with mouse
    // on matrix, not working when mouse is to the right of matrix
    // (zoom in, pan right, zoom out)
    //////////////////////////////////////

    // pan-by-zoom, and add back in total panning necesary to get to zero scaled by total zooming
    ////////////////////////////////////
    // redefine 'zoom_eff * viz_dim.mat.min_x' as total_pan_zoom
    ////////////////////////////////////
    zoom_info.zdx = zoom_eff * viz_dim.mat.min_x - zoom_info2.total_pan * zoom_info.tsx;
    zoom_info2.total_pan = 0

  }

  var all_info = {};
  all_info.zoom_info = zoom_info;
  all_info.zoom_info2 = zoom_info2;

  return all_info;

};