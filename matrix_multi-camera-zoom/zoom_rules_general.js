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
  // zoom_info.tpx = 0;
  // zoom_info.tpy = 0;

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

    zoom_info.dsx = ev.dsx;
    zoom_info.dsy = ev.dsy;
    zoom_info.dx = ev.dx;
    zoom_info.dy = ev.dy;
    zoom_info.x0 = ev.x0;
    zoom_info.y0 = ev.y0;

    // console.log(zoom_info.y0)

    // // restrict x zooming
    // ///////////////////////
    // if (zoom_info.tsy < zoom_restrict.ratio_y){
    //   zoom_info.dsx = 1;
    // }

    // var in_range = false;
    // if (zoom_info.x0 < 650 && zoom_info.y0 < 1000){
    //   console.log('interacting in range')
    //   in_range = true;
    // }

    // restrict x panning
    if (zoom_info.tx > 0 && zoom_info.dx > 0){
      zoom_info.dx = 0;
    }

    // X and Y zooming rules
    _.each(['x', 'y'], function(inst_axis){

      var inst_ts = 'ts' + inst_axis;
      var inst_td = 't' + inst_axis;

      var inst_ds = 'ds' + inst_axis;
      var inst_dd = 'd' + inst_axis;

      var max_zoom = zoom_restrict['max_' + inst_axis];
      var min_zoom = zoom_restrict['min_' + inst_axis];


      // zooming within allowed range
      if (zoom_info[inst_ts] < max_zoom && zoom_info[inst_ts] > min_zoom){
        zoom_info[inst_ts] = zoom_info[inst_ts] * ev[inst_ds];
      }
      else if (zoom_info[inst_ts] >= max_zoom) {
        if (zoom_info[inst_ds] < 1){
          zoom_info[inst_ts] = zoom_info[inst_ts] * ev[inst_ds];
        } else {
          zoom_info[inst_ds] = max_zoom/zoom_info[inst_ts];
          zoom_info[inst_ts] = max_zoom;
        }
      }
      else if (zoom_info[inst_ts] <= min_zoom){
        if (zoom_info[inst_ds] > 1){
          zoom_info[inst_ts] = zoom_info[inst_ts] * ev[inst_ds];
        } else {
          zoom_info[inst_ds] = min_zoom/zoom_info[inst_ts];
          zoom_info[inst_ts] = min_zoom;
        }
      }


      // var zoom_pan = (1 - zoom_info[inst_ds]) * (zoom_info[inst_axis+'0'] - viz_dim.mat['min_'+inst_axis])

      // make running total sum of zoom_pan
      var zoom_pan = 0;

      // // divide panning by zoom
      // zoom_info[inst_dd] = zoom_info[inst_dd]/zoom_info[inst_ts];

      // restrict drag_pan
      if (zoom_info[inst_td] + zoom_info[inst_dd] > 0){
        // zoom_info[inst_dd] = 0;
        zoom_info[inst_dd] = 0;
      }

      // panning
      zoom_info[inst_td] = zoom_info[inst_td] + zoom_info[inst_dd] + zoom_pan;

      if (inst_axis == 'x'){
        console.log('x: ' + String(zoom_info[inst_td]))
        // console.log('zoom_pan: ' + String(zoom_pan))
      }


      // restrict effective position of mouse
      if (zoom_info[inst_axis+'0'] < viz_dim.mat['min_'+inst_axis]){
        zoom_info[inst_axis+'0'] = viz_dim.mat['min_'+inst_axis];
      } else if (zoom_info[inst_axis+'0'] > viz_dim.mat['max_'+inst_axis]){
        zoom_info[inst_axis+'0'] = viz_dim.mat['max_'+inst_axis];
      }

      // calc x pan room

    });

    if (still_interacting == false){
      still_interacting = true;
      setTimeout(function(){
        return still_interacting = false;
      }, 1000)
    }

    // component specific zooming
    if (viz_component == 'col-labels'){
      // do not allow zooming or panning along the y axis
      zoom_info.dy = 0;
      zoom_info.dsy = 1.0;
    } else if (viz_component == 'row-labels'){
      // do not allow zooming or panning along the x axis
      zoom_info.dx = 0;
      zoom_info.dsx = 1.0;
    }



  }

  return zoom_info;

};