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

  this.player = new Wisp(this.canvas.width / 2, this.canvas.height / 2, this.canvas);

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

Game.prototype.handleEvent = function (event) {

  switch (event.type) {
    case 'keydown':
      this.setKeyState(event.keyCode, true);
      break;
    case 'keyup':
      this.setKeyState(event.keyCode, false);
      break;
  }

};

Game.prototype.setKeyState = function (code, value) {

  switch (code) {
    case 49: // 1
      if (value) {
        this.io.activeInput.earth = true;
        this.io.activeInput.water = false;
        this.io.activeInput.air = false;
        this.io.activeInput.fire = false;
      } else {
        this.io.activeInput.earth = false;
      }
      break;
    case 50: // 2
      if (value) {
        this.io.activeInput.earth = false;
        this.io.activeInput.water = true;
        this.io.activeInput.air = false;
        this.io.activeInput.fire = false;
      } else {
        this.io.activeInput.water = false;
      }
      break;
    case 51: // 3
      if (value) {
        this.io.activeInput.earth = false;
        this.io.activeInput.water = false;
        this.io.activeInput.air = true;
        this.io.activeInput.fire = false;
      } else {
        this.io.activeInput.air = false;
      }
      break;
    case 52: // 4
      if (value) {
        this.io.activeInput.earth = false;
        this.io.activeInput.water = false;
        this.io.activeInput.air = false;
        this.io.activeInput.fire = true;
      } else {
        this.io.activeInput.fire = false;
      }
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

Game.prototype.setTouchState = function (action, value) {
  console.log(action, value);
};
