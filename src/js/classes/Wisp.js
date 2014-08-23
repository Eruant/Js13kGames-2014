var Wisp = function (x, y) {

  this.position = {
    x: x || 0,
    y: y || 0
  };

  this.speed = {
    x: 0,
    y: 0
  };

  this.PI2 = Math.PI * 2;
  this.accelerate = 2;
};

Wisp.prototype.update = function (input) {

  if (input.left) {
    this.speed.x -= this.accelerate;
  }

  if (input.right) {
    this.speed.x += this.accelerate;
  }

  if (input.up) {
    this.speed.y -= this.accelerate;
  }

  if (input.down) {
    this.speed.y += this.accelerate;
  }

  if (this.speed.x > 10) {
    this.speed.x = 10;
  } else if (this.speed.x < -10) {
    this.speed.x = -10;
  }

  this.speed.x *= 0.9;
  this.speed.y *= 0.9;

  this.position.x += this.speed.x;
  this.position.y += this.speed.y;
};

Wisp.prototype.render = function (ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, this.PI2, false);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.restore();
};
