var Emitter = function (type, emit) {

  this.type = type || 'default';
  this.emit = emit || true;

  this.PI2 = Math.PI * 2;

  this.particleTypes = {};
  this.particles = new Array(100);

  this.addParicleType('earth', {
    colour: 'rgba(50, 255, 50, 0.2)',
    life: 50
  });
  this.addParicleType('air', {
    colour: 'rgba(255, 255, 255, 0.1)',
    life: 80
  });
  this.addParicleType('water', {
    colour: 'rgba(50, 50, 255, 0.2)',
    gravity: 0.1,
    maxSpeed: 3,
    life: 60
  });
  this.addParicleType('fire', {
    colour: 'rgba(255, 50, 50, 0.2)',
    gravity: -0.1,
    maxSpeed: 2,
    life: 40
  });

};

Emitter.prototype.update = function (type, position) {

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
      p.life--;
      p.speed.y += p.gravity;

      p.position.x += p.speed.x;
      p.position.y += p.speed.y;
    } else if (!addParticle) {
      addParticle = true;
      this.addParticle(position, i);
    }
  }

};

Emitter.prototype.render = function (position, ctx) {

  var i, len, p;

  i = 0;
  len = this.particles.length;
  for (; i < len; i++) {
    p = this.particles[i];

    if (p && p.life > 0) {
      ctx.fillStyle = p.colour;
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, (p.life / 10), 0, this.PI2, false);
      ctx.fill();
    } else {
      this.particleCount--;
    }
  }

};

Emitter.prototype.addParicleType = function (key, options) {

  var settings = {
    gravity: options.gravity || 0,
    colour: options.colour || 'rgba(0, 0, 0, 0.2)',
    maxSpeed: options.maxSpeed || 0.5,
    life: options.life || 100
  };

  this.particleTypes[key] = settings;
};

Emitter.prototype.addParticle = function (position, key) {

  if (this.type in this.particleTypes) {

    var particle = {
      position: {
        x: position.x,
        y: position.y
      },
      speed: {
        x: (Math.random() * this.particleTypes[this.type].maxSpeed) - (this.particleTypes[this.type].maxSpeed / 2),
        y: (Math.random() * this.particleTypes[this.type].maxSpeed) - (this.particleTypes[this.type].maxSpeed / 2)
      },
      gravity: this.particleTypes[this.type].gravity,
      life: this.particleTypes[this.type].life,
      colour: this.particleTypes[this.type].colour
    };

    this.particles[key] = particle;

  }

};
