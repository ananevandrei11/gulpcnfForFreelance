// COMMON
const {
  src,
  dest,
  watch,
  parallel,
  series
} = require('gulp');
const rename = require("gulp-rename");
const concat = require('gulp-concat');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
//SERVER
const browserSync = require('browser-sync').create();
// HTML
const fileinclude = require('gulp-file-include');
// CSS
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const postcss = require('gulp-postcss');
const mqpacker = require("css-mqpacker");
const csso = require('gulp-csso');
// JS
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
// IMAGE
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
// FONTS
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');

//! MODE PRODUCTION START
function html() {
  return src('dev/*.html')
    .pipe(dest('dist'))
}

function style() {
  return src('dev/css/style.css')
    .pipe(dest('dist/css'))
}

function styleMin() {
  return src('dev/css/style.css')
    .pipe(sourcemaps.init())
    .pipe(postcss([
      mqpacker(),
    ]))
    .pipe(csso())
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css'))
}

function styleVendors() {
  return src([
    'dev/css/vendors/**/*.css',
  ])
    .pipe(dest('dist/css/vendors/'))
}

function js() {
  return src([
    '#src/js/**/*.js',
    '!#src/js/vendors/**/*.js'
  ])
    .pipe(dest('dist/js'))
}

function jsMin() {
  return src([
    'dev/js/**/*.js',
    '!dev/js/vendors/**/*.js',
  ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'))
}

function jsVendors() {
  return src([
    'dev/js/vendors/**/*.js',
  ])
    .pipe(dest('dist/js/vendors/'))
}

function images() {
  return src(['dev/img/**/*', '!dev/img/**/*.webp'])
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 50,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 7
      }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: true
        }, {
          cleanupIDs: false
        }]
      })
    ]))
    .pipe(dest('dist/img'))
}

function fonts() {
  return src('dev/fonts/**/*')
    .pipe(dest('dist/fonts'))
}

function cleanDist() {
  return del('dist/**/*')
}

exports.html = html;
exports.style = style;
exports.styleMin = styleMin;
exports.styleVendors = styleVendors;
exports.js = js;
exports.jsMin = jsMin;
exports.jsVendors = jsVendors;
exports.images = images;
exports.fonts = fonts;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, html, style, styleMin, styleVendors, js, jsMin, jsVendors, images, fonts);


//! MODE DEVELOP STAR
function browsersyncDev() {
  browserSync.init({
    server: {
      baseDir: 'dev/'
    }
  });
}

function htmlDev() {
  return src('#src/views/*.html')
    .pipe(fileinclude({
      prefix: '@@'
    }))
    .pipe(dest('dev'))
}

function styleDev() {
  return src([
    '#src/scss/style.scss',
    '#src/scss/components/**/*.scss'
  ])
    .pipe(scss({
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer())
    .pipe(dest('dev/css'))
    .pipe(browserSync.stream())
}
/** ****************
 * TODO: scss({outputStyle: 'compressed'}) - for minification
 * TODO: scss({outputStyle: 'expanded'}) - for beatify
 ******************
 */

function styleVendorsDev() {
  return src([
    'node_modules/reset-css/reset.css',
  ])
    .pipe(dest('dev/css/vendors/'))
}

function jsDev() {
  return src([
    '#src/js/**/*.js',
    '!#src/js/vendors/**/*.js',
  ])
    .pipe(concat('main.js'))
    .pipe(dest('dev/js'))
    .pipe(browserSync.stream())
}

// TODO: ADD HERE PLUGINS OF JS FROM NODE MODULES
function jsVendorsDev() {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
  ])
    .pipe(dest('dev/js/vendors/'))
}

function imagesDev() {
  return src('#src/img/**/*')
    .pipe(dest('dev/img'))
}

function imagesToWebp() {
  return src(['#src/img/**/*.{jpg,png}',
    '!#src/img/svg/**/*',
    '!#src/img/favicon/**/*'
  ])
    .pipe(webp())
    .pipe(dest('dev/img'))
}

function otf2ttf() {
  return src(['#src/fonts/**/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest('#src/fonts'))
}

function fontsDev() {
  src([
    '#src/fonts/**/*.ttf',
    '!#src/fonts/icons/**/*.*'
  ])
    .pipe(ttf2woff())
    .pipe(dest('dev/fonts'))
  return src([
    '#src/fonts/**/*',
    '!#src/fonts/**/*.otf',
    '!#src/fonts/icons/**/*.*'
  ])
    .pipe(ttf2woff2())
    .pipe(dest('dev/fonts'))
}

function fontsIcon() {
  return src(['#src/fonts/icons/**/*.*'])
    .pipe(dest('dev/fonts/icons/'))
}

function cleanDev() {
  return del([
    'dev/**/*.html',
    'dev/fonts/**/*',
    'dev/img/**/*',
    'dev/css/**/*',
    'dev/js/**/*',
  ])
}


function watchDev() {
  watch(['#src/components/*.html', '#src/views/*.html'], htmlDev);
  watch(['#src/scss/**/*.scss'], styleDev);
  watch(['#src/js/**/*.js', '!#src/js/three/**/*.js', '!#src/js/vendors/**/*.js'], jsDev);
  watch(['#src/img/**/*'], imagesDev);
  watch(['#src/img/**/*.{jpg,png}', '!#src/img/svg/**/*', '!#src/img/favicon/**/*'], imagesToWebp);
  watch(['dev/index.html']).on('change', browserSync.reload);
}

exports.htmlDev = htmlDev;
exports.styleDev = styleDev;
exports.styleVendorsDev = styleVendorsDev;
exports.jsDev = jsDev;
exports.jsVendorsDev = jsVendorsDev;
exports.imagesDev = imagesDev;
exports.imagesToWebp = imagesToWebp;
exports.otf2ttf = otf2ttf;
exports.fontsDev = fontsDev;
exports.fontsIcon = fontsIcon;
exports.cleanDev = cleanDev;
exports.browsersyncDev = browsersyncDev;
exports.watchDev = watchDev;

exports.dev = parallel(cleanDev, htmlDev, styleDev, styleVendorsDev, jsDev, jsVendorsDev, imagesDev, imagesToWebp, fontsDev, fontsIcon, browsersyncDev, watchDev);
/** *****************
 * TODO: IF THERE ARE PROBLEMS - npm cache clean --force
 * ******************
 */