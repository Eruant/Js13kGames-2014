/**
 * SfxrParams
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */
/** @constructor */
function SfxrParams() {
  //--------------------------------------------------------------------------
  //
  //  Settings String Methods
  //
  //--------------------------------------------------------------------------

  /**
   * Parses a settings array into the parameters
   * @param array Array of the settings values, where elements 0 - 23 are
   *                a: waveType
   *                b: attackTime
   *                c: sustainTime
   *                d: sustainPunch
   *                e: decayTime
   *                f: startFrequency
   *                g: minFrequency
   *                h: slide
   *                i: deltaSlide
   *                j: vibratoDepth
   *                k: vibratoSpeed
   *                l: changeAmount
   *                m: changeSpeed
   *                n: squareDuty
   *                o: dutySweep
   *                p: repeatSpeed
   *                q: phaserOffset
   *                r: phaserSweep
   *                s: lpFilterCutoff
   *                t: lpFilterCutoffSweep
   *                u: lpFilterResonance
   *                v: hpFilterCutoff
   *                w: hpFilterCutoffSweep
   *                x: masterVolume
   * @return If the string successfully parsed
   */
  this.setSettings = function(values)
  {
    for ( var i = 0; i < 24; i++ )
    {
      this[String.fromCharCode( 97 + i )] = values[i] || 0;
    }

    // I moved this here from the reset(true) function
    if (this['c'] < .01) {
      this['c'] = .01;
    }

    var totalTime = this['b'] + this['c'] + this['e'];
    if (totalTime < .18) {
      var multiplier = .18 / totalTime;
      this['b']  *= multiplier;
      this['c'] *= multiplier;
      this['e']   *= multiplier;
    }
  }
}

