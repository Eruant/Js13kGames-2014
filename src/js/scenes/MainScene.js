/*globals IO, Wisp*/

var MainScene = function (game) {

  this.game = game;

  this.canvas = window.document.createElement('canvas');
  this.canvas.width = this.game.canvas.width;
  this.canvas.height = this.game.canvas.height;
  this.ctx = this.canvas.getContext('2d');

  this.io = new IO(this.game.canvas);
  this.player = new Wisp(this.game, this.game.canvas.width / 2, this.game.canvas.height / 2, 'user');
  this.player.size = 5;

  this.cpus = [
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height),
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height),
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height),
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height),
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height),
    new Wisp(this.game, Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height)
  ];

  this.cpus[0].state = 'earth';
  this.cpus[1].state = 'air';
  this.cpus[2].state = 'water';
  this.cpus[3].state = 'fire';
  this.cpus[4].state = 'fire';
  this.cpus[5].state = 'fire';

  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].size = Math.random() * 15;
  }

  this.draw();

  return this;
};

MainScene.prototype.reset = function () {
  this.io.removeEvents();
};

MainScene.prototype.update = function () {

  var i, len, kill;
  
  kill = [];
  
  if (!this.player.life || this.cpus.length === 0) {
    this.game.sceneController.start('menu');
    return;
  }

  this.player.update(this.io.activeInput);
  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    if (this.cpus[i].life === 0) {
      kill.push(i);
    }
    this.cpus[i].update();
  }

  i = 0;
  len = kill.length;
  for (; i < len; i++) {
    this.cpus.splice(kill[i], 1);
  }

  this.testCollision();
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

MainScene.prototype.testCollision = function () {

  var i, len, sprite, aSize, aMaxX, aMinX, aMaxY, aMinY;

  aSize = (this.player.size / 2);
  aMaxX = this.player.position.x + aSize;
  aMinX = this.player.position.x - aSize;
  aMaxY = this.player.position.y + aSize;
  aMinY = this.player.position.y - aSize;

  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    sprite = this.cpus[i];

    if ((aMaxX > sprite.position.x) && (aMinX < sprite.position.x)) {
      if ((aMaxY > sprite.position.y) && (aMinY < sprite.position.y)) {
        this.destroySmallest(this.player, sprite);
      }
    }

  }

};

MainScene.prototype.destroySmallest = function (a, b) {

  if (a.size > b.size) {
    a.size++;
    b.size--;
    if (b.size <= 0) {
      b.life = 0;
    }
  } else {
    b.size++;
    a.size--;
    if (a.size <= 0) {
      a.life = 0;
    }
  }

};
