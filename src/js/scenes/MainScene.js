/*globals IO, Wisp*/

var MainScene = function (game) {

  this.game = game;

  this.io = new IO(this.game.canvas, this.game);
  this.player = new Wisp(this.game, this.game.canvas.width / 2, this.game.canvas.height / 2, 'user');

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

  return this;
};

MainScene.prototype.update = function () {

  this.player.update(this.io.activeInput);
  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].update();
  }
};

MainScene.prototype.render = function () {

  // draw bakground
  this.game.ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
  this.game.ctx.fillStyle = '#ccc';
  this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

  // other objects
  this.player.render(this.game.ctx);
  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].render(this.game.ctx);
  }
};