/**
 * SfxrSynth
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */
/** @constructor */
function SfxrSynth() {
  // All variables are kept alive through function closures

  //--------------------------------------------------------------------------
  //
  //  Sound Parameters
  //
  //--------------------------------------------------------------------------

  this._params = new SfxrParams();  // Params instance

  //--------------------------------------------------------------------------
  //
  //  Synth Variables
  //
  //--------------------------------------------------------------------------

  var _envelopeLength0, // Length of the attack stage
      _envelopeLength1, // Length of the sustain stage
      _envelopeLength2, // Length of the decay stage

      _period,          // Period of the wave
      _maxPeriod,       // Maximum period before sound stops (from minFrequency)

      _slide,           // Note slide
      _deltaSlide,      // Change in slide

      _changeAmount,    // Amount to change the note by
      _changeTime,      // Counter for the note change
      _changeLimit,     // Once the time reaches this limit, the note changes

      _squareDuty,      // Offset of center switching point in the square wave
      _dutySweep;       // Amount to change the duty by

  //--------------------------------------------------------------------------
  //
  //  Synth Methods
  //
  //--------------------------------------------------------------------------

  /**
   * Resets the runing variables from the params
   * Used once at the start (total reset) and for the repeat effect (partial reset)
   */
  this.reset = function() {
    // Shorter reference
    var p = this._params;

    _period       = 100 / (p['f'] * p['f'] + .001);
    _maxPeriod    = 100 / (p['g']   * p['g']   + .001);

    _slide        = 1 - p['h'] * p['h'] * p['h'] * .01;
    _deltaSlide   = -p['i'] * p['i'] * p['i'] * .000001;

    if (!p['a']) {
      _squareDuty = .5 - p['n'] / 2;
      _dutySweep  = -p['o'] * .00005;
    }

    _changeAmount =  1 + p['l'] * p['l'] * (p['l'] > 0 ? -.9 : 10);
    _changeTime   = 0;
    _changeLimit  = p['m'] == 1 ? 0 : (1 - p['m']) * (1 - p['m']) * 20000 + 32;
  }

  // I split the reset() function into two functions for better readability
  this.totalReset = function() {
    this.reset();

    // Shorter reference
    var p = this._params;

    // Calculating the length is all that remained here, everything else moved somewhere
    _envelopeLength0 = p['b']  * p['b']  * 100000;
    _envelopeLength1 = p['c'] * p['c'] * 100000;
    _envelopeLength2 = p['e']   * p['e']   * 100000 + 12;
    // Full length of the volume envelop (and therefore sound)
    // Make sure the length can be divided by 3 so we will not need the padding "==" after base64 encode
    return ((_envelopeLength0 + _envelopeLength1 + _envelopeLength2) / 3 | 0) * 3;
  }

  /**
   * Writes the wave to the supplied buffer ByteArray
   * @param buffer A ByteArray to write the wave to
   * @return If the wave is finished
   */
  this.synthWave = function(buffer, length) {
    // Shorter reference
    var p = this._params;

    // If the filters are active
    var _filters = p['s'] != 1 || p['v'],
        // Cutoff multiplier which adjusts the amount the wave position can move
        _hpFilterCutoff = p['v'] * p['v'] * .1,
        // Speed of the high-pass cutoff multiplier
        _hpFilterDeltaCutoff = 1 + p['w'] * .0003,
        // Cutoff multiplier which adjusts the amount the wave position can move
        _lpFilterCutoff = p['s'] * p['s'] * p['s'] * .1,
        // Speed of the low-pass cutoff multiplier
        _lpFilterDeltaCutoff = 1 + p['t'] * .0001,
        // If the low pass filter is active
        _lpFilterOn = p['s'] != 1,
        // masterVolume * masterVolume (for quick calculations)
        _masterVolume = p['x'] * p['x'],
        // Minimum frequency before stopping
        _minFreqency = p['g'],
        // If the phaser is active
        _phaser = p['q'] || p['r'],
        // Change in phase offset
        _phaserDeltaOffset = p['r'] * p['r'] * p['r'] * .2,
        // Phase offset for phaser effect
        _phaserOffset = p['q'] * p['q'] * (p['q'] < 0 ? -1020 : 1020),
        // Once the time reaches this limit, some of the    iables are reset
        _repeatLimit = p['p'] ? ((1 - p['p']) * (1 - p['p']) * 20000 | 0) + 32 : 0,
        // The punch factor (louder at begining of sustain)
        _sustainPunch = p['d'],
        // Amount to change the period of the wave by at the peak of the vibrato wave
        _vibratoAmplitude = p['j'] / 2,
        // Speed at which the vibrato phase moves
        _vibratoSpeed = p['k'] * p['k'] * .01,
        // The type of wave to generate
        _waveType = p['a'];

    var _envelopeLength      = _envelopeLength0,     // Length of the current envelope stage
        _envelopeOverLength0 = 1 / _envelopeLength0, // (for quick calculations)
        _envelopeOverLength1 = 1 / _envelopeLength1, // (for quick calculations)
        _envelopeOverLength2 = 1 / _envelopeLength2; // (for quick calculations)

    // Damping muliplier which restricts how fast the wave position can move
    var _lpFilterDamping = 5 / (1 + p['u'] * p['u'] * 20) * (.01 + _lpFilterCutoff);
    if (_lpFilterDamping > .8) {
      _lpFilterDamping = .8;
    }
    _lpFilterDamping = 1 - _lpFilterDamping;

    var _finished = false,     // If the sound has finished
        _envelopeStage    = 0, // Current stage of the envelope (attack, sustain, decay, end)
        _envelopeTime     = 0, // Current time through current enelope stage
        _envelopeVolume   = 0, // Current volume of the envelope
        _hpFilterPos      = 0, // Adjusted wave position after high-pass filter
        _lpFilterDeltaPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
        _lpFilterOldPos,       // Previous low-pass wave position
        _lpFilterPos      = 0, // Adjusted wave position after low-pass filter
        _periodTemp,           // Period modified by vibrato
        _phase            = 0, // Phase through the wave
        _phaserInt,            // Integer phaser offset, for bit maths
        _phaserPos        = 0, // Position through the phaser buffer
        _pos,                  // Phase expresed as a Number from 0-1, used for fast sin approx
        _repeatTime       = 0, // Counter for the repeats
        _sample,               // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
        _superSample,          // Actual sample writen to the wave
        _vibratoPhase     = 0; // Phase through the vibrato sine wave

    // Buffer of wave values used to create the out of phase second wave
    var _phaserBuffer = new Array(1024),
        // Buffer of random values used to generate noise
        _noiseBuffer  = new Array(32);
    for (var i = _phaserBuffer.length; i--; ) {
      _phaserBuffer[i] = 0;
    }
    for (var i = _noiseBuffer.length; i--; ) {
      _noiseBuffer[i] = Math.random() * 2 - 1;
    }

    for (var i = 0; i < length; i++) {
      if (_finished) {
        return i;
      }

      // Repeats every _repeatLimit times, partially resetting the sound parameters
      if (_repeatLimit) {
        if (++_repeatTime >= _repeatLimit) {
          _repeatTime = 0;
          this.reset();
        }
      }

      // If _changeLimit is reached, shifts the pitch
      if (_changeLimit) {
        if (++_changeTime >= _changeLimit) {
          _changeLimit = 0;
          _period *= _changeAmount;
        }
      }

      // Acccelerate and apply slide
      _slide += _deltaSlide;
      _period *= _slide;

      // Checks for frequency getting too low, and stops the sound if a minFrequency was set
      if (_period > _maxPeriod) {
        _period = _maxPeriod;
        if (_minFreqency > 0) {
          _finished = true;
        }
      }

      _periodTemp = _period;

      // Applies the vibrato effect
      if (_vibratoAmplitude > 0) {
        _vibratoPhase += _vibratoSpeed;
        _periodTemp *= 1 + Math.sin(_vibratoPhase) * _vibratoAmplitude;
      }

      _periodTemp |= 0;
      if (_periodTemp < 8) {
        _periodTemp = 8;
      }

      // Sweeps the square duty
      if (!_waveType) {
        _squareDuty += _dutySweep;
        if (_squareDuty < 0) {
          _squareDuty = 0;
        } else if (_squareDuty > .5) {
          _squareDuty = .5;
        }
      }

      // Moves through the different stages of the volume envelope
      if (++_envelopeTime > _envelopeLength) {
        _envelopeTime = 0;

        switch (++_envelopeStage)  {
          case 1:
            _envelopeLength = _envelopeLength1;
            break;
          case 2:
            _envelopeLength = _envelopeLength2;
        }
      }

      // Sets the volume based on the position in the envelope
      switch (_envelopeStage) {
        case 0:
          _envelopeVolume = _envelopeTime * _envelopeOverLength0;
          break;
        case 1:
          _envelopeVolume = 1 + (1 - _envelopeTime * _envelopeOverLength1) * 2 * _sustainPunch;
          break;
        case 2:
          _envelopeVolume = 1 - _envelopeTime * _envelopeOverLength2;
          break;
        case 3:
          _envelopeVolume = 0;
          _finished = true;
      }

      // Moves the phaser offset
      if (_phaser) {
        _phaserOffset += _phaserDeltaOffset;
        _phaserInt = _phaserOffset | 0;
        if (_phaserInt < 0) {
          _phaserInt = -_phaserInt;
        } else if (_phaserInt > 1023) {
          _phaserInt = 1023;
        }
      }

      // Moves the high-pass filter cutoff
      if (_filters && _hpFilterDeltaCutoff) {
        _hpFilterCutoff *= _hpFilterDeltaCutoff;
        if (_hpFilterCutoff < .00001) {
          _hpFilterCutoff = .00001;
        } else if (_hpFilterCutoff > .1) {
          _hpFilterCutoff = .1;
        }
      }

      _superSample = 0;
      for (var j = 8; j--; ) {
        // Cycles through the period
        _phase++;
        if (_phase >= _periodTemp) {
          _phase %= _periodTemp;

          // Generates new random noise for this period
          if (_waveType == 3) {
            for (var n = _noiseBuffer.length; n--; ) {
              _noiseBuffer[n] = Math.random() * 2 - 1;
            }
          }
        }

        // Gets the sample from the oscillator
        switch (_waveType) {
          case 0: // Square wave
            _sample = ((_phase / _periodTemp) < _squareDuty) ? .5 : -.5;
            break;
          case 1: // Saw wave
            _sample = 1 - _phase / _periodTemp * 2;
            break;
          case 2: // Sine wave (fast and accurate approx)
            _pos = _phase / _periodTemp;
            _pos = (_pos > .5 ? _pos - 1 : _pos) * 6.28318531;
            _sample = 1.27323954 * _pos + .405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
            _sample = .225 * ((_sample < 0 ? -1 : 1) * _sample * _sample  - _sample) + _sample;
            break;
          case 3: // Noise
            _sample = _noiseBuffer[Math.abs(_phase * 32 / _periodTemp | 0)];
        }

        // Applies the low and high pass filters
        if (_filters) {
          _lpFilterOldPos = _lpFilterPos;
          _lpFilterCutoff *= _lpFilterDeltaCutoff;
          if (_lpFilterCutoff < 0) {
            _lpFilterCutoff = 0;
          } else if (_lpFilterCutoff > .1) {
            _lpFilterCutoff = .1;
          }

          if (_lpFilterOn) {
            _lpFilterDeltaPos += (_sample - _lpFilterPos) * _lpFilterCutoff;
            _lpFilterDeltaPos *= _lpFilterDamping;
          } else {
            _lpFilterPos = _sample;
            _lpFilterDeltaPos = 0;
          }

          _lpFilterPos += _lpFilterDeltaPos;

          _hpFilterPos += _lpFilterPos - _lpFilterOldPos;
          _hpFilterPos *= 1 - _hpFilterCutoff;
          _sample = _hpFilterPos;
        }

        // Applies the phaser effect
        if (_phaser) {
          _phaserBuffer[_phaserPos % 1024] = _sample;
          _sample += _phaserBuffer[(_phaserPos - _phaserInt + 1024) % 1024];
          _phaserPos++;
        }

        _superSample += _sample;
      }

      // Averages out the super samples and applies volumes
      _superSample *= .125 * _envelopeVolume * _masterVolume;

      // Clipping if too loud
      buffer[i] = _superSample >= 1 ? 32767 : _superSample <= -1 ? -32768 : _superSample * 32767 | 0;
    }

    return length;
  }
}

