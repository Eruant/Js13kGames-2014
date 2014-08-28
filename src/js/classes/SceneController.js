var SceneController = function () {

  this.states = {};
  this.currentState = null;
};

SceneController.prototype.add = function (key, state) {

  this.states[key] = state;

};

SceneController.prototype.start = function (key) {

  this.currentState = key;

};
