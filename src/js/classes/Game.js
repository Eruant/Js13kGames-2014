/*globals ArcadeAudio, IO, Wisp*/

window.raf = (function () {
  return window.requestAnimationFrame || function (cb) { window.setTimeout(cb, 1000 / 60); };
})();

var Game = function (width, height) {

  var doc = window.document;

  this.canvas = doc.createElement('canvas');
  this.canvas.width = width;
  this.canvas.height = height;

  this.fps = 1000 / 60;

  this.ctx = this.canvas.getContext('2d');
  doc.getElementsByTagName('body')[0].appendChild(this.canvas);

  this.io = new IO(this.canvas, this);
  this.sounds = new ArcadeAudio();
  this.player = new Wisp(this.canvas.width / 2, this.canvas.height / 2, this);
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
  this.player.update(this.io.activeInput);
};

Game.prototype.render = function () {

  // draw bakground
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.fillStyle = '#ccc';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // other objects
  this.player.render(this.ctx);
};

Game.prototype.tick = function () {
  if (this.interval) {
    this.render();
    window.raf(this.tick.bind(this));
  }
};
