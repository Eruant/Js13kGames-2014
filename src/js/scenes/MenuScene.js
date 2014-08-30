/*globals IO*/

var MenuScene = function (game) {

  this.game = game;

  this.io = new IO(this.game.canvas, this);

  this.canvas = window.document.createElement('canvas');
  this.canvas.width = this.game.canvas.width;
  this.canvas.height = this.game.canvas.height;
  this.ctx = this.canvas.getContext('2d');

  this.redraw = true;

  return this;
};

MenuScene.prototype.update = function () {};

MenuScene.prototype.render = function () {

  if (this.redraw) {
    this.draw();
    this.redraw = false;
  }

  this.game.ctx.drawImage(this.canvas, 0, 0);
};

MenuScene.prototype.draw = function () {

  var ctx = this.ctx,
    canvas = this.canvas;

  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "Georgia";
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText("Press any key", canvas.width / 2, canvas.height / 2);

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
