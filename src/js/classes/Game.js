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

  this.aa = new ArcadeAudio();
  
  this.aa.add('fire', 10, [
    [3, 0.25, 0.27, 0.76, 0.54, 0.5571, , 0.1799, -0.0999, 0.0035, 0.56, -0.6597, 0.61, 0.0862, -0.8256, , 0.5, 0.5, 0.71, -0.0181, , 0.0368, 0.0333, 0.5]
  ]);

  this.aa.add('air', 10, [
    [3, 0.33, 0.89, 0.25, 0.81, 0.4692, , -0.0122, 0.0113, -0.5995, 0.23, -0.54, -0.1575, , 0.2234, 0.84, -0.4, 0.6599, 0.17, -0.3399, 0.96, 0.25, 0.72, 0.5]
  ]);
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
        this.aa.play('air');
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
        this.aa.play('fire');
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
