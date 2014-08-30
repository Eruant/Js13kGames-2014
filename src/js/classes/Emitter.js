var Emitter = function (type, emit) {

  this.type = type || 'default';
  this.emit = emit || true;

  this.PI2 = Math.PI * 2;
  
  this.particleCount = 0;
  this.maxParticles = 100;

  this.particleTypes = {};
  this.particles = [];

  this.addParicleType('earth', {
    colour: 'rgba(50, 255, 50, 0.2)'
  });
  this.addParicleType('air', {
    colour: 'rgba(255, 255, 255, 0.2)'
  });
  this.addParicleType('water', {
    colour: 'rgba(50, 50, 255, 0.2)'
  });
  this.addParicleType('fire', {
    colour: 'rgba(255, 50, 50, 0.2)'
  });

};

Emitter.prototype.update = function (type, position) {

  var i, len, p;

  if (type !== this.type) {
    this.type = type;
  }

  if (this.emit && this.particleCount < this.maxParticles) {
    this.particleCount++;
    this.addParticle(position);
  }

  i = 0;
  len = this.particles.length;
  for (; i < len; i++) {
    p = this.particles[i];

    if (p.life > 0) {
      p.life--;
      p.speed.y += p.gravity;

      p.position.x += p.speed.x;
      p.position.y += p.speed.y;
    }
  }

};

Emitter.prototype.render = function (position, ctx) {

  var i, len, p;

  i = 0;
  len = this.particles.length;
  for (; i < len; i++) {
    p = this.particles[i];
    if (p.life > 0) {
      ctx.fillStyle = p.colour;
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, 3, 0, this.PI2, false);
      ctx.fill();
    } else if (this.emit) {
      // this needs looking at
      this.addParticle(position, i);
    }
  }

};

Emitter.prototype.addParicleType = function (key, options) {

  var settings = {
    gravity: options.gravity || 0,
    colour: options.colour || 'rgba(0, 0, 0, 0.2)'
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
        x: (Math.random() * 2) - 1,
        y: (Math.random() * 2) -1
      },
      gravity: -0.05,
      life: 30,
      colour: this.particleTypes[this.type].colour
    };

    if (this.particles.length < this.maxParticles) {

      this.particles.push(particle);

    } else if (key) {

      this.particles[key] = particle;

    }

  }

};
