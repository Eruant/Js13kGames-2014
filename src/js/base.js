/*globals ArcadeAudio*/

/**
 * Sounds generated at [as3sfxr](http://www.superflashbros.net/as3sfxr/)
 **/

var app = {
  init: function () {
    var aa = new ArcadeAudio();
    aa.add('powerup', 10, [
      [0, , 0.01, , 0.4384, 0.2, , 0.12, 0.28, 1, 0.65, , , 0.0419, , , , , 1, , , , , 0.3]
    ]);

    aa.play('powerup');
  }
};

window.document.onload = app.init();
