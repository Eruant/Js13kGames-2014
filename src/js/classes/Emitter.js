/*globals Colours*/

var Emitter = function (ctx, type, emit) {

  this.colours = new Colours();
  this.gradient = {
    water: ctx.createRadialGradient(-2, -2, 0, 0, 0, 6),
    smoke: ctx.createRadialGradient(2, 2, 0, 0, 0, 10)
  };

  this.gradient.water.addColorStop(0.000, 'rgba(255, 255, 255, 0.7)');
  this.gradient.water.addColorStop(0.381, 'rgba(0, 95, 191, 0.3)');
  this.gradient.water.addColorStop(0.549, 'rgba(0, 95, 191, 0.3)');
  this.gradient.water.addColorStop(0.755, 'rgba(0, 127, 255, 0.3)');
  this.gradient.water.addColorStop(1.000, 'rgba(0, 63, 127, 0.3)');

  this.gradient.smoke.addColorStop(0, 'rgba(100, 100, 100, 0.1)');
  this.gradient.smoke.addColorStop(0.5, 'rgba(0, 0, 0, 0)');

  this.type = type || 'default';
  this.emit = emit || true;

  this.PI = Math.PI;
  this.PI2 = this.PI * 2;

  this.particleTypes = {};
  this.particles = new Array(300);

  this.addParicleType('earth', {
    colour: this.colours.earth.light,
    life: 50,
    rotate: 20
  });
  this.addParicleType('air', {
    colour: this.colours.air.light,
    life: 80
  });
  this.addParicleType('water', {
    colour: this.colours.water.light,
    gravity: 0.1,
    maxSpeed: 3,
    life: 60
  });
  this.addParicleType('fire', {
    colour: this.colours.fire.light,
    gravity: -0.1,
    maxSpeed: 2,
    life: 40,
    rotate: 10
  });

};

Emitter.prototype.update = function (type, position, size) {

  var i, len, p, addParticle;

  addParticle = false;

  if (type !== this.type) {
    this.type = type;
  }

  i = 0;
  len = this.particles.length;
  for (; i < len; i++) {
    p = this.particles[i];

    if (p && p.life > 0) {
      this.updateParticle(p);
    } else if (!addParticle) {
      addParticle = true;
      this.addParticle({
        x: position.x + (Math.random() * size) - (size * 0.5),
        y: position.y + (Math.random() * size) - (size * 0.5)
      }, i);
    }
  }

};

Emitter.prototype.updateParticle = function (particle) {

  particle.life--;
  particle.speed.y += particle.gravity;

  particle.position.x += particle.speed.x;
  particle.position.y += particle.speed.y;
  particle.angle += particle.rotate;

};

Emitter.prototype.render = function (position, ctx) {

  var i, len, p;

  i = 0;
  len = this.particles.length;
  for (; i < len; i++) {
    p = this.particles[i];

    if (p && p.life > 0) {
      this.drawParticle(ctx, p);
    } else {
      this.particleCount--;
    }
  }
};

Emitter.prototype.drawParticle = function (ctx, particle) {

  ctx.save();
  ctx.translate(particle.position.x, particle.position.y);
  ctx.rotate(particle.angle * this.PI / 180);

  ctx.beginPath();

  switch (particle.type) {
    case 'earth':
      ctx.translate(-4, -4);
      ctx.scale(particle.life / 20, particle.life / 20);
      ctx.bezierCurveTo(0, 0, 3, 0, 3, 3);
      ctx.bezierCurveTo(3, 3, 0, 3, 0, 0);
      break;
    case 'air':
      ctx.arc(0, 0, (particle.life / 10), 0, this.PI2, false);
      break;
    case 'water':
      ctx.arc(0, 0, (particle.life / 10), 0, this.PI2, false);
      break;
    case 'fire':
      ctx.arc(0, 0, (particle.life / 10), 0, this.PI2, false);
      break;
  }

  ctx.fillStyle = particle.colour;
  ctx.fill();

  ctx.restore();

};

Emitter.prototype.addParicleType = function (key, options) {

  var settings = {
    gravity: options.gravity || 0,
    colour: options.colour || 'rgba(0, 0, 0, 0.2)',
    maxSpeed: options.maxSpeed || 0.5,
    life: options.life || 100,
    rotate: options.rotate || 0
  };

  this.particleTypes[key] = settings;
};

Emitter.prototype.addParticle = function (position, key) {

  if (this.type in this.particleTypes) {

    var particle, colour, life, random, gravity, speedX, speedY, angle;

    life = this.particleTypes[this.type].life;
    gravity = this.particleTypes[this.type].gravity;
    speedX = (Math.random() * this.particleTypes[this.type].maxSpeed) - (this.particleTypes[this.type].maxSpeed / 2);
    speedY = (Math.random() * this.particleTypes[this.type].maxSpeed) - (this.particleTypes[this.type].maxSpeed / 2);
    angle = 0;

    switch (this.type) {

      case 'earth':
        random = Math.random();
        if (random > 0.8) {
          colour = 'rgb(50, 150, 50)';
        } else if (random > 0.5) {
          colour = 'rgb(50, 100, 50)';
        } else {
          colour = 'rgb(50, 80, 50)';
        }

        angle = Math.floor(random * 360);
        break;

      case 'water':
        life *= 0.6;
        colour = this.gradient.water;
        break;

      case 'fire':
        random = Math.random();
        if (random > 0.8) {
          life *= 0.5;
          colour = 'rgba(250, 60, 50, 0.8)';
        } else if (random > 0.6) {
          life *= 0.5;
          colour = this.particleTypes[this.type].colour;
        } else if (random > 0.4) {
          life *= 0.6;
          colour = 'rgba(200, 100, 50, 0.5)';
        } else {
          life *= 2;
          colour = this.gradient.smoke;
          gravity *= 0.2;
          speedX *= 0.5;
          speedY *= 0.5;
        }
        break;

      default:
        colour = this.particleTypes[this.type].colour;
    }

    particle = {
      type: this.type,
      position: {
        x: position.x,
        y: position.y
      },
      speed: {
        x: speedX,
        y: speedY
      },
      gravity: gravity,
      angle: angle,
      life: life,
      colour: colour,
      rotate: (Math.random() * this.particleTypes[this.type].rotate) - (this.particleTypes[this.type].rotate / 2)
    };

    this.particles[key] = particle;

  }

};
