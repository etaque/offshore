var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var uglify = require("gulp-uglify");
var stylus = require('gulp-stylus');


function compile(watch) {
  var bundler;
  if (watch) {
    var opts = watchify.args;
    opts.debug = true;
    bundler = watchify(browserify('./src/index.js', opts).transform(babel));
  } else {
    bundler = browserify('./src/index.js', { debug: true }).transform(babel);
  }

  function rebundleJS() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(watch ? gutil.noop() : uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('../public'));
  }

  function rebundleCSS() {
    gulp.src('./src/*.styl')
      .pipe(sourcemaps.init())
      .pipe(stylus({'include css': true}))
      .pipe(sourcemaps.write('../public'))
      .pipe(gulp.dest('../public'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundleJS();
      rebundleCSS();
    });
  }

  rebundleJS();
  rebundleCSS();
}

function watch() {
  return compile(true);
}

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);
