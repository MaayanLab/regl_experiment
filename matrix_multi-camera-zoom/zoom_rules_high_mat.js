var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');
var restrict_zoom_on_interaction = require('./restrict_zoom_on_interaction');

module.exports = function zoom_rules_mat(regl, zoom_restrict, viz_component){

  var zoom_info = {}
  zoom_info.tsx = 1;
  zoom_info.x0 = 0;
  zoom_info.total_pan_x = 0;
  zoom_info.zdx = 0;

  zoom_info.tsy = 1;
  zoom_info.y0 = 0;
  zoom_info.total_pan_y = 0;
  zoom_info.zdy = 0;

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
  var zoom_data = {};
  _.each(['x', 'y'], function(inst_dim){
    info = {};
    // total zooming
    info.tsx = 1;
    // position of cursor
    info.x0 = 0;
    // total panning
    info.total_pan_x = 0;
    // zd (zoom pan?)
    info.zdx = 0;
    // add to zoom_data
    zoom_data[inst_dim] = info;
  })

  var interaction_types = ['wheel', 'touch', 'pinch'];

  interactionEvents({
    element: element,
  })
  .on('interaction', function(ev){
    if (ev.buttons || interaction_types.indexOf(ev.type) !== -1)  {
      restrict_zoom_on_interaction(ev, zoom_info, zoom_data, viz_component);
    }
  });



  return zoom_info;

};