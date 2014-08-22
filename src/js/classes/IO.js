var IO = function (element) {

  this.el = element;
  this.ongoingTouches = [];
  this.delegate = this;
};

IO.prototype.addEvents = function () {
  this.el.addEventListener('touchstart', this.delegate.handleEvent, false);
  this.el.addEventListener('touchmove', this.delegate.handleEvent, false);
  this.el.addEventListener('touchend', this.delegate.handleEvent, false);
  this.el.addEventListener('touchcancel', this.delegate.handleEvent, false);

  window.addEventListener('keydown', this.delegate.handleEvent.bind(this.delegate), true);
  window.addEventListener('keyup', this.delegate.handleEvent.bind(this.delegate), true);
};

IO.prototype.removeEvents = function () {
  this.el.removeEventListener('touchstart', this.delegate.handleEvent, false);
  this.el.removeEventListener('touchmove', this.delegate.handleEvent, false);
  this.el.removeEventListener('touchend', this.delegate.handleEvent, false);
  this.el.removeEventListener('touchcancel', this.delegate.handleEvent, false);

  window.removeEventListener('keydown', this.delegate.handleEvent.bind(this.delegate), true);
  window.removeEventListener('keyup', this.delegate.handleEvent.bind(this.delegate), true);
};

IO.prototype.handleEvent = function () {};
