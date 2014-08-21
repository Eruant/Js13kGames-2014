var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  zip = require('gulp-zip'),
  size = require('gulp-filesize'),
  concat = require('gulp-concat'),
  localhost = require('browser-sync');

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

gulp.task('compress', ['html', 'js'], function () {
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
