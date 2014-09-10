/*globals Audio, jsfxr*/

/**
 * @class ArcadeAudio
 * @requires jsfxr
 *
 * This class allows you to add and play sounds.
 *
 * ## Usage
 * Sounds can be generated at [as3sfxr](http://www.superflashbros.net/as3sfxr/)
 *
 * You can then copy and paste the sound array into the add function
 *
 *     var aa = new ArcadeAudio();
 *     aa.add('powerup', 10, [
 *         [0, , 0.01, , 0.4384, 0.2, , 0.12, 0.28, 1, 0.65, , , 0.0419, , , , , 1, , , , , 0.3]
 *     ]);
 *     aa.play('powerup');
 */
var ArcadeAudio = function () {
  this.sounds = {};
};

/**
 * @method add
 * @parm key {String} reference to the sound object
 * @param count {Number} size of sound pool
 * @param setting {Array} sound settings imported from as3sfxr
 */
ArcadeAudio.prototype.add = function (key, count, settings) {

  var i, audio;

  this.sounds[key] = {
    tick: 0,
    count: count,
    pool: []
  };

  i = 0;
  for (; i < count; i++) {
    audio = new Audio();
    audio.src = jsfxr(settings);
    this.sounds[key].pool.push(audio);
  }

};

/**
 * @method play
 * @param key {String} start playback of stored sound object
 */
ArcadeAudio.prototype.play = function (key) {
  
  var sound = this.sounds[key];

  sound.pool[sound.tick].play();
  sound.tick = (sound.tick < sound.count - 1) ? sound.tick + 1 : 0;
};
