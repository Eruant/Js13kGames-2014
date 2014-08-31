/*globals IO, Wisp*/

var MainScene = function (game) {

  this.game = game;

  this.state = 'menu';

  this.canvas = window.document.createElement('canvas');
  this.canvas.width = this.game.canvas.width;
  this.canvas.height = this.game.canvas.height;
  this.ctx = this.canvas.getContext('2d');

  this.menuCanvas = window.document.createElement('canvas');
  this.menuCanvas.width = this.game.canvas.width;
  this.menuCanvas.height = this.game.canvas.height;
  this.menuCtx = this.menuCanvas.getContext('2d');
  this.drawMenu();

  this.pauseCanvas = window.document.createElement('canvas');
  this.pauseCanvas.width = this.game.canvas.width;
  this.pauseCanvas.height = this.game.canvas.height;
  this.pauseCtx = this.pauseCanvas.getContext('2d');
  this.drawPause();

  this.io = new IO(this.game.canvas, this.game);
  this.player = new Wisp(this.game, this.game.canvas.width / 2, this.game.canvas.height / 2, 'user');
  this.player.size = 5;

  this.cpus = [];
  this.cpuTypes = [
    'earth',
    'air',
    'water',
    'fire'
  ];

  var enemies = 10;
  while (enemies) {
    this.addCPU();
    enemies--;
  }

  this.draw();

  return this;
};

MainScene.prototype.addCPU = function () {

  var cpu, x, y;

  x = Math.random() * this.game.canvas.width;
  y = Math.random() * this.game.canvas.height;
  cpu = new Wisp(this.game, x, y);
  cpu.state = this.cpuTypes[Math.floor(Math.random() * this.cpuTypes.length)];
  cpu.size = Math.random() * (this.player.size + 10);

  this.cpus.push(cpu);

};

MainScene.prototype.update = function () {

  var i, len, kill;

  switch (this.state) {

    case 'menu':

      i = 0;
      len = this.cpus.length;
      for (; i < len; i++) {
        this.cpus[i].update();
      }

      break;

    case 'play':

      kill = [];

      if (!this.player.life) {
        this.state = 'menu';
        this.player.score = 0;
        this.player.life = 1;
        this.player.size = 5;
        this.player.position = {
          x: this.canvas.width / 2,
          y: this.canvas.height / 2
        };
        return;
      }

      if (this.player.size > 10) {
        this.player.size *= 0.8;
        i = 0;
        len = this.cpus.length;
        for (; i < len; i++) {
          this.cpus[i].size *= 0.8;
        }
      }

      this.player.update(this.io.activeInput);
      i = 0;
      len = this.cpus.length;
      for (; i < len; i++) {
        if (this.cpus[i].life === 0) {
          // TODO test to see if emitter has finished
          kill.push(i);
        }
        this.cpus[i].update();
      }

      i = 0;
      len = kill.length;
      for (; i < len; i++) {
        this.cpus.splice(kill[i], 1);
        this.addCPU();
      }

      this.testCollision();
      break;

  }
};

MainScene.prototype.draw = function () {

  var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
  gradient.addColorStop(0, '#004cb3');
  gradient.addColorStop(1, '#8ed6ff');

  this.ctx.fillStyle = gradient;
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

MainScene.prototype.drawMenu = function () {

  var ctx = this.menuCtx;

  ctx.fillStyle = '#000';
  ctx.font = '20px/24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Press any key to start', this.canvas.width / 2, this.canvas.height / 2);
};

MainScene.prototype.drawPause = function () {

  var ctx = this.pauseCtx;

  ctx.fillStyle = '#000';
  ctx.font = '20px/24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Paused', this.canvas.width / 2, this.canvas.height / 2);
};

MainScene.prototype.render = function () {

  // draw bakground
  this.game.ctx.drawImage(this.canvas, 0, 0);

  // other objects
  if (this.state === 'play') {
    this.player.render(this.game.ctx);
  }
  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].render(this.game.ctx);
  }

  switch (this.state) {
    case 'menu':
      this.game.ctx.drawImage(this.menuCanvas, 0, 0);
      break;
    case 'pause':
      this.game.ctx.drawImage(this.pauseCanvas, 0 ,0);
      break;
    case 'play':
      this.game.ctx.fillStyle = '#000';
      this.game.ctx.font = '20px/24px Arial';
      this.game.ctx.textAlign = 'center';
      this.game.ctx.fillText(this.player.score, this.canvas.width / 2, 20);
      break;
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

  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    sprite = this.cpus[i];

    // TODO test for CPUs hitting other CPUs
  }

};

MainScene.prototype.destroySmallest = function (a, b) {

  if (a.size > b.size) {
    a.size++;
    a.score += 2;
    b.size--;
    b.score -= 1;
    if (b.size <= 0) {
      b.life = 0;
    }
  } else {
    b.size++;
    b.score += 2;
    a.score -= 1;
    a.size--;
    if (a.size <= 0) {
      a.life = 0;
    }
  }

};
