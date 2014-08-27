var Emitter = function (type, emit) {

  this.type = type || 'default';
  this.emit = emit || true;

  this.particleTypes = {};
  this.particles = [];

  this.addParicleType('default', {});
};

Emitter.prototype.update = function (type) {

  if (type !== this.type) {
    this.type = type;
  }
};

Emitter.prototype.render = function (/*ctx*/) {

  if (this.emit) {
  }
};

Emitter.prototype.addParicleType = function (key, options) {

  var settings = {
    gravity: 0 || options.gravity
  };

  this.particleTypes[key] = settings;
};

Emitter.prototype.addParticle = function () {
  // add a new particle
};
