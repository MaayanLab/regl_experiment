// flashing
//////////////
var regl = require('regl')()

regl.frame(function () {
  // Instead of magenta, we oscillate the color
  regl.clear({
    color: [0, 0.5 * (1.0 + Math.cos(Date.now() * 0.01)), 1, 1]
  })
})