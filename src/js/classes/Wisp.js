/*globals Emitter*/

var Wisp = function (game, x, y, type, ctx) {

  var _this = this;

  this.game = game;
  this.type = type;
  this.life = 1;
  this.score = 0;

  this.gradient = {
    water: ctx.createRadialGradient(-2, -2, 0, 0, 0, 20),
    air: ctx.createRadialGradient(0, 0, 0, 0, 0, 20)
  };

  this.gradient.water.addColorStop(0.000, 'rgba(255, 255, 255, 0.7)');
  this.gradient.water.addColorStop(0.381, 'rgba(0, 95, 191, 0.3)');
  this.gradient.water.addColorStop(0.549, 'rgba(0, 95, 191, 0.3)');
  this.gradient.water.addColorStop(0.755, 'rgba(0, 127, 255, 0.3)');
  this.gradient.water.addColorStop(1.000, 'rgba(0, 63, 127, 0.3)');

  this.gradient.air.addColorStop(0.000, 'rgba(255, 255, 255, 0.3)');
  this.gradient.air.addColorStop(1.000, 'rgba(255, 255, 255, 0.0)');

  this.playSound = function (key) {
    this.game.sounds.play(key);
  };


  this.position = {
    x: x || 0,
    y: y || 0
  };

  this.speed = {
    x: 0,
    y: 0
  };

  this.angle = 0;
  this.rotate = Math.random() * 10;

  this.size = 1;

  this.PI2 = Math.PI * 2;
  this.accelerate = 1;
  this.maxSpeed = (this.size > 10) ? 10 - this.size : 3;
  this.state = 'normal';
  this.emitter = new Emitter(ctx);
};

Wisp.prototype.update = function (input, cpus, player) {

  var i, len, sprite, smallest, distanceX, distanceY, distance, directionX, directionY;

  this.maxSpeed = (20 / this.size);

  this.angle += this.rotate;
  if (this.angle > 360) {
    this.angle -= 360;
  }

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

    if (cpus) {
      i = 0;
      len = cpus.length;
      smallest = false;
      directionX = 1;
      directionY = 1;
      for (; i < len; i++) {
        sprite = cpus[i];
        if (sprite.position.x !== this.position.x &&
            sprite.position.y !== this.position.y &&
            sprite.size < this.size) {

          distanceX = this.position.x - sprite.position.x;
          distanceY = this.position.y - sprite.position.y;
          if (distanceX < 0) {
            directionX = -1;
            distanceX = -distanceX;
          }
          if (distanceY < 0) {
            directionY = -1;
            distanceY = -distanceY;
          }
          distance = distanceX + distanceY;

          if (!smallest || smallest.distance < distance) {
            smallest = {
              distance: distance,
              sprite: i
            };
          }
        }
      }

      if (player &&
          player.size < this.size) {
        distanceX = this.position.x - player.position.x;
        distanceY = this.position.y - player.position.y;
        if (distanceX < 0) {
          directionX = -1;
          distanceX = -distanceX;
        }
        if (distanceY < 0) {
          directionY = -1;
          distanceY = -distanceY;
        }
        distance = distanceX + distanceY;

        if (!smallest || smallest.distance < distance) {
          smallest = {
            distance: distance,
            sprite: i
          };
        }

      }

      if (smallest && Math.random() > 0.3) {
        this.speed.x -= directionX * 0.1;
        this.speed.y -= directionY * 0.1;
      } else {
        this.speed.x += (Math.random() * 2) - 1;
        this.speed.y += (Math.random() * 2) - 1;
      }
    } else {
      this.speed.x += (Math.random() * 2) - 1;
      this.speed.y += (Math.random() * 2) - 1;
    }
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

  this.position.x += this.speed.x;
  this.position.y += this.speed.y;

  if (this.position.x > this.game.canvas.width - this.size) {
    this.position.x = this.game.canvas.width - this.size;
    this.speed.x = -this.speed.x;
  } else if (this.position.x < this.size) {
    this.position.x = this.size;
    this.speed.x = -this.speed.x;
  }

  if (this.position.y > this.game.canvas.height - this.size) {
    this.position.y = this.game.canvas.height - this.size;
    this.speed.y = -this.speed.y;
  } else if (this.position.y < this.size) {
    this.position.y = this.size;
    this.speed.y = -this.speed.y;
  }

  if (this.type === 'user') {
    if (input.earth) {
      if (this.state !== 'earth') {
        //this.playSound('earth');
      }
      this.state = 'earth';
    } else if (input.water) {
      if (this.state !== 'water') {
        //this.playSound('water');
      }
      this.state = 'water';
    } else if (input.air) {
      if (this.state !== 'air') {
        this.playSound('air');
      }
      this.state = 'air';
    } else if (input.fire) {
      if (this.state !== 'fire') {
        this.playSound('fire');
      }
      this.state = 'fire';
    } else {
      this.state = 'normal';
    }
  }

  this.emitter.update(this.state, this.position, this.size);
};

Wisp.prototype.render = function (ctx) {

  var halfSize = this.size * 0.5,
    twoThirdsSize = this.size * 0.66,
    thirdSize = this.size * 0.33;

  if (this.life) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle * Math.PI / 180);
    switch (this.state) {
      case 'earth':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, this.PI2, false);
        ctx.fillStyle = 'rgb(139, 101, 8)';
        ctx.fill();
        ctx.fillStyle = 'rgba(139, 105, 20, 0.5)';
        ctx.beginPath();
        ctx.arc(-thirdSize, thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        ctx.fillStyle = 'rgba(205, 186, 150, 0.5)';
        ctx.beginPath();
        ctx.arc(thirdSize, thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        ctx.fillStyle = 'rgba(210, 180, 140, 0.5)';
        ctx.beginPath();
        ctx.arc(0, -thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        break;

      case 'water':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, this.PI2, false);
        ctx.fillStyle = this.gradient.water;
        ctx.fill();
        break;

      case 'air':
        ctx.fillStyle = this.gradient.air;
        ctx.beginPath();
        ctx.arc(-halfSize, halfSize, halfSize, 0, this.PI2, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(halfSize, halfSize, halfSize, 0, this.PI2, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -halfSize, halfSize, 0, this.PI2, false);
        ctx.fill();
        break;

      case 'fire':
        ctx.fillStyle = this.game.colours.fire.main;
        ctx.beginPath();
        ctx.arc(-thirdSize, thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        ctx.fillStyle = 'rgba(200, 100, 50, 0.5)';
        ctx.beginPath();
        ctx.arc(thirdSize, thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        ctx.fillStyle = 'rgba(250, 60, 50, 0.8)';
        ctx.beginPath();
        ctx.arc(0, -thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        break;

      default:
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, this.PI2, false);
        ctx.fillStyle = this.game.colours.player.main;
        ctx.fill();
        break;
    }
    ctx.restore();
  }
  this.emitter.render(this.position, ctx);
};
