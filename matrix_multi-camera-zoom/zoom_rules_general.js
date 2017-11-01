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


  var zoom_info = {};
  zoom_info.tsx = 1;
  zoom_info.tsy = 1;
  zoom_info.x0 = 0;
  zoom_info.y0 = 0;
  zoom_info.tx = 0;
  zoom_info.ty = 0;

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

    ///////////////////////////////////////////////////////////////////////////////////
    // X Zooming Rules
    ///////////////////////////////////////////////////////////////////////////////////

    var max_zoom = zoom_restrict['max_x'];
    var min_zoom = zoom_restrict['min_x'];

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
    var cursor_offset = zoom_info['x0'] - viz_dim.mat['min_x']

    // negative cursor offsets are set to zero (cannot zoom with cursor to
    // left of matrix)
    if (cursor_offset < 0){
      cursor_offset = 0;
    }

    var pan_by_zoom = zoom_eff * cursor_offset;

    // restrict pan_by_drag
    if (zoom_info.tx + zoom_info.pan_by_drag >= 0){
      zoom_info.pan_by_drag = -zoom_info.tx;
    }

    // restrict effective position of mouse
    if (zoom_info['x0'] < viz_dim.mat['min_x']){
      zoom_info['x0'] = viz_dim.mat['min_x'];
    } else if (zoom_info['x0'] > viz_dim.mat['max_x']){
      zoom_info['x0'] = viz_dim.mat['max_x'];
    }

    // save zdx and zdy values for zoom-panning values
    zoom_info.zdx = (1 - zoom_info.dsx) * zoom_info['x0']

    // // sanitize zoom displacement
    // if (zoom_info.tx + zoom_info.zdx >= 0){

    //   // set zdx equal to the negative value of the current tx so that they will cancel out
    //   zoom_info.zdx = -zoom_info.tx;
    //   // set total displacement to zero
    //   zoom_info.tx = 0;

    // }

    // update tsx
    zoom_info.tx = zoom_info.tx + (zoom_info.pan_by_drag + pan_by_zoom) / zoom_info.tsx;

    console.log('tx: ' + String(zoom_info.tx))

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

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