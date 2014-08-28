var MenuScene = function (game) {

  this.game = game;

  return this;
};

MenuScene.prototype.update = function () {};

MenuScene.prototype.render = function () {

  var ctx = this.game.ctx,
    canvas = this.game.canvas;

  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

};
