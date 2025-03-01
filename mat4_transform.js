// mat4_transform
module.exports = {

    rotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
      return [
        c,-s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    },

    scaling: function(sx, sy) {
      return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1
      ];
    },
  };

