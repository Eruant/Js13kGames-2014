/*globals SceneController, ArcadeAudio, MainScene, MenuScene*/

window.raf = (function () {
  return window.requestAnimationFrame || function (cb) { window.setTimeout(cb, 1000 / 60); };
})();

var Game = function (width, height) {

  var doc = window.document;

  this.gravity = 0.2;

  this.canvas = doc.createElement('canvas');
  this.canvas.width = width;
  this.canvas.height = height;

  this.fps = 1000 / 60;

  this.ctx = this.canvas.getContext('2d');
  doc.getElementsByTagName('body')[0].appendChild(this.canvas);

  this.sounds = new ArcadeAudio();

  this.sceneController = new SceneController();
  this.sceneController.add('main', new MainScene(this));
  this.sceneController.add('menu', new MenuScene(this));
  this.sceneController.start('main');

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
  this.sceneController.states[this.sceneController.currentState].update();
};

Game.prototype.render = function () {
  this.sceneController.states[this.sceneController.currentState].render();
};

Game.prototype.tick = function () {
  if (this.interval) {
    this.render();
    window.raf(this.tick.bind(this));
  }
};