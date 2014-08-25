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
  this.player = new Wisp(this, this.canvas.width / 2, this.canvas.height / 2, 'user');

  this.cpus = [
    new Wisp(this, Math.random() * this.canvas.width, Math.random() * this.canvas.height),
    new Wisp(this, Math.random() * this.canvas.width, Math.random() * this.canvas.height),
    new Wisp(this, Math.random() * this.canvas.width, Math.random() * this.canvas.height)
  ];
  for (var i = 0, len = this.cpus.length, random; i < len; i++) {
    random = Math.random();
    if (random > 0.75) {
      this.cpus[i].state = 'earth';
    } else if (random > 0.5) {
      this.cpus[i].state = 'air';
    } else if (random > 0.25) {
      this.cpus[i].state = 'water';
    } else {
      this.cpus[i].state = 'fire';
    }
  }
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
  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].update();
  }
};

Game.prototype.render = function () {

  // draw bakground
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.fillStyle = '#ccc';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // other objects
  this.player.render(this.ctx);
  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].render(this.ctx);
  }
};

Game.prototype.tick = function () {
  if (this.interval) {
    this.render();
    window.raf(this.tick.bind(this));
  }
};
