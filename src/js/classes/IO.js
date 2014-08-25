var IO = function (element) {

  this.el = element;
  this.ongoingTouches = [];
  this.delegate = this;

  this.addEvents();
  this.activeInput = {
    earth: false,
    water: false,
    air: false,
    fire: false,
    up: false,
    down: false,
    left: false,
    right: false
  };
};

IO.prototype.addEvents = function () {
  this.el.addEventListener('touchstart', this.delegate.handleEvent.bind(this.delegate), false);
  this.el.addEventListener('touchmove', this.delegate.handleEvent.bind(this.delegate), false);
  this.el.addEventListener('touchend', this.delegate.handleEvent.bind(this.delegate), false);
  this.el.addEventListener('touchcancel', this.delegate.handleEvent.bind(this.delegate), false);

  window.addEventListener('keydown', this.delegate.handleEvent.bind(this.delegate), true);
  window.addEventListener('keyup', this.delegate.handleEvent.bind(this.delegate), true);
};

IO.prototype.removeEvents = function () {
  this.el.removeEventListener('touchstart', this.delegate.handleEvent.bind(this.delegate), false);
  this.el.removeEventListener('touchmove', this.delegate.handleEvent.bind(this.delegate), false);
  this.el.removeEventListener('touchend', this.delegate.handleEvent.bind(this.delegate), false);
  this.el.removeEventListener('touchcancel', this.delegate.handleEvent.bind(this.delegate), false);

  window.removeEventListener('keydown', this.delegate.handleEvent.bind(this.delegate), true);
  window.removeEventListener('keyup', this.delegate.handleEvent.bind(this.delegate), true);
};

IO.prototype.handleEvent = function (event) {

  switch (event.type) {
    case 'keydown':
      this.setKeyState(event.keyCode, true);
      break;
    case 'keyup':
      this.setKeyState(event.keyCode, false);
      break;
    case 'touchstart':
      this.handleTouchStart(event);
      break;
    case 'touchmove':
      this.handleTouchMove(event);
      break;
    case 'touchend':
    case 'touchcancel':
      this.handleTouchEnd(event);
      break;
  }

};

IO.prototype.copyTouch = function (touch, oldTouch) {
  return {
    identifier: touch.identifier,
    startX: oldTouch ? oldTouch.startX : touch.pageX,
    startY: oldTouch ? oldTouch.startY : touch.pageY,
    pageX: touch.pageX,
    pageY: touch.pageY
  };
};

IO.prototype.ongoingTouchIndexById = function (idToFind) {

  var i, len, id;

  i = 0;
  len = this.ongoingTouches.length;
  for (; i < len; i++) {
    id = this.ongoingTouches[i].identifier;

    if (id === idToFind) {
      return i;
    }
  }

  return -1;
};

IO.prototype.handleTouchStart = function (event) {
  event.preventDefault();

  var i, len, touches;

  touches = event.changedTouches;
  i = 0;
  len = touches.length;
  for (; i < len; i++) {
    this.ongoingTouches.push(this.copyTouch(touches[i]));
  }
};

IO.prototype.handleTouchMove = function (event) {
  event.preventDefault();

  var i, len, touches, idx;

  touches = event.changedTouches;
  i = 0;
  len = touches.length;
  for (; i < len; i++) {
    idx = this.ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i], this.ongoingTouches[idx]));
    }
  }

  this.updateActiveInput();
};

IO.prototype.handleTouchEnd = function (event) {
  event.preventDefault();

  var i, len, touches, idx;

  touches = event.changedTouches;
  i = 0;
  len = touches.length;
  for (; i < len; i++) {
    idx = this.ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      this.ongoingTouches.splice(idx, 1);
    }
  }

  this.updateActiveInput();
};

IO.prototype.updateActiveInput = function () {

  var directionControl, stateControl, dx, dy, range;

  range = 32;

  // update movement
  directionControl = this.ongoingTouches[0] || false;
  if (directionControl) {
    dx = directionControl.pageX - directionControl.startX;
    dy = directionControl.pageY - directionControl.startY;
    if (dx > range) {
      this.activeInput.left = false;
      this.activeInput.right = true;
    } else if (dx < -range) {
      this.activeInput.left = true;
      this.activeInput.right = false;
    } else {
      this.activeInput.left = this.activeInput.right = false;
    }

    if (dy > range) {
      this.activeInput.up = false;
      this.activeInput.down = true;
    } else if (dy < -range) {
      this.activeInput.up = true;
      this.activeInput.down = false;
    } else {
      this.activeInput.up = this.activeInput.down = false;
    }
  }

  // update state
  stateControl = this.ongoingTouches[1] || false;
  if (stateControl) {
    dx = stateControl.pageX - stateControl.startX;
    dy = stateControl.pageY - stateControl.startY;

    this.activeInput.earth = false;
    this.activeInput.water = false;
    this.activeInput.air = false;
    this.activeInput.fire = false;

    if (dx > range) {
      if (dx > dy && dx > -dy) {
        this.activeInput.earth = true;
      }
    } else if (dx < -range) {
      if (-dx > dy && -dx > -dy) {
        this.activeInput.air = true;
      }
    } else if (dy > range) {
      if (dy > dx && dy > -dx) {
        this.activeInput.water = true;
      }
    } else if (dy < -range) {
      if (-dy > dx && -dy > -dx) {
        this.activeInput.fire = true;
      }
    }
  }
};

IO.prototype.setKeyState = function (code, value) {

  switch (code) {
    case 49: // 1
      if (value) {
        this.activeInput.earth = true;
        this.activeInput.water = false;
        this.activeInput.air = false;
        this.activeInput.fire = false;
      } else {
        this.activeInput.earth = false;
      }
      break;
    case 50: // 2
      if (value) {
        this.activeInput.earth = false;
        this.activeInput.water = true;
        this.activeInput.air = false;
        this.activeInput.fire = false;
      } else {
        this.activeInput.water = false;
      }
      break;
    case 51: // 3
      if (value) {
        this.activeInput.earth = false;
        this.activeInput.water = false;
        this.activeInput.air = true;
        this.activeInput.fire = false;
      } else {
        this.activeInput.air = false;
      }
      break;
    case 52: // 4
      if (value) {
        this.activeInput.earth = false;
        this.activeInput.water = false;
        this.activeInput.air = false;
        this.activeInput.fire = true;
      } else {
        this.activeInput.fire = false;
      }
      break;
    case 37: // left
      this.activeInput.left = value;
      break;
    case 39: // right
      this.activeInput.right = value;
      break;
    case 38: // up
      this.activeInput.up = value;
      break;
    case 40: // down
      this.activeInput.down = value;
      break;
  }
};
