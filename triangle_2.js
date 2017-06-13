// Calling the regl module with no arguments creates a full screen canvas and
// WebGL context, and then uses this context to initialize a new REGL instance
const regl = require('regl')()

// Calling regl() creates a new partially evaluated draw command
const drawTriangle = regl({

  // shaders in regl are just strings. You can use glslify or whatever you want
  // de define them. No need to manually create shader objects.
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;
    void main(){
      gl_Position = vec4(position, 0, 1);
    }`,

    // Here we define the vertex attributes for the above shader
    attributes: {
      // regl.buffer creates a new array buffer object
      position: regl.buffer([
        [-1,-1], // no need to flatten nested arrays, regl automatically
        [4, -2], // unrolls them into a typedarray (default Float32)
        [4, 4]
      ])

      // regl automatically infers sane defaults for the vertex attribute pointers
    },

    uniforms: {
      // This defines the color f the triangle to be a dynamic variable
      color: regl.prop('color')
    },

    // This tells regl the number of vertices to draw in this command
    count: 3

})

// regl.frame() wrapw requestAnimationFrame and also handles viewport changes
regl.frame(({time}) => {
  // clear contents of the drawing buffer
  regl.clear({
    color: [0,0,0,0],
    depth: 1
  })

  // draw a triangle using the command defined above
  drawTriangle({
    color: [
      Math.cos(time*0.001),
      Math.cos(time*0.0008),
      Math.cos(time*0.003),
      1
    ]
  })
})