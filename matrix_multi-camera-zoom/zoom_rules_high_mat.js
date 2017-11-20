var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');
var restrict_zoom_on_interaction = require('./restrict_zoom_on_interaction');

module.exports = function zoom_rules_high_mat(regl, zoom_restrict, zoom_data, viz_component, viz_dim){

  var opts = opts || {};
  var options = extend({
      element: opts.element || regl._gl.canvas,
    }, opts || {});

  var element = options.element;

  global_translate = 0
  lock_left = false

  var interaction_types = ['wheel', 'touch', 'pinch'];

  interactionEvents({
    element: element,
  })
  .on('interaction', function(ev){
    if (ev.buttons || interaction_types.indexOf(ev.type) !== -1)  {

      restrict_zoom_on_interaction(ev, zoom_restrict.x, zoom_data.x, viz_component, viz_dim);

    }
  });

};