// Adapted from http://codebase.es/riffwave/
var synth = new SfxrSynth();
// Export for the Closure Compiler
window['jsfxr'] = function(settings) {
  // Initialize SfxrParams
  synth._params.setSettings(settings);
  // Synthesize Wave
  var envelopeFullLength = synth.totalReset();
  var data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);
  var used = synth.synthWave(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;
  var dv = new Uint32Array(data.buffer, 0, 44);
  // Initialize header
  dv[0] = 0x46464952; // "RIFF"
  dv[1] = used + 36;  // put total size here
  dv[2] = 0x45564157; // "WAVE"
  dv[3] = 0x20746D66; // "fmt "
  dv[4] = 0x00000010; // size of the following
  dv[5] = 0x00010001; // Mono: 1 channel, PCM format
  dv[6] = 0x0000AC44; // 44,100 samples per second
  dv[7] = 0x00015888; // byte rate: two bytes per sample
  dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
  dv[9] = 0x61746164; // "data"
  dv[10] = used;      // put number of samples here

  // Base64 encoding written by me, @maettig
  used += 44;
  var i = 0,
      base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      output = 'data:audio/wav;base64,';
  for (; i < used; i += 3)
  {
    var a = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
    output += base64Characters[a >> 18] + base64Characters[a >> 12 & 63] + base64Characters[a >> 6 & 63] + base64Characters[a & 63];
  }
  return output;
}

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

  this.sounds[key] = [];
  
  settings.forEach(function (elem, index) {

    this.sounds[key].push({
      tick: 0,
      count: count,
      pool: []
    });

    for (var i = 0; i < count; i++) {
      var audio = new Audio();
      audio.src = jsfxr(elem);
      this.sounds[key][index].pool.push(audio);
    }

  }, this);
};

/**
 * @method play
 * @param key {String} start playback of stored sound object
 */
ArcadeAudio.prototype.play = function (key) {
  
  var sound = this.sounds[key],
    soundData = sound.length > 1 ? sound[Math.floor(Math.random() * sound.length)] : sound[0];

  soundData.pool[soundData.tick].play();
  soundData.tick = (soundData.tick < soundData.count - 1) ? soundData.tick + 1 : 0;
};

var Colours = function () {

  this.menu = {
    main: '#b88f3d',
    dark: '#c3a364',
    light: '#e7c176'
  };

  this.earth = {
    main: 'rgb(50, 150, 50)',
    dark: '#509c50',
    light: '#65c655'
  };

  this.air = {
    main: 'rgba(255, 255, 255, 0.5)',
    dark: '#fff',
    light: 'rgba(255, 255, 255, 0.1)'
  };

  this.player = {
    main: '#b88f3d',
    dark: '#c3a364',
    light: '#e7c176'
  };

  this.water = {
    main: 'rgba(0, 63, 127, 0.9)',
    dark: '#495b83',
    light: '#637ab0'
  };

  this.fire = {
    main: 'rgba(250, 60, 50, 0.8)',
    dark: '#c36464',
    light: '#e77676'
  };

};

/*globals Colours*/

var Emitter = function (ctx, type, emit) {

  this.colours = new Colours();
  this.gradient = {
    water: ctx.createRadialGradient(-2, -2, 0, 0, 0, 6),
    smoke: ctx.createRadialGradient(2, 2, 0, 0, 0, 10)
  };

  this.gradient.water.addColorStop(0.000, 'rgba(255, 255, 255, 0.7)');
  this.gradient.water.addColorStop(0.381, 'rgba(0, 95, 191, 0.3)');
  this.gradient.water.addColorStop(0.549, 'rgba(0, 95, 191, 0.3)');
  this.gradient.water.addColorStop(0.755, 'rgba(0, 127, 255, 0.3)');
  this.gradient.water.addColorStop(1.000, 'rgba(0, 63, 127, 0.3)');

  this.gradient.smoke.addColorStop(0, 'rgba(100, 100, 100, 0.1)');
  this.gradient.smoke.addColorStop(0.5, 'rgba(0, 0, 0, 0)');

  this.type = type || 'default';
  this.emit = emit || true;

  this.PI = Math.PI;
  this.PI2 = this.PI * 2;

  this.particleTypes = {};
  this.particles = new Array(300);

  this.addParicleType('earth', {
    colour: this.colours.earth.light,
    life: 50,
    rotate: 20
  });
  this.addParicleType('air', {
    colour: this.colours.air.light,
    life: 80
  });
  this.addParicleType('water', {
    colour: this.colours.water.light,
    gravity: 0.1,
    maxSpeed: 3,
    life: 60
  });
  this.addParicleType('fire', {
    colour: this.colours.fire.light,
    gravity: -0.1,
    maxSpeed: 2,
    life: 40,
    rotate: 10
  });

};

Emitter.prototype.update = function (type, position, size) {

  var i, len, p, addParticle;

  addParticle = false;

  if (type !== this.type) {
    this.type = type;
  }

  i = 0;
  len = this.particles.length;
  for (; i < len; i++) {
    p = this.particles[i];

    if (p && p.life > 0) {
      this.updateParticle(p);
    } else if (!addParticle) {
      addParticle = true;
      this.addParticle({
        x: position.x + (Math.random() * size) - (size * 0.5),
        y: position.y + (Math.random() * size) - (size * 0.5)
      }, i);
    }
  }

};

Emitter.prototype.updateParticle = function (particle) {

  particle.life--;
  particle.speed.y += particle.gravity;

  particle.position.x += particle.speed.x;
  particle.position.y += particle.speed.y;
  particle.angle += particle.rotate;

};

Emitter.prototype.render = function (position, ctx) {

  var i, len, p;

  i = 0;
  len = this.particles.length;
  for (; i < len; i++) {
    p = this.particles[i];

    if (p && p.life > 0) {
      this.drawParticle(ctx, p);
    } else {
      this.particleCount--;
    }
  }
};

