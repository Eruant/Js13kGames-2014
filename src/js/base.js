/*globals Game*/

window.raf = (function () {
  return window.requestAnimationFrame || function (cb) { window.setTimeout(cb, 1000 / 60); };
})();

window.onload = function () {

  var game, isTouchDevice, width, height, body;


  isTouchDevice = !!('ontouchstart' in window || 'onmsgesturechange' in window);

  if (isTouchDevice) {
    body = window.document.getElementsByTagName('body')[0];
    body.className = (body.className === '') ? 'touchDevice' : body.className + ' isTouchDevice';
  }
  width = (isTouchDevice) ? 320 : 640;
  height = (isTouchDevice) ? 480 : 480;

  game = new Game(width, height, isTouchDevice);
  game.start();
};
