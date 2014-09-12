/**
 * Sets timers for you to use in transitions
 *
 * @class Transition
 * @property {boolean} active   - Is the timer updating or finished
 * @property {string} direction - `'forwards'` or `'backwards'`
 * @property {number} length    - milliseconds
 * @property {number} startTime - when the transition kicked off
 * @property {number} percent   - how far through the transition we are
 */
var Transition = function () {

  this.active = false;
  this.direction = 'forwards';
  this.length = 500;
  this.startTime = null;
  this.percent = 0;

};

/**
 * Set the transition off
 * @method Transition.start
 */
Transition.prototype.start = function () {

  this.active = true;
  this.percent = (this.direction === 'forwards') ? 0 : 1;
  this.startTime = new Date().getTime();
};

/**
 * Triggers when the transition ends
 * @method Transition.end
 */
Transition.prototype.end = function () {

  this.active = false;
  this.startTime = null;
};

/**
 * test to see if the transition has completed
 * @method Transition.update
 */
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

/**
 * Sets the direction the transition to go in
 * @method Transition.setDirection
 * @param {string} direction - `'forwards'` or `'backwards'`
 */
Transition.prototype.setDirection = function (direction) {

  if (direction !== 'forwards' && direction !== 'backwards') {
    return 'error';
  }

  this.direction = direction;
  return direction;
};
