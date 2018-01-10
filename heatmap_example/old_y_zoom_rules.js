///////////////////////////////////////////////////////////////////////////
    // Y Zooming Rules
    ///////////////////////////////////////////////////////////////////////////

    // var max_zoom = zoom_restrict.max_x;
    // var min_zoom = zoom_restrict.min_x;

    // // calc potential_tsy, this is unsanitized
    // // checking the potential_tsy prevents the real tsy from becoming out of
    // // range
    // potential_tsy = zoom_info.tsy * zoom_info.dsy;

    // // zooming within allowed range
    // if (potential_tsy < max_zoom && potential_tsy > min_zoom){
    //   zoom_info.tsy = zoom_info.tsy * zoom_info.dsy;
    // }

    // // zoom above allowed range
    // else if (potential_tsy >= max_zoom) {

    //   if (zoom_info.dsy < 1){
    //     zoom_info.tsy = zoom_info.tsy * zoom_info.dsy;
    //   } else {
    //     // bump zoom up to max
    //     zoom_info.dsy = max_zoom/zoom_info.tsy;
    //     // set zoom to max
    //     zoom_info.tsy = max_zoom;
    //   }
    // }
    // else if (potential_tsy <= min_zoom){
    //   if (zoom_info.dsy > 1){
    //     zoom_info.tsy = zoom_info.tsy * zoom_info.dsy;
    //   } else {
    //     zoom_info.dsy =  min_zoom/zoom_info.tsy;
    //     zoom_info.tsy = min_zoom;
    //   }
    // }

    // var zoom_eff = 1 - zoom_info.dsy;

    // // tracking cursor offset (working)
    // var cursor_offset = zoom_info.y0 - viz_dim.mat.min_y

    // // negative cursor offsets are set to zero
    // // (cannot zoom with cursor to left of matrix)
    // if (cursor_offset < 0){
    //   cursor_offset = 0;
    // }

    // zoom_info.pan_by_zoom_y = zoom_eff * cursor_offset;

    // // restrict pan_by_drag
    // if (zoom_info.total_pan_y + zoom_info.pan_by_drag_y >= 0){
    //   zoom_info.pan_by_drag_y = 0;
    // }

    // // restrict effective position of mouse
    // if (zoom_info.y0 < viz_dim.mat.min_y){
    //   zoom_info.y0 = viz_dim.mat.min_y;
    // } else if (zoom_info.y0 > viz_dim.mat.max_y){
    //   zoom_info.y0 = viz_dim.mat.max_y;
    // }

    // potential_total_pan_y = zoom_info.total_pan_y +
    //                zoom_info.pan_by_drag_y / zoom_info.tsy  +
    //                zoom_info.pan_by_zoom_y / zoom_info.tsy ;

    // if (potential_total_pan_y <= 0){
    //   zoom_info.zdy = zoom_eff * zoom_info.y0

    //   // track zoom displacement in original coordinate system
    //   zoom_info.total_pan_y = zoom_info.total_pan_y +
    //                  zoom_info.pan_by_drag_y / zoom_info.tsy  +
    //                  zoom_info.pan_by_zoom_y / zoom_info.tsy ;
    // } else {

    //   /*
    //   keep matrix positined at the left, and bump it to the left
    //   */
    //   zoom_info.zdy = zoom_eff * viz_dim.mat.min_y - zoom_info.total_pan_y
    //   zoom_info.total_pan_y = 0
    // }

    // ///////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////