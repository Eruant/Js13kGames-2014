/*globals ArcadeAudio*/

window.raf = (function () {
  return window.requestAnimationFrame || function (cb) { window.setTimeout(cb, 1000 / 60); };
})();

var Game = function () {

  var doc = window.document;

  this.canvas = doc.createElement('canvas');
  this.canvas.width = 300;
  this.canvas.height = 300;

  this.fps = 1000 / 60;

  this.ctx = this.canvas.getContext('2d');
  doc.getElementsByTagName('body')[0].appendChild(this.canvas);

  var aa = new ArcadeAudio();
  
  aa.add('powerup', 10, [
    [0, , 0.01, , 0.4384, 0.2, , 0.12, 0.28, 1, 0.65, , , 0.0419, , , , , 1, , , , , 0.3]
  ]);

  aa.play('powerup');
};

Game.prototype.start = function () {
  var _this = this;
  this.interval = window.setInterval(function () {
    _this.update();
  }, this.fps);
  this.tick();
};

Game.prototype.pause = function () {
  window.clearInterval(this.interval);
  delete this.interval;
};

Game.prototype.update = function () {
};

Game.prototype.render = function () {
};

Game.prototype.tick = function () {
  if (this.interval) {
    this.render();
    window.raf(this.tick.bind(this));
  }
};
