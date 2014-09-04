var Transition = function () {

  this.active = false;
  this.direction = 'forwards';
  this.length = 500;
  this.startTime = null;
  this.percent = 0;

};

Transition.prototype.start = function () {

  this.active = true;
  this.percent = 0;
  this.startTime = new Date().getTime();
};

Transition.prototype.end = function () {

  this.active = false;
  this.startTime = null;
};

Transition.prototype.update = function () {

  var now;

  if (this.active) {

    now = new Date().getTime();
    this.percent = (now - this.startTime) / this.length;

    if (this.direction === 'backwards') {
      this.percent = 1 - this.percent;
    }

    if (this.direction === 'forwards' && this.percent >= 1 ||
        this.direction === 'backwards' && this.percent <= 0) {
      this.end();
    }

  }

};

Transition.prototype.setDirection = function (direction) {

  if (direction !== 'forwards' && direction !== 'backwards') {
    return 'error';
  }

  this.direction = direction;
  return direction;
};
