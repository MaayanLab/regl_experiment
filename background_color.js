///////////////////////////////////////
// background color
///////////////////////////////////////
// First we import regl and call the constructor
var regl = require('regl')()

// Then we hook a callback to draw the current frame
regl.frame(function () {
  // And in the frame loop we clear the screen color to magenta
  regl.clear({
    // This line determines the color of the screen.  It has 4 components:
    //  [red, green, blue, alpha]
    //
    // Each of these is a number between 0 and 1, where 0 = dark and 1 = light.
    // alpha is a special color controlling transparency.
    //
    color: [1, 0, 1, 1]
    //
    // Try changing these numbers in your program and see what happens!
  })
})