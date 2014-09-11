var Storage = function () {

  this.active = !!window.localStorage;

  return this.active;

};

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

Storage.prototype.save = function (key, value) {

  if (!this.active) {
    return this.error();
  }

  window.localStorage.setItem(key, JSON.stringify(value));

  return value;
};

Storage.prototype.error = function () {

  return 'No localStorage available';

};
