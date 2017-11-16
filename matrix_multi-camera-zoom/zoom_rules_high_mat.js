var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');
var zoom_rules_low_mat = require('./zoom_rules_low_mat');

module.exports = function zoom_rules_mat(regl, zoom_restrict, viz_component){

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

  // console.log(viz_dim.mat.left_x)
  // console.log('canvas width: ' + String(viz_dim.canvas.width))
  // console.log('canvas height: ' + String(viz_dim.canvas.height))

  global_translate = 0
  lock_left = false

  // organize zoom rules into x and y components
  var zoom_info = {};
  _.each(['x', 'y'], function(inst_dim){
    info = {};
    // total zooming
    info.ts = 1;
    // position of cursor
    info.pos = 0;
    // total panning
    info.total_pan = 0;
    // zd (zoom pan?)
    info.zd = 0;
    // add to zoom_info;
    zoom_info[inst_dim] = info;
  })

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
  .on('interaction', function(ev){
    if (ev.buttons || interaction_types.indexOf(ev.type) !== -1)  {
      restrict_zooming(ev, zoom_info);
    }
  });

  function restrict_zooming(ev, zoom_info) {

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

    // // two-stage zooming
    // ///////////////////////
    // if (zoom_info.tsy < zoom_restrict.ratio_y){
    //   zoom_info.dsx = 1;
    // }

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



  }

  return zoom_info;

};