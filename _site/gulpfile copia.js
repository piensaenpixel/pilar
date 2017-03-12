const gulp = require('gulp');
const sass = require('gulp-sass');
const child = require('child_process');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const webpack = require('gulp-webpack');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');

const cssFiles = '_stylesheets/**/*.scss';
const jsFiles = '_javascripts/**/*.js';
const assetsFiles = '_assets/*';
const siteRoot = '_site';

const swallowError = (error) => {
  console.log(error.toString());
  this.emit('end');
};

const autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

gulp.task('css', () => {
  gulp.src(cssFiles)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', swallowError)
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('_site/stylesheets'))
    .pipe(gulp.dest('stylesheets'))
    .pipe(reload({
      stream: true
    }))
    .pipe(cleanCSS({
      keepBreaks: false,
      keepSpecialComments: true
    }))
    .pipe(gulp.dest('stylesheets'));
});

gulp.task('fonts', () => {
  gulp.src('fonts/*')
    .pipe(gulp.dest('stylesheets/fonts'))
    .pipe(gulp.dest('_site/stylesheets/fonts'));
});

gulp.task('js', () => {
  return gulp.src('_javascripts/main.js')
    .pipe(webpack())
    .on('error', swallowError)
    .pipe(rename('main.js'))
    .pipe(gulp.dest('javascripts'))
    .pipe(reload({stream: true}))
    .pipe(uglify())
    .on('error', swallowError)
    .pipe(gulp.dest('_site/javascripts'));
});

gulp.task('serve', () => {
  browserSync.init({
    files: [siteRoot + '/**'],
    port: 4000,
    server: {
      baseDir: siteRoot
    }
  });

  gulp.watch(cssFiles, ['css']);
  gulp.watch(jsFiles, ['js']);
  gulp.watch(assetsFiles, ['assets']);
  gulp.watch(['**/*.md', '_layouts/**/*', '_includes/**/*', '_data/**/*'], ['build:reload']);
});

gulp.task('build:reload', ['build'], () => { reload(); });
gulp.task('build', done => {
  return child.spawn('bundle', ['exec', 'jekyll', 'build', '--drafts'], {stdio: 'inherit'}).on('close', done);
});

gulp.task('jekyll', () => {
  const jekyll = child.spawn('bundle', ['exec', 'jekyll', 'build',
    '--incremental',
    '--drafts'
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

// Optimise images + copy any other assets
gulp.task('assets', () => {
  return gulp.src('_assets/*')
    .pipe(gulp.dest('images'))
    .pipe(imagemin())
    .pipe(gulp.dest('_site/images'));
});

gulp.task('default', ['css', 'js', 'fonts', 'assets', 'jekyll', 'serve']);
