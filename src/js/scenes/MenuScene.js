/*globals IO*/

var MenuScene = function (game) {

  this.game = game;

  this.io = new IO(this.game.canvas, this);

  return this;
};

MenuScene.prototype.update = function () {};

MenuScene.prototype.render = function () {

  var ctx = this.game.ctx,
    canvas = this.game.canvas;

  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

};

MenuScene.prototype.handleEvent = function (event) {

  switch (event.type) {
    case 'keydown':
      this.startGame();
      break;
  }
};

MenuScene.prototype.startGame = function () {
  this.game.sceneController.start('main');
};
