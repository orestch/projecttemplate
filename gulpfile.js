var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  autoPrefixer = require('gulp-autoprefixer'),
  //if node version is lower than v.0.1.2
  cssComb = require('gulp-csscomb'),
  cmq = require('gulp-merge-media-queries'),
  cleanCss = require('gulp-clean-css'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  pug = require('gulp-pug'),
  minifyHtml = require('gulp-minify-html'),
  imageMin = require('gulp-imagemin'),
  cache = require('gulp-cache'),
  fs = require('fs'),
  path = require('path'),
  merge = require('merge-stream'),
  scriptsPath = 'views/src/js';

function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function (file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

gulp.task('scss', function () {
  gulp.src(['src/scss/**/*.scss'])
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoPrefixer())
    .pipe(cssComb())
    .pipe(cmq({ log: true }))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(cleanCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('js', function () {
  var folders = getFolders(scriptsPath),
    tasks = folders.map(function (folder) {
      return gulp.src(path.join(scriptsPath, folder, '/**/*.js'))
        // concat into foldername.js
        .pipe(concat(folder + '.js'))
        // write to output
        .pipe(gulp.dest('dist/js'));
    }),

    // process all remaining files in scriptsPath root into main.js and main.min.js files
    root = gulp.src(path.join(scriptsPath, '/*.js'))
      .pipe(concat('main.js'))
      .pipe(gulp.dest('dist/js'));

  return merge(tasks, root);
});

gulp.task('pug', function () {
  gulp.src(['src/html/**/*.pug'])
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(pug())
    .pipe(minifyHtml())
    .pipe(gulp.dest('dist'));
});

gulp.task('image', function () {
  gulp.src(['src/images/**/*'])
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(cache(imageMin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('default', function () {
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/scss/**/*.scss', ['scss']);
  gulp.watch('src/html/**/*.pug', ['pug']);
  gulp.watch('src/images/**/*', ['image']);
});
