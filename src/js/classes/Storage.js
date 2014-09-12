/**
 * Saves data to local storage
 *
 * @class Storage
 *
 * @property {boolean} active - sets if localStorage is available
 */
var Storage = function (isTouchDevice) {

  this.active = !isTouchDevice || !!window.localStorage;

  return this.active;

};

/**
 * Loads data
 *
 * @method Storage.load
 * @param {string} key
 */
Storage.prototype.load = function (key) {

  var value;

  if (!this.active) {
    return this.error();
  }

  value = window.localStorage.getItem(key);

  if (!value || typeof value === 'undefined' || value === 'undefined') {
    return false;
  }

  return JSON.parse(value);

};

/**
 * Saves data
 *
 * @method Storage.save
 * @param {string} key
 * @param {object} value
 */
Storage.prototype.save = function (key, value) {

  if (!this.active) {
    return this.error();
  }

  window.localStorage.setItem(key, JSON.stringify(value));

  return value;
};

/**
 * Returns the generic message
 * @method Storage.error
 */
Storage.prototype.error = function () {

  return 'No localStorage available';

};
