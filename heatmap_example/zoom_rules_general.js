var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');

module.exports = function(regl, zoom_restrict, viz_component){

  var opts = opts || {};
  var options = extend({
      element: opts.element || regl._gl.canvas,
    }, opts || {});

  var element = options.element;

  var viz_dim = {};
  viz_dim.canvas = {};
  viz_dim.mat = {};

  _.each(['width', 'height'], function(inst_dim){
    viz_dim.canvas[inst_dim] = Number.parseFloat(d3.select(element)
      .style(inst_dim).replace('px', ''));
  });

  // square matrix size set by width of canvas
  viz_dim.mat.width = viz_dim.canvas.width/2;
  viz_dim.mat.height = viz_dim.canvas.width/2;

  // min and max position of matrix
  viz_dim.mat.min_x = viz_dim.canvas.width/2 - viz_dim.mat.width/2;
  viz_dim.mat.max_x = viz_dim.canvas.width/2 + viz_dim.mat.width/2;

  viz_dim.mat.min_y = viz_dim.canvas.height/2 - viz_dim.mat.height/2;
  viz_dim.mat.max_y = viz_dim.canvas.height/2 + viz_dim.mat.height/2;

  var zoom_info = {};
  zoom_info.tsx = 1;
  zoom_info.tsy = 1;
  zoom_info.x0 = 0;
  zoom_info.y0 = 0;
  zoom_info.total_pan_x = 0;
  zoom_info.total_pan_y = 0;
  zoom_info.ty = 0;
  zoom_info.zdx = 0;
  zoom_info.zdy = 0;

  var interaction_types = ['wheel', 'touch', 'pinch'];

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

    // transfer data from event to zoom_info
    zoom_info.dsx = ev.dsx;
    zoom_info.pan_by_drag_x = ev.dx;
    zoom_info.x0 = ev.x0;

    zoom_info.dsy = ev.dsy;
    zoom_info.pan_by_drag_y = ev.dy;
    zoom_info.y0 = ev.y0;

    // two-stage zooming
    ///////////////////////
    if (zoom_info.tsy < zoom_restrict.ratio_y){
      zoom_info.dsx = 1;
    }

    // console.log( 'tsx',zoom_info.tsx)
    // console.log( 'tsy',zoom_info.tsy)


    ///////////////////////////////////////////////////////////////////////////
    // X Zooming Rules
    ///////////////////////////////////////////////////////////////////////////

    var max_zoom = zoom_restrict.max_x/ zoom_restrict.ratio_y;
    var min_zoom = zoom_restrict.min_x;

    // calc potential_tsx, this is unsanitized
    // checking the potential_tsx prevents the real tsx from becoming out of
    // range
    potential_tsx = zoom_info.tsx * zoom_info.dsx;


    // zooming within allowed range
    if (potential_tsx < max_zoom && potential_tsx > min_zoom){
      zoom_info.tsx = zoom_info.tsx * zoom_info.dsx;
    }

    // causing problems with example cytof data
    ////////////////////////////////////////////

    // zoom above allowed range
    else if (potential_tsx >= max_zoom) {
      if (zoom_info.dsx < 1){
        zoom_info.tsx = zoom_info.tsx * zoom_info.dsx;
      } else {
        // bump zoom up to max
        zoom_info.dsx = max_zoom/zoom_info.tsx;
        // set zoom to max
        zoom_info.tsx = max_zoom;
      }
    }
    else if (potential_tsx <= min_zoom){
      if (zoom_info.dsx > 1){
        zoom_info.tsx = zoom_info.tsx * zoom_info.dsx;
      } else {
        zoom_info.dsx =  min_zoom/zoom_info.tsx;
        zoom_info.tsx = min_zoom;
      }
    }

    var zoom_eff = 1 - zoom_info.dsx;

    // tracking cursor offset (working)
    var cursor_offset = zoom_info.x0 - viz_dim.mat.min_x

    // negative cursor offsets are set to zero
    // (cannot zoom with cursor to left of matrix)
    if (cursor_offset < 0){
      cursor_offset = 0;
    }

    zoom_info.pan_by_zoom_x = zoom_eff * cursor_offset;

    // restrict pan_by_drag
    if (zoom_info.total_pan_x + zoom_info.pan_by_drag_x >= 0){
      zoom_info.pan_by_drag_x = 0;
    }

    // restrict effective position of mouse
    if (zoom_info.x0 < viz_dim.mat.min_x){
      zoom_info.x0 = viz_dim.mat.min_x;
    } else if (zoom_info.x0 > viz_dim.mat.max_x){
      zoom_info.x0 = viz_dim.mat.max_x;
    }

    potential_total_pan_x = zoom_info.total_pan_x +
                   zoom_info.pan_by_drag_x / zoom_info.tsx  +
                   zoom_info.pan_by_zoom_x / zoom_info.tsx ;

    if (potential_total_pan_x <= 0){
      zoom_info.zdx = zoom_eff * zoom_info.x0

      // track zoom displacement in original coordinate system
      zoom_info.total_pan_x = zoom_info.total_pan_x +
                     zoom_info.pan_by_drag_x / zoom_info.tsx  +
                     zoom_info.pan_by_zoom_x / zoom_info.tsx ;
    } else {

      /*
      keep matrix positined at the left, and bump it to the left
      */
      zoom_info.zdx = zoom_eff * viz_dim.mat.min_x - zoom_info.total_pan_x
      zoom_info.total_pan_x = 0
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // Y Zooming Rules
    ///////////////////////////////////////////////////////////////////////////

    var max_zoom = zoom_restrict.max_x;
    var min_zoom = zoom_restrict.min_x;

    // calc potential_tsy, this is unsanitized
    // checking the potential_tsy prevents the real tsy from becoming out of
    // range
    potential_tsy = zoom_info.tsy * zoom_info.dsy;

    // zooming within allowed range
    if (potential_tsy < max_zoom && potential_tsy > min_zoom){
      zoom_info.tsy = zoom_info.tsy * zoom_info.dsy;
    }

    // zoom above allowed range
    else if (potential_tsy >= max_zoom) {

      if (zoom_info.dsy < 1){
        zoom_info.tsy = zoom_info.tsy * zoom_info.dsy;
      } else {
        // bump zoom up to max
        zoom_info.dsy = max_zoom/zoom_info.tsy;
        // set zoom to max
        zoom_info.tsy = max_zoom;
      }
    }
    else if (potential_tsy <= min_zoom){
      if (zoom_info.dsy > 1){
        zoom_info.tsy = zoom_info.tsy * zoom_info.dsy;
      } else {
        zoom_info.dsy =  min_zoom/zoom_info.tsy;
        zoom_info.tsy = min_zoom;
      }
    }

    var zoom_eff = 1 - zoom_info.dsy;

    // tracking cursor offset (working)
    var cursor_offset = zoom_info.y0 - viz_dim.mat.min_y

    // negative cursor offsets are set to zero
    // (cannot zoom with cursor to left of matrix)
    if (cursor_offset < 0){
      cursor_offset = 0;
    }

    zoom_info.pan_by_zoom_y = zoom_eff * cursor_offset;

    // restrict pan_by_drag
    if (zoom_info.total_pan_y + zoom_info.pan_by_drag_y >= 0){
      zoom_info.pan_by_drag_y = 0;
    }

    // restrict effective position of mouse
    if (zoom_info.y0 < viz_dim.mat.min_y){
      zoom_info.y0 = viz_dim.mat.min_y;
    } else if (zoom_info.y0 > viz_dim.mat.max_y){
      zoom_info.y0 = viz_dim.mat.max_y;
    }

    potential_total_pan_y = zoom_info.total_pan_y +
                   zoom_info.pan_by_drag_y / zoom_info.tsy  +
                   zoom_info.pan_by_zoom_y / zoom_info.tsy ;

    if (potential_total_pan_y <= 0){
      zoom_info.zdy = zoom_eff * zoom_info.y0

      // track zoom displacement in original coordinate system
      zoom_info.total_pan_y = zoom_info.total_pan_y +
                     zoom_info.pan_by_drag_y / zoom_info.tsy  +
                     zoom_info.pan_by_zoom_y / zoom_info.tsy ;
    } else {

      /*
      keep matrix positined at the left, and bump it to the left
      */
      zoom_info.zdy = zoom_eff * viz_dim.mat.min_y - zoom_info.total_pan_y
      zoom_info.total_pan_y = 0
    }

    // ///////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////


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


  }

  return zoom_info;

};