Emitter.prototype.drawParticle = function (ctx, particle) {

  ctx.save();
  ctx.translate(particle.position.x, particle.position.y);
  ctx.rotate(particle.angle * this.PI / 180);

  ctx.beginPath();

  switch (particle.type) {
    case 'earth':
      ctx.translate(-4, -4);
      ctx.scale(particle.life / 20, particle.life / 20);
      ctx.bezierCurveTo(0, 0, 3, 0, 3, 3);
      ctx.bezierCurveTo(3, 3, 0, 3, 0, 0);
      break;
    case 'air':
      ctx.arc(0, 0, (particle.life / 10), 0, this.PI2, false);
      break;
    case 'water':
      ctx.arc(0, 0, (particle.life / 10), 0, this.PI2, false);
      break;
    case 'fire':
      ctx.arc(0, 0, (particle.life / 10), 0, this.PI2, false);
      break;
  }

  ctx.fillStyle = particle.colour;
  ctx.fill();

  ctx.restore();

};

Emitter.prototype.addParicleType = function (key, options) {

  var settings = {
    gravity: options.gravity || 0,
    colour: options.colour || 'rgba(0, 0, 0, 0.2)',
    maxSpeed: options.maxSpeed || 0.5,
    life: options.life || 100,
    rotate: options.rotate || 0
  };

  this.particleTypes[key] = settings;
};

Emitter.prototype.addParticle = function (position, key) {

  if (this.type in this.particleTypes) {

    var particle, colour, life, random, gravity, speedX, speedY, angle;

    life = this.particleTypes[this.type].life;
    gravity = this.particleTypes[this.type].gravity;
    speedX = (Math.random() * this.particleTypes[this.type].maxSpeed) - (this.particleTypes[this.type].maxSpeed / 2);
    speedY = (Math.random() * this.particleTypes[this.type].maxSpeed) - (this.particleTypes[this.type].maxSpeed / 2);
    angle = 0;

    switch (this.type) {

      case 'earth':
        random = Math.random();
        if (random > 0.8) {
          colour = 'rgb(50, 150, 50)';
        } else if (random > 0.5) {
          colour = 'rgb(50, 100, 50)';
        } else {
          colour = 'rgb(50, 80, 50)';
        }

        angle = Math.floor(random * 360);
        break;

      case 'water':
        life *= 0.6;
        colour = this.gradient.water;
        break;

      case 'fire':
        random = Math.random();
        if (random > 0.8) {
          life *= 0.5;
          colour = 'rgba(250, 60, 50, 0.8)';
        } else if (random > 0.6) {
          life *= 0.5;
          colour = this.particleTypes[this.type].colour;
        } else if (random > 0.4) {
          life *= 0.6;
          colour = 'rgba(200, 100, 50, 0.5)';
        } else {
          life *= 2;
          colour = this.gradient.smoke;
          gravity *= 0.2;
          speedX *= 0.5;
          speedY *= 0.5;
        }
        break;

      default:
        colour = this.particleTypes[this.type].colour;
    }

    particle = {
      type: this.type,
      position: {
        x: position.x,
        y: position.y
      },
      speed: {
        x: speedX,
        y: speedY
      },
      gravity: gravity,
      angle: angle,
      life: life,
      colour: colour,
      rotate: (Math.random() * this.particleTypes[this.type].rotate) - (this.particleTypes[this.type].rotate / 2)
    };

    this.particles[key] = particle;

  }

};

/*globals ArcadeAudio, MainScene, Colours*/

window.raf = (function () {
  return window.requestAnimationFrame || function (cb) { window.setTimeout(cb, 1000 / 60); };
})();

var Game = function (width, height) {

  var doc = window.document;

  this.colours = new Colours();

  this.gravity = 0.2;

  this.canvas = doc.createElement('canvas');
  this.canvas.width = width;
  this.canvas.height = height;

  this.fps = 1000 / 60;

  this.ctx = this.canvas.getContext('2d');
  doc.getElementsByTagName('body')[0].appendChild(this.canvas);

  this.sounds = new ArcadeAudio();

  this.scene = new MainScene(this);

  this.render();
};

Game.prototype.start = function () {
  var _this = this;
  this.interval = window.setInterval(function () {
    _this.update();
  }, this.fps);
  this.tick();
};

Game.prototype.pause = function () {
  window.clearInterval(this.interval);
  delete this.interval;
};

Game.prototype.update = function () {
  this.scene.update();
};

Game.prototype.render = function () {
  this.scene.render();
};

Game.prototype.tick = function () {
  if (this.interval) {
    this.render();
    window.raf(this.tick.bind(this));
  }
};

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

IO.prototype.addEvents = function () {
  //this.el.addEventListener('touchstart', this.delegate.handleEvent.bind(this.delegate), false);
  //this.el.addEventListener('touchmove', this.delegate.handleEvent.bind(this.delegate), false);
  //this.el.addEventListener('touchend', this.delegate.handleEvent.bind(this.delegate), false);
  //this.el.addEventListener('touchcancel', this.delegate.handleEvent.bind(this.delegate), false);
  
  window.addEventListener('keydown', this.delegate.handleEvent.bind(this.delegate), true);
  window.addEventListener('keyup', this.delegate.handleEvent.bind(this.delegate), true);
};

IO.prototype.removeEvents = function () {
  //this.el.removeEventListener('touchstart', this.delegate.handleEvent.bind(this.delegate), false);
  //this.el.removeEventListener('touchmove', this.delegate.handleEvent.bind(this.delegate), false);
  //this.el.removeEventListener('touchend', this.delegate.handleEvent.bind(this.delegate), false);
  //this.el.removeEventListener('touchcancel', this.delegate.handleEvent.bind(this.delegate), false);

  window.removeEventListener('keydown', this.delegate.handleEvent.bind(this.delegate), true);
  window.removeEventListener('keyup', this.delegate.handleEvent.bind(this.delegate), true);
};

