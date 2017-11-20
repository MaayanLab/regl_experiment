
module.exports = function zoom_rules_low_mat(zoom_restrict, zoom_data, viz_dim_mat, viz_component, axis){

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

  // restrict min pan_by_drag if necessary
  if (zoom_data.pan_by_drag > 0){
    if (zoom_data.total_pan_min + zoom_data.pan_by_drag >= 0){
      // push to edge
      zoom_data.pan_by_drag = - zoom_data.total_pan_min;
    }
  }

  // restrict max pan_by_drag if necessary
  if (zoom_data.pan_by_drag < 0){
    if (zoom_data.total_pan_max - zoom_data.pan_by_drag >= 0){
      // push to edge
      zoom_data.pan_by_drag = zoom_data.total_pan_max;
    }
  }

  // var tmp = (zoom_data.total_zoom  * viz_dim_mat.max  -  viz_dim_mat.max) / zoom_data.total_zoom;
  // console.log('\n')
  // console.log( 'tmp', tmp )
  // console.log( 'total pan', zoom_data.total_pan_min )
  // console.log(viz_dim_mat.max)
  // console.log('total zoom ', zoom_data.total_zoom)
  // console.log(viz_dim_mat.max)

  // restrict effective position of mouse
  if (zoom_data.cursor_position < viz_dim_mat.min){
    zoom_data.cursor_position = viz_dim_mat.min;
  } else if (zoom_data.cursor_position > viz_dim_mat.max){
    zoom_data.cursor_position = viz_dim_mat.max;
  }

  // tracking cursor position relative to the minimum
  var cursor_relative_min = zoom_data.cursor_position - viz_dim_mat.min;

  // restrict cursor_relative_min
  if (cursor_relative_min < 0){
    cursor_relative_min = 0;
  } else if (cursor_relative_min > viz_dim_mat.max){
    cursor_relative_min = viz_dim_mat.max;
  }

  // tracking cursor position relative to the maximum
  var cursor_relative_max = viz_dim_mat.max - zoom_data.cursor_position;

  // restrict cursor_relative_max
  if (cursor_relative_max < 0){
    cursor_relative_max = 0;
  } else if (cursor_relative_max > viz_dim_mat.max){
    cursor_relative_max = viz_dim_mat.max;
  }


  // pan by zoom relative to the axis
  var inst_eff_zoom = zoom_data.inst_zoom - 1;
  zoom_data.pbz_relative_min = - inst_eff_zoom * cursor_relative_min;
  zoom_data.pbz_relative_max = - inst_eff_zoom * cursor_relative_max;



  // calculate unsanitized versions of total pan values
  var potential_total_pan_min = zoom_data.total_pan_min +
                 zoom_data.pan_by_drag / zoom_data.total_zoom  +
                 zoom_data.pbz_relative_min / zoom_data.total_zoom ;


  // panning by drag has the opposite effect relative to the max/right side
  var potential_total_pan_max = zoom_data.total_pan_max +
                 - zoom_data.pan_by_drag / zoom_data.total_zoom  +
                 zoom_data.pbz_relative_max / zoom_data.total_zoom ;

  var zero_treshold = 0.0001;

  // Panning in bounds
  if (potential_total_pan_min <= zero_treshold ){

    zoom_data.pan_by_zoom = - inst_eff_zoom * zoom_data.cursor_position;

    if (axis=='x'){
      console.log(inst_eff_zoom)
      console.log(zoom_data.cursor_position)
      console.log(zoom_data.pan_by_zoom)
      console.log('\n')
    }

    zoom_data.total_pan_min = potential_total_pan_min;

  }

  if (potential_total_pan_min > zero_treshold ) {

    // push over by total_pan (negative value) times total zoom applied
    // need to push more when matrix has been effectively increased in size
    zoom_data.pan_by_zoom = - inst_eff_zoom * viz_dim_mat.min - zoom_data.total_pan_min * zoom_data.total_zoom;
    zoom_data.total_pan_min = 0;
    console.log('left restrict')

  }

   if (potential_total_pan_max > zero_treshold ) {
    console.log('right restrict', potential_total_pan_max)

  //   // push over by total_pan (negative value) times total zoom applied
  //   // need to push more when matrix has been effectively increased in size
  //   // zoom_data.pan_by_zoom = - inst_eff_zoom * viz_dim_mat.max + zoom_data.total_pan_max * zoom_data.total_zoom;
  //   zoom_data.pan_by_zoom = potential_total_pan_max;

  //   // debugger
  //   // zoom_data.total_pan_max = 0;
  //   console.log('right side')

  }




  zoom_data.total_pan_max = potential_total_pan_max;

  if (axis == 'x'){
    // console.log('total_pan_min', zoom_data.total_pan_min)
    // console.log('total_pan_max', zoom_data.total_pan_max)
    // console.log('potential_total_pan_max', potential_total_pan_max)
    // console.log('\n')
  }

};