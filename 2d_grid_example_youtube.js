/**
* Attributes
* Shaders
* Uniform
* Varying
*/

const regl = require('regl')();

positions = generatePlane(10, 10);

const drawPlane = regl({

  vert: `
    precision mediump float;
    attribute vec3 position;
    varying float inst_color;

    void main(){
      inst_color = 4.0 * position[0];
      gl_Position = vec4(position, 1);
    }
  `,

  frag: `
    precision mediump float;
    varying float inst_color;
    void main(){
      gl_FragColor = vec4(inst_color, 0.0, 0.0, 1.0);
    }
  `,
  // this converts the vertices of the mesh into the position attribute
  attributes: {
    position: positions,
  },
  count: positions.length,

});

// The triangle positions are implicit in the batch run
function generatePlane (segmentsX, segmentsZ) {
  const positions = []
  const widthX = 1 / segmentsX
  const widthZ = 1 / segmentsZ
  for (let x = 0; x < segmentsX; x++) {
    for (let z = 0; z < segmentsZ; z++) {
      const x0 = x * widthX - 0.5
      const x1 = (x + 1) * widthX - 0.5
      const z0 = z * widthZ - 0.5
      const z1 = (z + 1) * widthZ - 0.5

      // Build 2 triangles
      //
      //       (x0, z1)       (x1, z1)
      //              *-------*
      //              | A   / |
      //              |   /   |
      //              | /   B |
      //              *-------*
      //       (x0, z0)       (x1, z0)

      // Triangle A
      positions.push([x0, z0, 0])
      positions.push([x0, z1, 0])
      positions.push([x1, z1, 0])

      // Triangle B
      positions.push([x1, z1, 0])
      positions.push([x1, z0, 0])
      positions.push([x0, z0, 0])
    }
  }
  return positions
}


// run the draw code on every frame update at 60fps.
regl.frame(() => {
  regl.clear({ depth: 1, color: [0, 0, 0, 1]});
  drawPlane();
})
