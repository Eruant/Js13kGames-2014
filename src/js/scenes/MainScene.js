/*globals IO, Wisp*/

var MainScene = function (game) {

  this.game = game;

  this.canvas = window.document.createElement('canvas');
  this.canvas.width = this.game.canvas.width;
  this.canvas.height = this.game.canvas.height;
  this.ctx = this.canvas.getContext('2d');

  this.io = new IO(this.game.canvas);
  this.player = new Wisp(this.game, this.game.canvas.width / 2, this.game.canvas.height / 2, 'user');
  this.player.size = 3;

  this.cpus = [
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height),
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height),
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height),
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height)
  ];

  this.cpus[0].state = 'earth';
  this.cpus[1].state = 'air';
  this.cpus[2].state = 'water';
  this.cpus[3].state = 'fire';

  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].size = Math.random() * 4;
  }

  this.draw();

  return this;
};

MainScene.prototype.update = function () {

  this.player.update(this.io.activeInput);
  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].update();
  }
};

MainScene.prototype.draw = function () {

  var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
  gradient.addColorStop(0, '#004cb3');
  gradient.addColorStop(1, '#8ed6ff');

  this.ctx.fillStyle = gradient;
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

MainScene.prototype.render = function () {

  // draw bakground
  this.game.ctx.drawImage(this.canvas, 0, 0);

  // other objects
  this.player.render(this.game.ctx);
  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].render(this.game.ctx);
  }
};
