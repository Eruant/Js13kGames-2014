/*globals IO, Wisp, Transition, Shapes, Storage*/

var MainScene = function (game) {

  this.game = game;

  this.state = 'menu';

  this.rules = {
    water: 'fire',
    fire: 'earth',
    earth: 'air',
    air: 'water'
  };

  this.storage = new Storage();
  this.game.hiscore = this.storage.load('hiscore');

  this.menuTransition = new Transition();
  this.menuTransition.start();

  this.pauseTransition = new Transition();

  this.shapes = new Shapes();

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
  this.player = new Wisp(this.game, this.game.canvas.width / 2, this.game.canvas.height / 2, 'user', this.ctx);
  this.player.size = 5;
  this.player.invincible = 60;

  this.cpus = [];
  this.cpuTypes = [
    'earth',
    'air',
    'water',
    'fire'
  ];

  var enemies = 5;
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
  cpu = new Wisp(this.game, x, y, 'cpu', this.ctx);
  cpu.state = this.cpuTypes[Math.floor(Math.random() * this.cpuTypes.length)];
  cpu.size = Math.random() * (this.player.size + 5);

  this.cpus.push(cpu);

};

MainScene.prototype.update = function () {

  var i, len, kill;

  switch (this.state) {

    case 'menu':
    case 'transition-play':

      this.menuTransition.update();

      i = 0;
      len = this.cpus.length;
      for (; i < len; i++) {
        this.cpus[i].update();
      }

      break;

    case 'play':

      kill = [];

      if (this.player.invincible > 0) {
        this.player.invincible--;
      }

      if (this.player.size < 1) {
        this.player.life = 0;
      }

      if (!this.player.life) {
        this.game.sounds.play('die');
        this.player.invincible = 60;
        this.io.activeInput.earth = false;
        this.io.activeInput.water = false;
        this.io.activeInput.air = false;
        this.io.activeInput.fire = false;
        this.io.activeInput.up = false;
        this.io.activeInput.down = false;
        this.io.activeInput.left = false;
        this.io.activeInput.right = false;
        this.state = 'menu';
        if (this.game.hiscore) {
          if (this.player.score > this.game.hiscore) {
            this.game.hiscore = this.player.score;
            this.storage.save('hiscore');
          }
        } else {
          this.game.hiscore = this.player.score;
          this.storage.save('hiscore');
        }
        this.drawMenu();
        this.player.score = 0;
        this.player.life = 1;
        this.player.size = 5;
        this.player.position = {
          x: this.canvas.width / 2,
          y: this.canvas.height / 2
        };
        return;
      }

      this.scaleWorld();

      this.player.update(this.io.activeInput);
      i = 0;
      len = this.cpus.length;
      for (; i < len; i++) {
        if (this.cpus[i].life === 0) {
          kill.push(i);
        }
        this.cpus[i].update(null, this.cpus, this.player);
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

MainScene.prototype.drawMenu = function (percent) {

  var ctx, width, height, halfWidth, halfHeight, bgWidth, bgHeight;

  ctx = this.menuCtx;
  width = this.menuCanvas.width;
  height = this.menuCanvas.height;
  halfWidth = width / 2;
  halfHeight = height / 2;
  bgWidth = width * 0.4;
  bgHeight = height * 0.4;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if (percent) {
    ctx.globalAlpha = percent;
  }

  // draw background
  ctx.save();
  ctx.translate(halfWidth, halfHeight);
  ctx.beginPath();
  ctx.moveTo(-bgWidth - (Math.random() * 10), -bgHeight - (Math.random() * 10));
  ctx.lineTo(bgWidth + (Math.random() * 10), -bgHeight - (Math.random() * 10));
  ctx.lineTo(bgWidth + (Math.random() * 10), bgHeight + (Math.random() * 10));
  ctx.lineTo(-bgWidth - (Math.random() * 10), bgHeight + (Math.random() * 10));
  ctx.closePath();
  ctx.fillStyle = this.game.colours.menu.main;
  ctx.strokeStyle = this.game.colours.menu.light;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // draw element guide
  ctx.save();
  ctx.translate(this.canvas.width - 60, 60);
  ctx.rotate(-10 * (Math.PI / 180));
  ctx.scale(0.5, 0.5);
  ctx.transform(1, 0.1, 0, 1, 0, 0);
  this.shapes.draw(ctx, 'elements', [
      { fill: this.game.colours.water.main, radius: 100 },
      { fill: this.game.colours.fire.main, radius: 100 },
      { fill: this.game.colours.earth.main, radius: 100 },
      { fill: this.game.colours.air.main, radius: 100 }
    ]);
  ctx.restore();

  // draw text
  ctx.fillStyle = '#fff';
  ctx.font = '20px/24px "Trebuchet MS", Helvetica, sans-serif';
  ctx.textAlign = 'center';

  ctx.save();
  ctx.translate(halfWidth, halfHeight - 90);
  ctx.rotate(-2 * Math.PI / 180);
  ctx.fillText('Become the biggest', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(halfWidth, halfHeight - 30);
  ctx.rotate(1 * Math.PI / 180);
  ctx.fillText('use the cursor', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(halfWidth, halfHeight - 10);
  ctx.rotate(-1 * Math.PI / 180);
  ctx.fillText('keys to move', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = this.game.colours.earth.main;
  ctx.translate(halfWidth - 50, halfHeight + 40);
  ctx.rotate(-3 * Math.PI / 180);
  ctx.fillText('earth "1"', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = this.game.colours.air.main;
  ctx.translate(halfWidth + 60, halfHeight + 35);
  ctx.rotate(2 * Math.PI / 180);
  ctx.fillText('air "2"', 0, 0);
  ctx.restore();
  
  ctx.save();
  ctx.fillStyle = this.game.colours.water.main;
  ctx.translate(halfWidth + 50, halfHeight + 85);
  ctx.rotate(-2 * Math.PI / 180);
  ctx.fillText('water "3"', 0, 0);
  ctx.restore();
  
  ctx.save();
  ctx.fillStyle = this.game.colours.fire.main;
  ctx.translate(halfWidth - 60, halfHeight + 90);
  ctx.rotate(2 * Math.PI / 180);
  ctx.fillText('fire "4"', 0, 0);
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.fillText('Press any "enter" to begin', halfWidth, halfHeight + 150);

  if (typeof this.game.hiscore === 'number') {
    ctx.save();
    ctx.translate(halfWidth - 80, halfHeight - 160);
    ctx.rotate(-5 * Math.PI / 180);
    ctx.fillText('score: ' + this.game.hiscore, 0, 0);
    ctx.restore();
  }

  ctx.restore();
};

MainScene.prototype.drawPause = function () {

  var ctx = this.pauseCtx;

  ctx.clearRect(0, 0, this.pauseCanvas.width, this.pauseCanvas.height);
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = '20px/24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Paused', this.canvas.width / 2, this.canvas.height / 2);

  ctx.restore();
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
      if (this.menuTransition.active) {
        this.game.ctx.globalAlpha = this.menuTransition.percent;
        this.game.ctx.drawImage(this.menuCanvas, 0, 0);
        this.game.ctx.globalAlpha = 1;
      } else {
        this.game.ctx.drawImage(this.menuCanvas, 0, 0);
      }
      break;
    case 'transition-play':
      if (this.menuTransition.active) {
        this.game.ctx.globalAlpha = this.menuTransition.percent;
        this.game.ctx.drawImage(this.menuCanvas, 0, 0);
        this.game.ctx.globalAlpha = 1;
      } else {
        this.state = 'play';
      }
      break;
    case 'pause':
      this.game.ctx.drawImage(this.pauseCanvas, 0, 0);
      break;
    case 'play':
      this.game.ctx.fillStyle = '#fff';
      this.game.ctx.font = '20px/24px Arial';
      this.game.ctx.textAlign = 'center';
      this.game.ctx.fillText(this.player.score, this.canvas.width / 2, 20);

      this.game.ctx.save();
      this.game.ctx.translate(this.canvas.width - 20, 20);
      this.game.ctx.rotate(-10 * (Math.PI / 180));
      this.game.ctx.scale(0.1, 0.1);
      this.game.ctx.globalAlpha = 0.5;
      this.game.ctx.transform(1, 0.1, 0, 1, 0, 0);
      this.shapes.draw(this.game.ctx, 'elements', [
          { fill: this.game.colours.water.main, radius: 100 },
          { fill: this.game.colours.fire.main, radius: 100 },
          { fill: this.game.colours.earth.main, radius: 100 },
          { fill: this.game.colours.air.main, radius: 100 }
        ]);
      this.game.ctx.restore();
      break;
  }
};

MainScene.prototype.testCollision = function () {

  var i, len, sprite, aSize, aMaxX, aMinX, aMaxY, aMinY, bSize, bMaxX, bMinX, bMaxY, bMinY, sprite2;

  aSize = this.player.size;
  aMaxX = this.player.position.x + aSize;
  aMinX = this.player.position.x - aSize;
  aMaxY = this.player.position.y + aSize;
  aMinY = this.player.position.y - aSize;

  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    sprite = this.cpus[i];

    // collision between player and cpus
    if ((aMaxX > sprite.position.x) && (aMinX < sprite.position.x)) {
      if ((aMaxY > sprite.position.y) && (aMinY < sprite.position.y)) {
        this.destroySmallest(this.player, sprite);
      }
    }

  }

  i = 0;
  var j;
  len = this.cpus.length;
  for (; i < len; i++) {
    sprite = this.cpus[i];
    bSize = sprite.size;
    bMaxX = sprite.position.x + bSize;
    bMinX = sprite.position.x - bSize;
    bMaxY = sprite.position.y + bSize;
    bMinY = sprite.position.y - bSize;

    // collision between cpu and player
    if ((bMaxX > this.player.position.x) && (bMinX < this.player.position.x)) {
      if ((bMaxY > this.player.position.y) && (bMinY < this.player.position.y)) {
        this.destroySmallest(sprite, this.player);
      }
    }

    j = i;
    for (; j < len; j++) {

      sprite2 = this.cpus[j];

      // collision between cpu and cpu
      if ((bMaxX > sprite2.position.x) && (bMinX < sprite2.position.x)) {
        if ((bMaxY > sprite2.position.y) && (bMinY < sprite2.position.y)) {
          this.destroySmallest(sprite, sprite2);
        }
      }
    }
  }

};

MainScene.prototype.destroySmallest = function (a, b) {

  if (a.invincible > 0 || b.invincible > 0) {
    return;
  }

  var ruleA, ruleB, valueA, valueB, boost;

  boost = 10;

  ruleA = this.rules[a.state];
  ruleB = this.rules[b.state];

  valueA = a.size + (b.state === ruleA ? boost : 0);
  valueB = b.size + (a.state === ruleB ? boost : 0);

  if (valueA > valueB) {
    a.size++;
    a.score += 2;
    b.size--;
    //b.score -= 1;
    if (b.size <= 0) {
      this.game.sounds.play('kill');
      b.life = 0;
    }
  } else {
    b.size++;
    b.score += 2;
    //a.score -= 1;
    a.size--;
    if (a.size <= 0) {
      this.game.sounds.play('kill');
      a.life = 0;
    }
  }
  

};

MainScene.prototype.scaleSprites = function () {

  var i, len, amount;

  amount = 0.99;

  this.player.size *= amount;
  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    this.cpus[i].size *= amount;
  }

};

MainScene.prototype.scaleWorld = function () {

  var i, len;

  if (this.player.size > 10) {
    this.scaleSprites();
  }

  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    if (this.cpus[i].size > 10) {
      this.scaleSprites();
    }
  }

};
