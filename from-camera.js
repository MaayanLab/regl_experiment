var Mat4 = require('gl-mat4')
var Vec3 = require('gl-vec3')
var Quat = require('gl-quat')

function Camera ( regl, opts ) {
  opts = opts || {}

  var draw = regl({
    uniforms: {
      view: regl.prop('view'),
      projection: regl.prop('projection'),
      view_inverse: regl.prop('view_inverse'),
      projection_inverse: regl.prop('projection_inverse'),
      eye: regl.prop('eye'),
      target: regl.prop('target')
    }
  })

  var ortho = function ( props, cb ) {
    Object.assign(this, props)
    Mat4.lookAt(this.view, this.eye, this.target, this.up)
    Mat4.ortho(this.projection, this.left, this.right, this.bottom, this.top, this.near, this.far)
    Mat4.invert(this.viewInverse, this.view)
    Mat4.invert(this.projectionInverse, this.projection)
    draw(this, cb)
  }
  var perspective = function ( props, cb ) {
    Object.assign(this, props)
    Mat4.lookAt(this.view, this.eye, this.target, this.up)
    Mat4.perspective(this.projection, this.fovy, this.aspectRatio, this.near, this.far)
    Mat4.invert(this.viewInverse, this.view)
    Mat4.invert(this.projectionInverse, this.projection)
    draw(this, cb)
  }

  this.top = opts.top || 1
  this.bottom = opts.bottom || -1
  this.left = opts.left || -1
  this.right = opts.right || 1
  this.up = opts.up || Vec3.fromValues(0, 1, 0)
  this.eye = opts.eye || Vec3.fromValues(0, 0, 1)
  this.target = opts.target || Vec3.create()
  this.fovy = opts.fovy || Math.PI / 4
  this.aspectRatio = opts.aspectRatio || 16 / 9
  this.near = opts.near || .1
  this.far = opts.far || 10000
  this.view = Mat4.create()
  this.projection = Mat4.create()
  this.viewInverse = Mat4.create()
  this.projectionInverse = Mat4.create()
  this.ortho = ortho
  this.perspective = perspective
}

module.exports = Camera