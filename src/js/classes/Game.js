/*globals ArcadeAudio*/

window.raf = (function () {
  return window.requestAnimationFrame || function (cb) { window.setTimeout(cb, 1000 / 60); };
})();

var Game = function () {

  var doc = window.document;

  this.canvas = doc.createElement('canvas');
  this.canvas.width = 300;
  this.canvas.height = 300;

  this.ctx = this.canvas.getContext('2d');
  doc.getElementsByTagName('body')[0].appendChild(this.canvas);

  var aa = new ArcadeAudio();
  
  aa.add('powerup', 10, [
    [0, , 0.01, , 0.4384, 0.2, , 0.12, 0.28, 1, 0.65, , , 0.0419, , , , , 1, , , , , 0.3]
  ]);

  aa.play('powerup');

  this.tick();
};

Game.prototype.update = function () {
};

Game.prototype.draw = function () {
};

Game.prototype.tick = function () {

  this.update();
  this.draw();

  window.raf(this.tick.bind(this));
};
