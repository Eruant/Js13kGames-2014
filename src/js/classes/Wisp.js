/*globals Emitter*/

var Wisp = function (game, x, y, type) {

  this.game = game;
  this.type = type || 'cpu';

  //this.game.sounds.add('fire', 10, [
    //[3, 0.25, 0.27, 0.76, 0.54, 0.5571, , 0.1799, -0.0999, 0.0035, 0.56, -0.6597, 0.61, 0.0862, -0.8256, , 0.5, 0.5, 0.71, -0.0181, , 0.0368, 0.0333, 0.5]
  //]);

  //this.game.sounds.add('air', 10, [
    //[3, 0.33, 0.89, 0.25, 0.81, 0.4692, , -0.0122, 0.0113, -0.5995, 0.23, -0.54, -0.1575, , 0.2234, 0.84, -0.4, 0.6599, 0.17, -0.3399, 0.96, 0.25, 0.72, 0.5]
  //]);

  this.position = {
    x: x || 0,
    y: y || 0
  };

  this.speed = {
    x: 0,
    y: 0
  };

  this.size = 1;

  this.PI2 = Math.PI * 2;
  this.accelerate = 1;
  this.maxSpeed = (this.size > 10) ? 10 - this.size : 3;
  this.state = 'normal';
  this.emitter = new Emitter();
};

Wisp.prototype.update = function (input) {

  if (this.type === 'user') {
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
  } else if (this.type === 'cpu') {
    this.speed.x += (Math.random() * 2) - 1;
    this.speed.y += (Math.random() * 2) - 1;
  }

  if (this.speed.x > this.maxSpeed) {
    this.speed.x = this.maxSpeed;
  } else if (this.speed.x < -this.maxSpeed) {
    this.speed.x = -this.maxSpeed;
  }

  if (this.speed.y > this.maxSpeed) {
    this.speed.y = this.maxSpeed;
  } else if (this.speed.y < -this.maxSpeed) {
    this.speed.y = -this.maxSpeed;
  }

  // add dampening
  this.speed.x *= 0.9;
  this.speed.y *= 0.9;

  //this.speed.y += this.game.gravity;

  this.position.x += this.speed.x;
  this.position.y += this.speed.y;

  if (this.position.x > this.game.canvas.width) {
    this.position.x -= this.game.canvas.width;
  } else if (this.position.x < 0) {
    this.position.x += this.game.canvas.width;
  }

  if (this.position.y > this.game.canvas.height) {
    this.position.y = this.game.canvas.height;
    this.speed.y = -this.speed.y;
  } else if (this.position.y < 0) {
    this.position.y = 0;
    this.speed.y = -this.speed.y;
  }

  if (this.type === 'user') {
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
  }

  this.emitter.update(this.state, this.position);
};

Wisp.prototype.render = function (ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.beginPath();
  ctx.arc(0, 0, this.size, 0, this.PI2, false);
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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
      break;
  }
  ctx.fill();
  ctx.restore();
  this.emitter.render(this.position, ctx);
};
