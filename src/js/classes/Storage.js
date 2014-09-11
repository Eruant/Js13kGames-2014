var Storage = function () {

  this.active = !!window.localStorage;

  return this.active;

};

Storage.prototype.load = function (key) {

  if (!this.active) {
    return this.error();
  }

  return window.localStorage.getItem(key) || false;

};

Storage.prototype.save = function (key, value) {

  if (!this.active) {
    return this.error();
  }

  window.localStorage.setItem(key, value);

  return value;
};

Storage.prototype.error = function () {

  return 'No localStorage available';

};
