/*globals ArcadeAudio, IO*/

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

  this.io = new IO(this.canvas, this);
  this.io.delegate = this;
  this.io.addEvents();
  this.io.activeInput = {
    earth: false,
    water: false,
    air: false,
    fire: false,
    up: false,
    down: false,
    left: false,
    right: false
  };

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

Game.prototype.handleEvent = function (event) {

  switch (event.type) {
    case 'keydown':
      console.log('key down');
      this.setKeyState(event.keyCode, true);
      break;
    case 'keyup':
      console.log('key up');
      this.setKeyState(event.keyCode, false);
      break;
  }

};

Game.prototype.setKeyState = function (code, value) {
  switch (code) {
    case 49: // 1
      this.io.activeInput.earth = value;
      break;
    case 50: // 2
      this.io.activeInput.water = value;
      break;
    case 51: // 3
      this.io.activeInput.air = value;
      break;
    case 52: // 4
      this.io.activeInput.fire = value;
      break;
    case 37: // left
      this.io.activeInput.left = value;
      break;
    case 39: // right
      this.io.activeInput.right = value;
      break;
    case 38: // up
      this.io.activeInput.up = value;
      break;
    case 40: // down
      this.io.activeInput.down = value;
      break;
  }
};
