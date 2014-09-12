/**
 * This class deals with user Input and Output
 *
 * @class IO
 * @param {object} element    - the element we are detecting events on
 * @param {object} game       - the main game element
 * @param {function} delegate - function that will handle the events
 *
 * @property {object} el            - the element we are detecting events on
 * @property {array} ongoingTouches - list of pointers (fingers)
 * @property {function} delegate    - function that will hangle the events
 * @property {object} game          - the main game element
 * @property {boolean} pauseTrigger - stores when we have triggered pause event
 * @property {object} activeInput   - stores which inputs are active
 */
var IO = function (element, game, delegate) {

  this.el = element;
  this.ongoingTouches = [];
  this.delegate = delegate || this;
  this.game = game;

  this.pauseTrigger = false;

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

/**
 * Adds the event listeners to the `el`
 * @method IO.addEvents
 */
IO.prototype.addEvents = function () {
  
  if (this.game.isTouchDevice) {
    this.el.addEventListener('touchstart', this.delegate.handleEvent.bind(this.delegate), false);
    this.el.addEventListener('touchmove', this.delegate.handleEvent.bind(this.delegate), false);
    this.el.addEventListener('touchend', this.delegate.handleEvent.bind(this.delegate), false);
    this.el.addEventListener('touchcancel', this.delegate.handleEvent.bind(this.delegate), false);
  }
  
  window.addEventListener('keydown', this.delegate.handleEvent.bind(this.delegate), true);
  window.addEventListener('keyup', this.delegate.handleEvent.bind(this.delegate), true);
};

/**
 * Removes the event listeners from the `el`
 * @method IO.removeEvents
 */
IO.prototype.removeEvents = function () {

  if (this.game.isTouchDevice) {
    this.el.removeEventListener('touchstart', this.delegate.handleEvent.bind(this.delegate), false);
    this.el.removeEventListener('touchmove', this.delegate.handleEvent.bind(this.delegate), false);
    this.el.removeEventListener('touchend', this.delegate.handleEvent.bind(this.delegate), false);
    this.el.removeEventListener('touchcancel', this.delegate.handleEvent.bind(this.delegate), false);
  }

  window.removeEventListener('keydown', this.delegate.handleEvent.bind(this.delegate), true);
  window.removeEventListener('keyup', this.delegate.handleEvent.bind(this.delegate), true);
};

/**
 * Handles all events
 * @method IO.handleEvent
 * @param {object} event - an event object
 */
IO.prototype.handleEvent = function (event) {

  if (this.game.scene.state === 'menu') {

    if ((event.type === 'keydown' && event.keyCode === 13) || event.type === 'touchend') {
      this.game.sounds.play('menu');
      this.game.scene.menuTransition.setDirection('backwards');
      this.game.scene.menuTransition.start();
      this.game.scene.state = 'transition-play';
    }
    return;
  }

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

/**
 * Duplicates the touch event data, while maintaining start position
 * @method IO.copyTouch
 */
IO.prototype.copyTouch = function (touch, oldTouch) {
  return {
    identifier: touch.identifier,
    startX: oldTouch ? oldTouch.startX : touch.pageX,
    startY: oldTouch ? oldTouch.startY : touch.pageY,
    pageX: touch.pageX,
    pageY: touch.pageY
  };
};

/**
 * Searches for any ongoing touches and returns the array key
 * @method IO.ongoingTouchIndexById
 * @param {number} idToFind - The existing ID to search for
 */
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

/**
 * Process a touch start event
 * @method IO.handleTouchStart
 * @param {object} event - an event object
 */
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

/**
 * Process a touch move event
 * @method IO.handleTouchMove
 * @param {object} event - an event object
 */
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

/**
 * Process a touch end event
 * @method IO.handleTouchEnd
 * @param {object} event - an event object
 */
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

/**
 * Takes the touch input events registered and translates them into values
 * @method IO.updateActiveInput
 */
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

    // TODO check these ranges
    // we should go for up, down, left and right
    // looks like this currently goes in the diagonals
    if (dx > range) {

      if (dx > dy && dx > -dy) {
        // right
        this.activeInput.water = true;
      }
    } else if (dx < -range) {
      if (-dx > dy && -dx > -dy) {
        // left 
        this.activeInput.earth = true;
      }
    } else if (dy > range) {
      if (dy > dx && dy > -dx) {
        // down
        this.activeInput.fire = true;
      }
    } else if (dy < -range) {
      if (-dy > dx && -dy > -dx) {
        // up
        this.activeInput.air = true;
      }
    }
  }
};

/**
 * Updates the main game to change to the pause state
 * @method IO.pause
 */
IO.prototype.pause = function () {

  var _this = this;

  if (!this.pauseTrigger) {
    this.game.sounds.play('menu');

    if (this.game.scene.state === 'play') {
      this.game.scene.state = 'pause';
    } else {
      this.game.scene.state = 'play';
    }

    this.pauseTrigger = true;
    window.setTimeout(function () {
      _this.pauseTrigger = false;
    }, 250);

  }

};

/**
 * Takes the keyboard input events registed and translates them into value
 * @method IO.setKeyState
 * @param {number} code - key code
 * @param {boolean} value - set if this is being switch on or off
 */
IO.prototype.setKeyState = function (code, value) {

  switch (code) {
    case 27:
      this.pause();
      break;
    case 49: // 1 == earth
      if (value) {
        this.activeInput.earth = true;
        this.activeInput.water = false;
        this.activeInput.air = false;
        this.activeInput.fire = false;
      } else {
        this.activeInput.earth = false;
      }
      break;
    case 50: // 2 == air
      if (value) {
        this.activeInput.earth = false;
        this.activeInput.water = false;
        this.activeInput.air = true;
        this.activeInput.fire = false;
      } else {
        this.activeInput.air = false;
      }
      break;
    case 51: // 3 == water
      if (value) {
        this.activeInput.earth = false;
        this.activeInput.water = true;
        this.activeInput.air = false;
        this.activeInput.fire = false;
      } else {
        this.activeInput.water = false;
      }
      break;
    case 52: // 4 == fire
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
