const vectorizeText = require('vectorize-text')

module.exports = function draw_text_triangles(regl, zoom_function){

  // max ~200 min ~20
  var font_detail = 200;
  var text_vect = vectorizeText('Title', {
    textAlign: 'center',
    textBaseline: 'middle',
    triangles:true,
    size:font_detail,
    font:'"Open Sans", verdana, arial, sans-serif'
  });

  draw_function = regl({
    vert: `
      precision mediump float;
      attribute vec2 position;
      uniform mat4 zoom;

      void main () {
        // reverse y position to get words to be upright
        gl_Position = zoom * vec4( 0.2*position.x, -0.2 * position.y + 1.2, 0.0, 2.0);
      }`,
    frag: `
      precision mediump float;
      void main () {
        gl_FragColor = vec4(1, 0, 0, 1.0);
      }`,
    attributes: {
      position: text_vect.positions
    },
    elements: text_vect.cells,
    uniforms: {
      zoom: zoom_function
    }
  })

  return draw_function;

};