IO.prototype.handleEvent = function (event) {

  if (this.game.scene.state === 'menu') {

    if (event.type === 'keydown' && event.keyCode === 13) {
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
    //case 'touchstart':
      //this.handleTouchStart(event);
      //break;
    //case 'touchmove':
      //this.handleTouchMove(event);
      //break;
    //case 'touchend':
    //case 'touchcancel':
      //this.handleTouchEnd(event);
      //break;
  }

};

//IO.prototype.copyTouch = function (touch, oldTouch) {
  //return {
    //identifier: touch.identifier,
    //startX: oldTouch ? oldTouch.startX : touch.pageX,
    //startY: oldTouch ? oldTouch.startY : touch.pageY,
    //pageX: touch.pageX,
    //pageY: touch.pageY
  //};
//};

//IO.prototype.ongoingTouchIndexById = function (idToFind) {

  //var i, len, id;

  //i = 0;
  //len = this.ongoingTouches.length;
  //for (; i < len; i++) {
    //id = this.ongoingTouches[i].identifier;

    //if (id === idToFind) {
      //return i;
    //}
  //}

  //return -1;
//};

//IO.prototype.handleTouchStart = function (event) {
  //event.preventDefault();

  //var i, len, touches;

  //touches = event.changedTouches;
  //i = 0;
  //len = touches.length;
  //for (; i < len; i++) {
    //this.ongoingTouches.push(this.copyTouch(touches[i]));
  //}
//};

//IO.prototype.handleTouchMove = function (event) {
  //event.preventDefault();

  //var i, len, touches, idx;

  //touches = event.changedTouches;
  //i = 0;
  //len = touches.length;
  //for (; i < len; i++) {
    //idx = this.ongoingTouchIndexById(touches[i].identifier);

    //if (idx >= 0) {
      //this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i], this.ongoingTouches[idx]));
    //}
  //}

  //this.updateActiveInput();
//};

//IO.prototype.handleTouchEnd = function (event) {
  //event.preventDefault();

  //var i, len, touches, idx;

  //touches = event.changedTouches;
  //i = 0;
  //len = touches.length;
  //for (; i < len; i++) {
    //idx = this.ongoingTouchIndexById(touches[i].identifier);

    //if (idx >= 0) {
      //this.ongoingTouches.splice(idx, 1);
    //}
  //}

  //this.updateActiveInput();
//};

//IO.prototype.updateActiveInput = function () {

  //var directionControl, stateControl, dx, dy, range;

  //range = 32;

  // update movement
  //directionControl = this.ongoingTouches[0] || false;
  //if (directionControl) {
    //dx = directionControl.pageX - directionControl.startX;
    //dy = directionControl.pageY - directionControl.startY;
    //if (dx > range) {
      //this.activeInput.left = false;
      //this.activeInput.right = true;
    //} else if (dx < -range) {
      //this.activeInput.left = true;
      //this.activeInput.right = false;
    //} else {
      //this.activeInput.left = this.activeInput.right = false;
    //}

    //if (dy > range) {
      //this.activeInput.up = false;
      //this.activeInput.down = true;
    //} else if (dy < -range) {
      //this.activeInput.up = true;
      //this.activeInput.down = false;
    //} else {
      //this.activeInput.up = this.activeInput.down = false;
    //}
  //}

  // update state
  //stateControl = this.ongoingTouches[1] || false;
  //if (stateControl) {
    //dx = stateControl.pageX - stateControl.startX;
    //dy = stateControl.pageY - stateControl.startY;

    //this.activeInput.earth = false;
    //this.activeInput.water = false;
    //this.activeInput.air = false;
    //this.activeInput.fire = false;

    //if (dx > range) {
      //if (dx > dy && dx > -dy) {
        //this.activeInput.earth = true;
      //}
    //} else if (dx < -range) {
      //if (-dx > dy && -dx > -dy) {
        //this.activeInput.air = true;
      //}
    //} else if (dy > range) {
      //if (dy > dx && dy > -dx) {
        //this.activeInput.water = true;
      //}
    //} else if (dy < -range) {
      //if (-dy > dx && -dy > -dx) {
        //this.activeInput.fire = true;
      //}
    //}
  //}
//};

IO.prototype.pause = function () {

  var _this = this;

  if (!this.pauseTrigger) {

    if (this.game.scene.state === 'play') {
      this.game.scene.state = 'pause';
    } else {
      this.game.scene.state = 'play';
    }

    this.pauseTrigger = true;
    setTimeout(function () {
      _this.pauseTrigger = false;
    }, 250);

  }

};

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

var Shapes = function () {
};

Shapes.prototype.draw = function (ctx, method, options) {
  this[method](ctx, options);
};

Shapes.prototype.elements = function (ctx, options) {

  var deg90 = 90 * (Math.PI / 180);

  ctx.save();
  this.elementSegment(ctx, options[0]);
  ctx.rotate(deg90);
  this.elementSegment(ctx, options[1]);
  ctx.rotate(deg90);
  this.elementSegment(ctx, options[2]);
  ctx.rotate(deg90);
  this.elementSegment(ctx, options[3]);
  ctx.restore();

};

Shapes.prototype.elementSegment = function (ctx, options) {

  ctx.save();

  var half = options.radius / 2,
    left = half - 10,
    right = half + 10;

  ctx.beginPath();

  ctx.moveTo(0, 0);
  ctx.lineTo(left, 0);
  ctx.lineTo(left, 10);
  ctx.lineTo(left - 2, 20);
  ctx.lineTo(left - 10, 15);

  ctx.lineTo(left - 1, 42);

  ctx.lineTo(right + 4, 28);
  ctx.lineTo(right - 4, 26);

  ctx.lineTo(right, 10);
  ctx.lineTo(right, 0);

  ctx.arc(0, 0, options.radius, 0, 0.5 * Math.PI, false);

  ctx.lineTo(0, right);
  ctx.lineTo(-10, right);

  ctx.lineTo(-26, right - 4);
  ctx.lineTo(-28, right + 4);

  ctx.lineTo(-42, left - 1);

  ctx.lineTo(-15, left - 10);
  ctx.lineTo(-20, left - 2);
  ctx.lineTo(-10, left);
  ctx.lineTo(0, left);

  ctx.closePath();

  ctx.fillStyle = options.fill;
  ctx.fill();

  ctx.restore();
};

var Transition = function () {

  this.active = false;
  this.direction = 'forwards';
  this.length = 500;
  this.startTime = null;
  this.percent = 0;

};

Transition.prototype.start = function () {

  this.active = true;
  this.percent = (this.direction === 'forwards') ? 0 : 1;
  this.startTime = new Date().getTime();
};

Transition.prototype.end = function () {

  this.active = false;
  this.startTime = null;
};

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

Transition.prototype.setDirection = function (direction) {

  if (direction !== 'forwards' && direction !== 'backwards') {
    return 'error';
  }

  this.direction = direction;
  return direction;
};

/*globals Emitter*/

var Wisp = function (game, x, y, type, ctx) {

  this.game = game;
  this.type = type;
  this.life = 1;
  this.score = 0;

  this.gradient = {
    water: ctx.createRadialGradient(-2, -2, 0, 0, 0, 20),
    air: ctx.createRadialGradient(0, 0, 0, 0, 0, 20)
  };

  this.gradient.water.addColorStop(0.000, 'rgba(255, 255, 255, 0.7)');
  this.gradient.water.addColorStop(0.381, 'rgba(0, 95, 191, 0.3)');
  this.gradient.water.addColorStop(0.549, 'rgba(0, 95, 191, 0.3)');
  this.gradient.water.addColorStop(0.755, 'rgba(0, 127, 255, 0.3)');
  this.gradient.water.addColorStop(1.000, 'rgba(0, 63, 127, 0.3)');

  this.gradient.air.addColorStop(0.000, 'rgba(255, 255, 255, 0.3)');
  this.gradient.air.addColorStop(1.000, 'rgba(255, 255, 255, 0.0)');

  //this.game.sounds.add('fire', 10, [
    //[3, 0.25, 0.27, 0.76, 0.54, 0.5571, , 0.1799, -0.0999, 0.0035, 0.56, -0.6597, 0.61, 0.0862, -0.8256, , 0.5, 0.5, 0.71, -0.0181, , 0.0368, 0.0333, 0.5]
  //]);

  //this.game.sounds.add('air', 10, [
    //[3, 0.33, 0.89, 0.25, 0.81, 0.4692, , -0.0122, 0.0113, -0.5995, 0.23, -0.54, -0.1575, , 0.2234, 0.84, -0.4, 0.6599, 0.17, -0.3399, 0.96, 0.25, 0.72, 0.5]
  //]);

  this.position = {
    x: x || 0,
    y: y || 0
  };

  this.speed = {
    x: 0,
    y: 0
  };

  this.angle = 0;
  this.rotate = Math.random() * 10;

  this.size = 1;

  this.PI2 = Math.PI * 2;
  this.accelerate = 1;
  this.maxSpeed = (this.size > 10) ? 10 - this.size : 3;
  this.state = 'normal';
  this.emitter = new Emitter(ctx);
};

Wisp.prototype.update = function (input, cpus, player) {

  var i, len, sprite, smallest, distanceX, distanceY, distance, directionX, directionY;

  this.maxSpeed = (20 / this.size);

  this.angle += this.rotate;
  if (this.angle > 360) {
    this.angle -= 360;
  }

  if (this.type === 'user') {
    if (input.left) {
      this.speed.x -= this.accelerate;
    }

    if (input.right) {
      this.speed.x += this.accelerate;
    }

    if (input.up) {
      this.speed.y -= this.accelerate;
    }

    if (input.down) {
      this.speed.y += this.accelerate;
    }
  } else if (this.type === 'cpu') {

    if (cpus) {
      i = 0;
      len = cpus.length;
      smallest = false;
      directionX = 1;
      directionY = 1;
      for (; i < len; i++) {
        sprite = cpus[i];
        if (sprite.position.x !== this.position.x &&
            sprite.position.y !== this.position.y &&
            sprite.size < this.size) {

          distanceX = this.position.x - sprite.position.x;
          distanceY = this.position.y - sprite.position.y;
          if (distanceX < 0) {
            directionX = -1;
            distanceX = -distanceX;
          }
          if (distanceY < 0) {
            directionY = -1;
            distanceY = -distanceY;
          }
          distance = distanceX + distanceY;

          if (!smallest || smallest.distance < distance) {
            smallest = {
              distance: distance,
              sprite: i
            };
          }
        }
      }

      if (player &&
          player.size < this.size) {
        distanceX = this.position.x - player.position.x;
        distanceY = this.position.y - player.position.y;
        if (distanceX < 0) {
          directionX = -1;
          distanceX = -distanceX;
        }
        if (distanceY < 0) {
          directionY = -1;
          distanceY = -distanceY;
        }
        distance = distanceX + distanceY;

        if (!smallest || smallest.distance < distance) {
          smallest = {
            distance: distance,
            sprite: i
          };
        }

      }

      if (smallest && Math.random() > 0.3) {
        this.speed.x -= directionX * 0.1;
        this.speed.y -= directionY * 0.1;
      } else {
        this.speed.x += (Math.random() * 2) - 1;
        this.speed.y += (Math.random() * 2) - 1;
      }
    } else {
      this.speed.x += (Math.random() * 2) - 1;
      this.speed.y += (Math.random() * 2) - 1;
    }
  }

  if (this.speed.x > this.maxSpeed) {
    this.speed.x = this.maxSpeed;
  } else if (this.speed.x < -this.maxSpeed) {
    this.speed.x = -this.maxSpeed;
  }

  if (this.speed.y > this.maxSpeed) {
    this.speed.y = this.maxSpeed;
  } else if (this.speed.y < -this.maxSpeed) {
    this.speed.y = -this.maxSpeed;
  }

  // add dampening
  this.speed.x *= 0.9;
  this.speed.y *= 0.9;

  this.position.x += this.speed.x;
  this.position.y += this.speed.y;

  if (this.position.x > this.game.canvas.width - this.size) {
    this.position.x = this.game.canvas.width - this.size;
    this.speed.x = -this.speed.x;
  } else if (this.position.x < this.size) {
    this.position.x = this.size;
    this.speed.x = -this.speed.x;
  }

  if (this.position.y > this.game.canvas.height - this.size) {
    this.position.y = this.game.canvas.height - this.size;
    this.speed.y = -this.speed.y;
  } else if (this.position.y < this.size) {
    this.position.y = this.size;
    this.speed.y = -this.speed.y;
  }

  if (this.type === 'user') {
    if (input.earth) {
      this.state = 'earth';
    } else if (input.water) {
      this.state = 'water';
    } else if (input.air) {
      this.state = 'air';
    } else if (input.fire) {
      this.state = 'fire';
    } else {
      this.state = 'normal';
    }
  }

  this.emitter.update(this.state, this.position, this.size);
};

Wisp.prototype.render = function (ctx) {

  var halfSize = this.size * 0.5,
    twoThirdsSize = this.size * 0.66,
    thirdSize = this.size * 0.33;

  if (this.life) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle * Math.PI / 180);
    switch (this.state) {
      case 'earth':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, this.PI2, false);
        ctx.fillStyle = 'rgb(139, 101, 8)';
        ctx.fill();
        ctx.fillStyle = 'rgba(139, 105, 20, 0.5)';
        ctx.beginPath();
        ctx.arc(-thirdSize, thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        ctx.fillStyle = 'rgba(205, 186, 150, 0.5)';
        ctx.beginPath();
        ctx.arc(thirdSize, thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        ctx.fillStyle = 'rgba(210, 180, 140, 0.5)';
        ctx.beginPath();
        ctx.arc(0, -thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        break;

      case 'water':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, this.PI2, false);
        ctx.fillStyle = this.gradient.water;
        ctx.fill();
        break;

      case 'air':
        ctx.fillStyle = this.gradient.air;
        ctx.beginPath();
        ctx.arc(-halfSize, halfSize, halfSize, 0, this.PI2, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(halfSize, halfSize, halfSize, 0, this.PI2, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -halfSize, halfSize, 0, this.PI2, false);
        ctx.fill();
        break;

      case 'fire':
        ctx.fillStyle = this.game.colours.fire.main;
        ctx.beginPath();
        ctx.arc(-thirdSize, thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        ctx.fillStyle = 'rgba(200, 100, 50, 0.5)';
        ctx.beginPath();
        ctx.arc(thirdSize, thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        ctx.fillStyle = 'rgba(250, 60, 50, 0.8)';
        ctx.beginPath();
        ctx.arc(0, -thirdSize, twoThirdsSize, 0, this.PI2, false);
        ctx.fill();
        break;

      default:
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, this.PI2, false);
        ctx.fillStyle = this.game.colours.player.main;
        ctx.fill();
        break;
    }
    ctx.restore();
  }
  this.emitter.render(this.position, ctx);
};

/*globals IO, Wisp, Transition, Shapes*/

var MainScene = function (game) {

  this.game = game;

  this.state = 'menu';

  this.rules = {
    water: 'fire',
    fire: 'earth',
    earth: 'air',
    air: 'water'
  };

  this.menuTransition = new Transition();
  this.menuTransition.start();

  this.pauseTransition = new Transition();

  this.shapes = new Shapes();

  this.canvas = window.document.createElement('canvas');
  this.canvas.width = this.game.canvas.width;
  this.canvas.height = this.game.canvas.height;
  this.ctx = this.canvas.getContext('2d');

  this.menuCanvas = window.document.createElement('canvas');
  this.menuCanvas.width = this.game.canvas.width;
  this.menuCanvas.height = this.game.canvas.height;
  this.menuCtx = this.menuCanvas.getContext('2d');
  this.drawMenu();

  this.pauseCanvas = window.document.createElement('canvas');
  this.pauseCanvas.width = this.game.canvas.width;
  this.pauseCanvas.height = this.game.canvas.height;
  this.pauseCtx = this.pauseCanvas.getContext('2d');
  this.drawPause();

  this.io = new IO(this.game.canvas, this.game);
  this.player = new Wisp(this.game, this.game.canvas.width / 2, this.game.canvas.height / 2, 'user', this.ctx);
  this.player.size = 5;

  this.cpus = [];
  this.cpuTypes = [
    'earth',
    'air',
    'water',
    'fire'
  ];

  var enemies = 5;
  while (enemies) {
    this.addCPU();
    enemies--;
  }

  this.draw();

  return this;
};

MainScene.prototype.addCPU = function () {

  var cpu, x, y;

  x = Math.random() * this.game.canvas.width;
  y = Math.random() * this.game.canvas.height;
  cpu = new Wisp(this.game, x, y, 'cpu', this.ctx);
  cpu.state = this.cpuTypes[Math.floor(Math.random() * this.cpuTypes.length)];
  cpu.size = Math.random() * (this.player.size + 5);

  this.cpus.push(cpu);

};

MainScene.prototype.update = function () {

  var i, len, kill;

  switch (this.state) {

    case 'menu':
    case 'transition-play':

      this.menuTransition.update();

      i = 0;
      len = this.cpus.length;
      for (; i < len; i++) {
        this.cpus[i].update();
      }

      break;

    case 'play':

      kill = [];

      if (this.player.size < 1) {
        this.player.life = 0;
      }

      if (!this.player.life) {
        this.state = 'menu';
        if (this.game.hiscore) {
          if (this.player.score > this.game.hiscore) {
            this.game.hiscore = this.player.score;
          }
        } else {
          this.game.hiscore = this.player.score;
        }
        this.drawMenu();
        this.player.score = 0;
        this.player.life = 1;
        this.player.size = 5;
        this.player.position = {
          x: this.canvas.width / 2,
          y: this.canvas.height / 2
        };
        return;
      }

      this.scaleWorld();

      this.player.update(this.io.activeInput);
      i = 0;
      len = this.cpus.length;
      for (; i < len; i++) {
        if (this.cpus[i].life === 0) {
          // TODO test to see if emitter has finished
          kill.push(i);
        }
        this.cpus[i].update(null, this.cpus, this.player);
      }

      i = 0;
      len = kill.length;
      for (; i < len; i++) {
        this.cpus.splice(kill[i], 1);
        this.addCPU();
      }

      this.testCollision();
      break;

  }
};

MainScene.prototype.draw = function () {

  var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
  gradient.addColorStop(0, '#004cb3');
  gradient.addColorStop(1, '#8ed6ff');

  this.ctx.fillStyle = gradient;
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

MainScene.prototype.drawMenu = function (percent) {

  var ctx, width, height, halfWidth, halfHeight, bgWidth, bgHeight;

  ctx = this.menuCtx;
  width = this.menuCanvas.width;
  height = this.menuCanvas.height;
  halfWidth = width / 2;
  halfHeight = height / 2;
  bgWidth = width * 0.4;
  bgHeight = height * 0.4;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if (percent) {
    ctx.globalAlpha = percent;
  }

  // draw background
  ctx.save();
  ctx.translate(halfWidth, halfHeight);
  ctx.beginPath();
  ctx.moveTo(-bgWidth - (Math.random() * 10), -bgHeight - (Math.random() * 10));
  ctx.lineTo(bgWidth + (Math.random() * 10), -bgHeight - (Math.random() * 10));
  ctx.lineTo(bgWidth + (Math.random() * 10), bgHeight + (Math.random() * 10));
  ctx.lineTo(-bgWidth - (Math.random() * 10), bgHeight + (Math.random() * 10));
  ctx.closePath();
  ctx.fillStyle = this.game.colours.menu.main;
  ctx.strokeStyle = this.game.colours.menu.light;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // draw element guide
  ctx.save();
  ctx.translate(this.canvas.width - 60, 60);
  ctx.rotate(-10 * (Math.PI / 180));
  ctx.scale(0.5, 0.5);
  ctx.transform(1, 0.1, 0, 1, 0, 0);
  this.shapes.draw(ctx, 'elements', [
      { fill: this.game.colours.water.main, radius: 100 },
      { fill: this.game.colours.fire.main, radius: 100 },
      { fill: this.game.colours.earth.main, radius: 100 },
      { fill: this.game.colours.air.main, radius: 100 }
    ]);
  ctx.restore();

  // draw text
  ctx.fillStyle = '#fff';
  ctx.font = '20px/24px "Trebuchet MS", Helvetica, sans-serif';
  ctx.textAlign = 'center';

  ctx.save();
  ctx.translate(halfWidth, halfHeight - 90);
  ctx.rotate(-2 * Math.PI / 180);
  ctx.fillText('Become the biggest', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(halfWidth, halfHeight - 30);
  ctx.rotate(1 * Math.PI / 180);
  ctx.fillText('use the cursor', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(halfWidth, halfHeight - 10);
  ctx.rotate(-1 * Math.PI / 180);
  ctx.fillText('keys to move', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = this.game.colours.earth.main;
  ctx.translate(halfWidth - 50, halfHeight + 40);
  ctx.rotate(-3 * Math.PI / 180);
  ctx.fillText('earth "1"', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = this.game.colours.air.main;
  ctx.translate(halfWidth + 60, halfHeight + 35);
  ctx.rotate(2 * Math.PI / 180);
  ctx.fillText('air "2"', 0, 0);
  ctx.restore();
  
  ctx.save();
  ctx.fillStyle = this.game.colours.water.main;
  ctx.translate(halfWidth + 50, halfHeight + 85);
  ctx.rotate(-2 * Math.PI / 180);
  ctx.fillText('water "3"', 0, 0);
  ctx.restore();
  
  ctx.save();
  ctx.fillStyle = this.game.colours.fire.main;
  ctx.translate(halfWidth - 60, halfHeight + 90);
  ctx.rotate(2 * Math.PI / 180);
  ctx.fillText('fire "4"', 0, 0);
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.fillText('Press any "enter" to begin', halfWidth, halfHeight + 150);

  if (typeof this.game.hiscore === 'number') {
    ctx.save();
    ctx.translate(halfWidth - 80, halfHeight - 160);
    ctx.rotate(-5 * Math.PI / 180);
    ctx.fillText('score: ' + this.game.hiscore, 0, 0);
    ctx.restore();
  }

  ctx.restore();
};

MainScene.prototype.drawPause = function () {

  var ctx = this.pauseCtx;

  ctx.clearRect(0, 0, this.pauseCanvas.width, this.pauseCanvas.height);
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = '20px/24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Paused', this.canvas.width / 2, this.canvas.height / 2);

  ctx.restore();
};

MainScene.prototype.render = function () {

  // draw bakground
  this.game.ctx.drawImage(this.canvas, 0, 0);

  // other objects
  if (this.state === 'play') {
    this.player.render(this.game.ctx);
  }
  for (var i = 0, len = this.cpus.length; i < len; i++) {
    this.cpus[i].render(this.game.ctx);
  }

  switch (this.state) {
    case 'menu':
      if (this.menuTransition.active) {
        this.game.ctx.globalAlpha = this.menuTransition.percent;
        this.game.ctx.drawImage(this.menuCanvas, 0, 0);
        this.game.ctx.globalAlpha = 1;
      } else {
        this.game.ctx.drawImage(this.menuCanvas, 0, 0);
      }
      break;
    case 'transition-play':
      if (this.menuTransition.active) {
        this.game.ctx.globalAlpha = this.menuTransition.percent;
        this.game.ctx.drawImage(this.menuCanvas, 0, 0);
        this.game.ctx.globalAlpha = 1;
      } else {
        this.state = 'play';
      }
      break;
    case 'pause':
      this.game.ctx.drawImage(this.pauseCanvas, 0, 0);
      break;
    case 'play':
      this.game.ctx.fillStyle = '#fff';
      this.game.ctx.font = '20px/24px Arial';
      this.game.ctx.textAlign = 'center';
      this.game.ctx.fillText(this.player.score, this.canvas.width / 2, 20);

      this.game.ctx.save();
      this.game.ctx.translate(this.canvas.width - 20, 20);
      this.game.ctx.rotate(-10 * (Math.PI / 180));
      this.game.ctx.scale(0.1, 0.1);
      this.game.ctx.globalAlpha = 0.5;
      this.game.ctx.transform(1, 0.1, 0, 1, 0, 0);
      this.shapes.draw(this.game.ctx, 'elements', [
          { fill: this.game.colours.water.main, radius: 100 },
          { fill: this.game.colours.fire.main, radius: 100 },
          { fill: this.game.colours.earth.main, radius: 100 },
          { fill: this.game.colours.air.main, radius: 100 }
        ]);
      this.game.ctx.restore();
      break;
  }
};

MainScene.prototype.testCollision = function () {

  var i, len, sprite, aSize, aMaxX, aMinX, aMaxY, aMinY, bSize, bMaxX, bMinX, bMaxY, bMinY, sprite2;

  aSize = this.player.size;
  aMaxX = this.player.position.x + aSize;
  aMinX = this.player.position.x - aSize;
  aMaxY = this.player.position.y + aSize;
  aMinY = this.player.position.y - aSize;

  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    sprite = this.cpus[i];

    // collision between player and cpus
    if ((aMaxX > sprite.position.x) && (aMinX < sprite.position.x)) {
      if ((aMaxY > sprite.position.y) && (aMinY < sprite.position.y)) {
        this.destroySmallest(this.player, sprite);
      }
    }

  }

  i = 0;
  var j;
  len = this.cpus.length;
  for (; i < len; i++) {
    sprite = this.cpus[i];
    bSize = sprite.size;
    bMaxX = sprite.position.x + bSize;
    bMinX = sprite.position.x - bSize;
    bMaxY = sprite.position.y + bSize;
    bMinY = sprite.position.y - bSize;

    // collision between cpu and player
    if ((bMaxX > this.player.position.x) && (bMinX < this.player.position.x)) {
      if ((bMaxY > this.player.position.y) && (bMinY < this.player.position.y)) {
        this.destroySmallest(sprite, this.player);
      }
    }

    j = i;
    for (; j < len; j++) {

      sprite2 = this.cpus[j];

      // collision between cpu and cpu
      if ((bMaxX > sprite2.position.x) && (bMinX < sprite2.position.x)) {
        if ((bMaxY > sprite2.position.y) && (bMinY < sprite2.position.y)) {
          this.destroySmallest(sprite, sprite2);
        }
      }
    }
  }

};

MainScene.prototype.destroySmallest = function (a, b) {

  var ruleA, ruleB, valueA, valueB, boost;

  boost = 10;

  ruleA = this.rules[a.state];
  ruleB = this.rules[b.state];

  valueA = a.size + (b.state === ruleA ? boost : 0);
  valueB = b.size + (a.state === ruleB ? boost : 0);

  if (valueA > valueB) {
    a.size++;
    a.score += 2;
    b.size--;
    //b.score -= 1;
    if (b.size <= 0) {
      b.life = 0;
    }
  } else {
    b.size++;
    b.score += 2;
    //a.score -= 1;
    a.size--;
    if (a.size <= 0) {
      a.life = 0;
    }
  }

};

MainScene.prototype.scaleSprites = function () {

  var i, len, amount;

  amount = 0.99;

  this.player.size *= amount;
  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    this.cpus[i].size *= amount;
  }

};

MainScene.prototype.scaleWorld = function () {

  var i, len;

  if (this.player.size > 10) {
    this.scaleSprites();
  }

  i = 0;
  len = this.cpus.length;
  for (; i < len; i++) {
    if (this.cpus[i].size > 10) {
      this.scaleSprites();
    }
  }

};

/*globals Game*/
window.onload = function () {
  var game = new Game(320, 480);
  game.start();
};
