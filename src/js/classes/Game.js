/*globals ArcadeAudio, MainScene, Colours*/

var Game = function (width, height, isTouchDevice) {

  var doc = window.document;

  this.isTouchDevice = isTouchDevice;

  this.colours = new Colours();

  this.gravity = 0.2;

  this.canvas = doc.createElement('canvas');
  this.canvas.width = width;
  this.canvas.height = height;

  this.fps = 1000 / 60;

  this.ctx = this.canvas.getContext('2d');
  doc.getElementsByTagName('body')[0].appendChild(this.canvas);

  this.sounds = new ArcadeAudio();
  this.sounds.add('fire', 5, [3, 0.25, 0.27, 0.76, 0.54, 0.5571, , 0.1799, -0.0999, 0.0035, 0.56, -0.6597, 0.61, 0.0862, -0.8256, , 0.5, 0.5, 0.71, -0.0181, , 0.0368, 0.0333, 0.3]);
  this.sounds.add('air', 5, [3, 0.33, 0.89, 0.25, 0.81, 0.4692, , -0.0122, 0.0113, -0.5995, 0.23, -0.54, -0.1575, , 0.2234, 0.84, -0.4, 0.6599, 0.17, -0.3399, 0.96, 0.25, 0.72, 0.7]);
  this.sounds.add('earth', 5, [2, 0.0128, 0.0265, 0.0181, 0.6963, 0.8477, , , 0.0159, 0.3225, 0.6078, -0.3337, -0.6789, 0.8691, -0.0014, 0.5717, -0.072, 0.8352, 0.9201, -0.8062, 0.242, 0.058, 0.0007, 0.5]);
  this.sounds.add('water', 5, [3, 0.1289, 0.0741, 0.1655, 0.2238, 0.7762, 0.1339, 0.8382, 0.4476, ,0.4073, 0.4105, 0.0273, 0.0935, -0.052, 0.1843, 0.5221, -0.4528, 0.4904, 0.4484, 0.6152, 0.5451, -0.4585, 0.54]);
  this.sounds.add('die', 5, [0, 0.0308, 0.1733, 0.1758, 0.9516, 0.0541, , 0.3565, 0.0169, 0.8242, 0.9043, 0.3467, , 0.0602, -0.0213, -0.0453, 0.198, 0.5443, 0.7509, -0.0001, 0.3062, 0.1318, , 0.5]);
  this.sounds.add('kill', 5, [3, 0.0292, 0.33, 0.0865, 0.5498, 0.4768, , , 0.76, , 0.36, -0.14, , , 0.4445, 0.2399, 0.398, 0.3198, 0.9815, -0.1708, 0.7077, 0.5137, 0.0005, 0.54]);
  this.sounds.add('menu', 5, [2, , 0.1122, , 0.0677, 0.26, , -0.02, , , , , , , , , , , 0.44, , , 0.11, -0.02, 0.72]);

  this.scene = new MainScene(this);

  this.render();
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
  this.scene.update();
};

Game.prototype.render = function () {
  this.scene.render();
};

Game.prototype.tick = function () {
  if (this.interval) {
    this.render();
    window.raf(this.tick.bind(this));
  }
};
