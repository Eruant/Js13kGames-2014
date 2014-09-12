## The Elements

The game was build for the competition [JS13KGames][js13k]. The theme of the cometition is **The Elements: Earth, Water, Air and Fire**.

To play the game, go to [littleball.co.uk/Js13kGames-2014][play].

## Running it locally

You can open the files directly from the folder `dest/www`. Alternatly you can run a local server with `node`.

    $ npm i && gulp

## Documentation

    $ ./node_modules/.bin/jsdoc src/js/base.js src/js/classes/*.js src/js/scenes/*.js -t ./node_modules/ink-docstrap/template -c jsdoc-config.js -d docs

[js13k]:  http://js13kgames.com/
[play]:   http://littleball.co.uk/Js13kGames-2014/
