var Wisp = function (x, y, canvas) {

  this.canvas = canvas;

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
  this.state = 'normal';
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

  // add dampening
  this.speed.x *= 0.9;
  this.speed.y *= 0.9;

  this.speed.y += 0.3; // add gravity

  this.position.x += this.speed.x;
  this.position.y += this.speed.y;

  if (this.position.x > this.canvas.width) {
    this.position.x -= this.canvas.width;
  } else if (this.position.x < 0) {
    this.position.x += this.canvas.width;
  }

  if (this.position.y > this.canvas.height) {
    this.position.y = this.canvas.height;
    this.speed.y = -this.speed.y;
  } else if (this.position.y < 0) {
    this.position.y = 0;
    this.speed.y = -this.speed.y;
  }

  if (input.earth) {
    this.state = 'earth';
  } else if (input.water) {
    this.state = 'water';
  } else if (input.air) {
    this.state = 'air';
  } else if (input.fire) {
    this.state = 'fire';
  } else {
    this.state = 'normal';
  }
};

Wisp.prototype.render = function (ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, this.PI2, false);
  switch (this.state) {
    case 'earth':
      ctx.fillStyle = '#0f0';
      break;
    case 'water':
      ctx.fillStyle = '#00f';
      break;
    case 'air':
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      break;
    case 'fire':
      ctx.fillStyle = '#f00';
      break;
    default:
      ctx.fillStyle = '#fff';
      break;
  }
  ctx.fill();
  ctx.restore();
};