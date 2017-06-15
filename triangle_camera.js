const regl = require('regl')();

const camera = require('./camera-2d')(regl, {
  xrange: [-1, 1],
  yrange: [-1, 1]
});

var zoom_function = function(context){
  return context.view;
}

window.addEventListener('resize', camera.resize);

const draw = regl({

  vert: `
    precision highp float;
    attribute vec2 position;
    varying vec2 uv;
    uniform mat4 zoom;
    void main () {

      // zoom multiplication does zoom
      gl_Position = zoom * vec4(position, 0, 1);

    }
  `,

  frag: `

    // color triangle red
    void main () {
      gl_FragColor = vec4(1, 0, 0, 1);
    }

  `,

  attributes: {
    position: [
      [0, 1],
      [0, 0],
      [1, 0],
    ]
  },

  uniforms: {
    zoom: zoom_function,
  },

  count: 3

});

regl.frame(function(){

  regl.clear({
    color: [0,0,0,1]
  })

  camera.draw(draw);

});
