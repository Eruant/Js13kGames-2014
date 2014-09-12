/**
 * Some useful shapes that can be rendered to a canvas
 *
 * @class Shapes
 */
var Shapes = function () {
};

/**
 * Calls the other draw methods
 * @method Shapes.draw
 * @param {object} ctx      - a canvas context2d object
 * @param {string} method   - name of the method we want to call
 * @param {object} options  - the arguments for the method we are calling
 */
Shapes.prototype.draw = function (ctx, method, options) {
  this[method](ctx, options);
};

/**
 * Draws an four element segments
 * @method Shapes.elements
 * @param {object} ctx      - a canvas context2d  objects
 * @param {object} options  - the arguments to pass on
 */
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

/**
 * Draw a segment of an element
 * @method Shapes.elementSegment
 * @param {object} ctx      - a canvas context2d object
 * @param {object} options  - radius, fill etc
 */
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
