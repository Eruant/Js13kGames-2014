var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  zip = require('gulp-zip'),
  size = require('gulp-filesize'),
  concat = require('gulp-concat'),
  localhost = require('browser-sync'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename');

gulp.task('html', function () {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('dest/www'));
});

gulp.task('js', function () {
  return gulp.src([
    'src/js/lib/*.js',
    'src/js/classes/*.js',
    'src/js/*.js'
  ])
    .pipe(concat('js13k.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dest/www'));
});

gulp.task('css', function () {
  return gulp.src('src/scss/base.scss')
    .pipe(sass())
    .pipe(rename('js13k.css'))
    .pipe(gulp.dest('dest/www'));
});

gulp.task('compress', ['html', 'js', 'css'], function () {
  return gulp.src('dest/www/*')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('dest'));
});

gulp.task('compile', ['compress'], function () {
  return gulp.src('dest/archive.zip').pipe(size());
});

gulp.task('watch', ['compile'], function () {
  gulp.watch('src/**/*', ['compile']);
});

gulp.task('localhost', ['watch'], function () {
  return localhost.init(['dest/www/*'], {
    server: './dest/www'
  });
});

gulp.task('default', ['localhost']);
