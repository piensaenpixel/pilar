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

const through = require('through2');

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
  gulp.watch(['**/*.md', '_layouts/**/*', '_includes/**/*', '_data/**/*'], ['build:reload', 'search']);
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

function adjustPath (needle) {
  let pathArray;
  let replacement;

  return through.obj((file, enc, cb) => {
    pathArray = file.path.substring(file.base.length).split('/');
    replacement = Array(pathArray.length).join('../') + needle.substring(1);

    if (file.isNull()) {
      return cb(null, file);
    }

    if (pathArray.length === 1) {
      replacement = '.' + needle;
    }

    var pattern = new RegExp(needle, 'g');

    if (file.isStream()) {
      file.contents = file.contents.pipe(replace(pattern, replacement));
    } else if (file.isBuffer()) {
      file.contents = new Buffer(String(file.contents).replace(pattern, replacement));
    }

    return cb(null, file);
  });
}

function adjustLink () {
  let pathArray;
  let replacement;
  let needle = /(<a )(.+)?(href=['"])(\/)(.+\/)(['"])(.+)?(>)/g;

  return through.obj((file, enc, cb) => {
    pathArray = file.path.substring(file.base.length).split('/');
    replacement = '$1' + '$2' + '$3' + Array(pathArray.length).join('../') + '$5' + 'index.html' + '$6' + '$7' + '$8';

    if (file.isNull()) {
      return cb(null, file);
    }

    if (pathArray.length === 1) {
      replacement = '$1' + '$2' + '$3' + '.' + '$4' + '$5' + 'index.html' + '$6' + '$7' + '$8';
    }

    if (file.isStream()) {
      file.contents = file.contents.pipe(replace(needle, replacement));
    } else if (file.isBuffer()) {
      file.contents = new Buffer(String(file.contents).replace(needle, replacement));
    }

    return cb(null, file);
  });
}

function adjustHome () {
  let pathArray;
  let replacement;
  let needle = /(<a )(.+)?(href=['"])(\/)(['"])(.+)?(>)/g;

  return through.obj((file, enc, cb) => {
    pathArray = file.path.substring(file.base.length).split('/');
    replacement = '$1' + '$2' + '$3' + Array(pathArray.length).join('../') + 'index.html' + '$5' + '$6' + '$7';

    if (file.isNull()) {
      return cb(null, file);
    }

    if (pathArray.length === 1) {
      replacement = '$1' + '$2' + '$3' + '.' + '$4' + 'index.html' + '$5' + '$6' + '$7';
    }

    if (file.isStream()) {
      file.contents = file.contents.pipe(replace(needle, replacement));
    } else if (file.isBuffer()) {
      file.contents = new Buffer(String(file.contents).replace(needle, replacement));
    }

    return cb(null, file);
  });
}

function fixLink () {
  let replacement;
  let needle = /(href=['"])([\s]?)([^'"\s]+)([\s]?)(['"])/g;

  return through.obj((file, enc, cb) => {
    replacement = '$1' + '$3' + '$5';

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      file.contents = file.contents.pipe(replace(needle, replacement));
    } else if (file.isBuffer()) {
      file.contents = new Buffer(String(file.contents).replace(needle, replacement));
    }

    return cb(null, file);
  });
}

function adjustSearch () {
  let pathArray;
  let replacement;
  let needle = /__path__/g;

  return through.obj((file, enc, cb) => {
    pathArray = file.path.substring(file.base.length).split('/');
    replacement = Array(pathArray.length).join('../');

    if (file.isNull()) {
      return cb(null, file);
    }

    if (pathArray.length === 1) {
      replacement = './';
    }

    if (file.isStream()) {
      file.contents = file.contents.pipe(replace(needle, replacement));
    } else if (file.isBuffer()) {
      file.contents = new Buffer(String(file.contents).replace(needle, replacement));
    }

    return cb(null, file);
  });
}

gulp.task('wadus', () => {
  gulp.src('_site/stylesheets/**/*')
    .pipe(gulp.dest('_deliver/stylesheets'));

  gulp.src('_site/**/*.json')
    .pipe(gulp.dest('_deliver'));

  gulp.src('_site/images/**/*')
    .pipe(gulp.dest('_deliver/images'));

  gulp.src('_site/javascripts/**/*')
    .pipe(gulp.dest('_deliver/javascripts'));

  return gulp.src('_site/**/*.html')
    .pipe(fixLink())
    .pipe(adjustPath('/stylesheets/main.css'))
    .pipe(adjustPath('/images'))
    .pipe(adjustLink())
    .pipe(adjustHome())
    .pipe(gulp.dest('_deliver'));
});

gulp.task('search', () => {
  return gulp.src('_site/**/*.html')
    .pipe(adjustSearch())
    .pipe(reload({stream: true}))
    .pipe(gulp.dest('_site'));
});

// Optimise images + copy any other assets
gulp.task('assets', () => {
  return gulp.src('_assets/*')
    .pipe(gulp.dest('images'))
    .pipe(imagemin())
    .pipe(gulp.dest('_site/images'));
});

gulp.task('default', ['css', 'js', 'fonts', 'assets', 'jekyll', 'serve']);
