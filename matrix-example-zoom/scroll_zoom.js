module.exports = function scroll_zoom_ext(ev){
  console.log('external scroll zoom')


    switch (ev.type) {
      case 'wheel':
        ev.dsx = ev.dsy = Math.exp(-ev.dy / 100);
        ev.dx = ev.dy = 0;
        break;
    }

    if (ev.buttons || ['wheel', 'touch', 'pinch'].indexOf(ev.type) !== -1)  {

      console.log('interacting')

      ev.preventDefault();

      dViewport[0] = ev.dsx;
      dViewport[1] = 0;
      dViewport[2] = 0;
      dViewport[3] = 0;
      dViewport[4] = 0;

      dViewport[5] = ev.dsy;
      dViewport[6] = 0;
      dViewport[7] = 0;
      dViewport[8] = 0;

      dViewport[9] = 0;
      dViewport[10] = 1;
      dViewport[11] = 0;
      dViewport[12] = -ev.dsx * ev.x0 + ev.x0 + ev.dx;

      dViewport[13] = -ev.dsy * ev.y0 + ev.y0 + ev.dy;
      dViewport[14] = 0;
      dViewport[15] = 1;

      mat4.multiply(dViewport, dViewport, mViewport);
      mat4.multiply(dViewport, mInvViewport, dViewport);
      mat4.multiply(mView, dViewport, mView);

      dirty = true;
    }

    var xy = vec4.transformMat4([],
      vec4.transformMat4([], [ev.x0, ev.y0, 0, 1], mInvViewport),
      mat4.invert([], mView)
    );

    ev.x = xy[0];
    ev.y = xy[1];

    emitter.emit('move', ev);
}