// © 2016 Ricky Reusser. MIT License.
'use strict';

var interactionEvents = require('interaction-events');
var extend = require('xtend/mutable');
var mat4 = require('gl-mat4');
var vec4 = require('gl-vec4');

module.exports = function makeCamera2D (regl, opts) {

  var options = extend({
    element: opts.element || regl._gl.canvas,
  }, opts || {});

  var element = options.element;

  var getWidth = element === window ?
    function () { return element.innerWidth } :
    function () { return element.offsetWidth }

  var getHeight = element === window ?
    function () { return element.innerHeight } :
    function () { return element.offsetHeight }

  var xrange = opts.xrange === undefined ? [-1, 1] : opts.xrange;
  var yrange = opts.yrange === undefined ? [-1, 1] : opts.yrange;
  var aspectRatio = opts.aspectRatio === undefined ? 1 : opts.aspectRatio;

  var width = getWidth();
  var height = getHeight();

  var xcen = 0.5 * (xrange[1] + xrange[0]);
  var ycen = 0.5 * (yrange[1] + yrange[0]);
  var xrng = 0.5 * (xrange[1] - xrange[0]);
  var yrng = xrng / aspectRatio / width * height;

  var mView_simple = mat4.identity([]);
  mView_simple[0] = 1 / xrng;
  mView_simple[5] = 1 / yrng;
  mView_simple[12] = -xcen / xrng;
  mView_simple[13] = -ycen / yrng;

  var setProps = regl({
    context: {
      view: regl.prop('view'),
    }
  });

  return {
    draw: function (cb) {
      setProps(
        { view: mView_simple },
        function(){cb()}
      );
    },

  };

}
