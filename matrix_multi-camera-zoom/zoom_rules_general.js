var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');

module.exports = function(regl, zoom_restrict, viz_component){

  var opts = opts || {};
  var options = extend({
      element: opts.element || regl._gl.canvas,
    }, opts || {});

  var element = options.element;

  viz_dim = {};
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

  console.log(viz_dim.mat.left_x)

  console.log('canvas width: ' + String(viz_dim.canvas.width))
  console.log('canvas height: ' + String(viz_dim.canvas.height))

  global_translate = 0
  lock_left = false

  var zoom_info = {};
  zoom_info.tsx = 1;
  zoom_info.tsy = 1;
  zoom_info.x0 = 0;
  zoom_info.y0 = 0;
  zoom_info.tx = 0;
  zoom_info.ty = 0;
  zoom_info.zdx = 0;

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
    zoom_info.pan_by_drag = ev.dx;
    zoom_info.x0 = ev.x0;

    zoom_info.dsy = ev.dsy;
    zoom_info.dy = ev.dy;
    zoom_info.y0 = ev.y0;

    // // two-stage zooming
    // ///////////////////////
    // if (zoom_info.tsy < zoom_restrict.ratio_y){
    //   zoom_info.dsx = 1;
    // }

    ///////////////////////////////////////////////////////////////////////////
    // X Zooming Rules
    ///////////////////////////////////////////////////////////////////////////

    var max_zoom = zoom_restrict.max_x;
    var min_zoom = zoom_restrict.min_x;

    // zooming within allowed range
    if (zoom_info.tsx < max_zoom && zoom_info.tsx > min_zoom){
      zoom_info.tsx = zoom_info.tsx * ev.dsx;
    }
    else if (zoom_info.tsx >= max_zoom) {
      if (zoom_info.dsx < 1){
        zoom_info.tsx = zoom_info.tsx * ev.dsx;
      } else {
        // bump zoom up to max
        zoom_info.dsx = max_zoom/zoom_info.tsx;
        // set zoom to max
        zoom_info.tsx = max_zoom;
      }
    }
    else if (zoom_info.tsx <= min_zoom){
      if (zoom_info.dsx > 1){
        zoom_info.tsx = zoom_info.tsx * ev.dsx;
      } else {
        zoom_info.dsx = min_zoom/zoom_info.tsx;
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

    zoom_info.pan_by_zoom = zoom_eff * cursor_offset;

    // restrict pan_by_drag
    if (zoom_info.tx + zoom_info.pan_by_drag >= 0){
      zoom_info.pan_by_drag = 0;
    }

    // restrict effective position of mouse
    if (zoom_info.x0 < viz_dim.mat.min_x){
      zoom_info.x0 = viz_dim.mat.min_x;
    } else if (zoom_info.x0 > viz_dim.mat.max_x){
      zoom_info.x0 = viz_dim.mat.max_x;
    }


    // zoom from real cursor position
    // if (zoom_info.tx + zoom_eff * zoom_info.x0 < 0){

    var tx_only = zoom_info.tx
    var tx_and_pan_by_drag = zoom_info.tx + zoom_info.pan_by_drag * zoom_info.tsx;
    var tx_and_zdx = zoom_info.tx + zoom_eff * zoom_info.x0 /10

    if (tx_only  <= 0){
      console.log('not locked')
      console.log(zoom_eff)
      zoom_info.zdx = zoom_eff * zoom_info.x0

      // track zoom displacement in original coordinate system
      zoom_info.tx = zoom_info.tx +
                     zoom_info.pan_by_drag / zoom_info.tsx  +

                     // pan and zoom work well when dividing by total zoom
                     // 1. zoom in and out works well
                     // 2. zoom and pan works well
                     zoom_info.pan_by_zoom / zoom_info.tsx ;

                     // // pan and zoom work well when dividing by total zoom
                     // zoom_info.pan_by_zoom * zoom_info.dsx

                     // // zoom in and out works well with this
                     // zoom_info.pan_by_zoom ;

    } else {
      console.log('Locked')
      debugger

      // // simple solution
      // ////////////////////////////
      // zoom_info.zdx = 0

      // zoom_info.tx = 0
      // console.log(zoom_info.zdx)


      // zoom_info.zdx = zoom_eff * viz_dim.mat.min_x

      // zoom_info.zdx = -zoom_info.tx

      // zoom_info.pan_by_zoom = 0
    }



    // // sanitize zoom displacement
    // if (zoom_info.tx + zoom_info.zdx < 0){

    // } else {

    //   // console.log('before correction')
    //   // debugger

    //   // might use
    //   //////////////////
    //   // // zoom from cursor position on the left
    //   // zoom_info.zdx = zoom_eff * (viz_dim.mat.min_x)
    //   // // zoom_info.pan_by_zoom = 0
    //   // // zoom_info.tx = 0

    //   // // bump matrix to zero
    //   // if (zoom_info.tx < 0){
    //   //   zoom_info.zdx = - zoom_info.tx;
    //   // } else {
    //   //   zoom_info.zdx = 0;
    //   // }

    //   // zoom_info.zdx = 0;

    //   // zoom_info.tx = 0
    //   // zoom_info.pan_by_zoom = 0

    //   // console.log('after correction')
    //   // debugger

    // }





    // console.log(zoom_info.dsx)

    global_translate = global_translate + zoom_info.pan_by_zoom / zoom_info.tsx;

    // // console.log('cursor offset: ' + String(cursor_offset))
    // console.log('tsx: ' + String(zoom_info.tsx))
    // // console.log('dsx: ' + String(zoom_info.dsx))
    // // console.log('zoom_eff: ' + String(zoom_eff))
    // console.log('pan_by_drag: ' + String(zoom_info.pan_by_drag))
    // console.log('pan_by_zoom: ' + String(zoom_info.pan_by_zoom))
    // console.log('GT: ' + String(global_translate))
    // console.log('zdx: ' + String(zoom_info.zdx))
    // console.log('tx: ' + String(zoom_info.tx))

    // console.log('\n\n\n')

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    if (still_interacting == false){
      still_interacting = true;
      setTimeout(function(){
        return still_interacting = false;
      }, 1000)
    }

    // // component specific zooming
    // if (viz_component == 'col-labels'){
    //   // do not allow zooming or panning along the y axis
    //   zoom_info.dy = 0;
    //   zoom_info.dsy = 1.0;
    // }

    if (viz_component == 'row-labels'){
      // do not allow zooming or panning along the x axis
      zoom_info.pan_by_drag = 0;
      zoom_info.dsx = 1.0;
      zoom_info.zdx = 0;
    }



  }

  return zoom_info;

};