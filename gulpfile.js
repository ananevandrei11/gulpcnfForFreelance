// COMMON
const { src, dest, watch, parallel, series } = require('gulp');
const rename = require("gulp-rename");
const concat = require('gulp-concat');
const del = require('del');
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
// FONTS
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');

//! MODE PRODUCTION START
function html() {
	return src('#dev/*.html')
		.pipe(dest('#dist'))
}

function style() {
	return src('#dev/css/style.css')
		.pipe(csso())
		.pipe(rename('style.min.css'))
		.pipe(dest('#dist/css'))
}

function js() {
	return src([
		'#dev/js/script.min.js',
		'!#dev/js/vendors/vendors.min.js'
	])
	.pipe(uglify())
	.pipe(dest('#dist/js'))
}

function jsVendors() {
	return src([
		'#dev/js/vendors/vendors.min.js',
	])
	.pipe(uglify())
	.pipe(dest('#dist/js/vendors/'))
}

function images() {
	return src('#dev/img/**/*')
	.pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
	]))
	.pipe(dest('#dist/img'))
}

function fonts() {
	return src('#dev/fonts/**/*')
	.pipe(dest('#dist/fonts'))
}

function cleanDist() {
	return del('#dist/**/*')
}

exports.html = html;
exports.style = style;
exports.js = js;
exports.jsVendors = jsVendors;
exports.images = images;
exports.fonts = fonts;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, html, style, js, jsVendors, images, fonts);


//! MODE DEVELOP STAR
function browsersyncDev() {
	browserSync.init({
			server: {
					baseDir: '#dev/'
			}
	});
}

function htmlDev() {
	return src('#src/views/*.html')
		.pipe(fileinclude({
			prefix: '@@'
		}))
		.pipe(dest('#dev'))
}

function styleDev() {
	return src('#src/style.scss')
		.pipe(autoprefixer({
			overrideBrowserslist : 'last 5 version',
			grid: 'no-autoplace'
		}))
		.pipe(scss({outputStyle: 'expanded'}))
		.pipe(postcss([
			mqpacker(),
		]))
		.pipe(dest('#dev/css'))
		.pipe(browserSync.stream())
}
/** ****************
	* TODO: scss({outputStyle: 'compressed'}) - for minification
	* TODO: scss({outputStyle: 'expanded'}) - for beatify
	******************
*/

function jsDev() {
	return src([
		'#src/js/main.js',
		'!#src/js/vendors/vendors.min.js'
	])
	.pipe(babel({
		presets: ['@babel/preset-env']
		}))
	.pipe(rename('script.min.js'))
	.pipe(dest('#dev/js'))
	.pipe(browserSync.stream())
}

// TODO: ADD HERE PLUGINS OF JS FROM NODE MODULES
function jsVendorsDev() {
	return src([
		'node_modules/jquery/dist/jquery.js',
	])
	.pipe(concat('vendors.js'))
	.pipe(rename('vendors.min.js'))
	.pipe(dest('#dev/js/vendors/'))
}

function imagesDev() {
	return src('#src/img/**/*')
	.pipe(dest('#dev/img'))
}

function otf2ttf() {
	return src('#src/fonts/**/*.otf')
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest('#src/fonts'))
}

function fontsDev() {
	src('#src/fonts/**/*.ttf')
		.pipe(ttf2woff())
		.pipe(dest('#dev/fonts'))
	return src([
		'#src/fonts/**/*',
		'!#src/fonts/**/*.otf'
	])
		.pipe(ttf2woff2())
		.pipe(dest('#dev/fonts'))
}

function cleanDev() {
	return del('#dev/**/*')
}

function watchDev() {
	watch(['#src/components/*.html','#src/views/*.html'], htmlDev);
	watch(['#src/**/*.scss'], styleDev);
	watch(['#src/js/**/*.js', '!#src/js/script.min.js', '!#src/js/vendors/vendors.min.js'], jsDev);
	watch(['#dev/index.html']).on('change', browserSync.reload);
}

exports.htmlDev = htmlDev;
exports.styleDev = styleDev;
exports.jsDev = jsDev;
exports.jsVendorsDev = jsVendorsDev;
exports.imagesDev = imagesDev;
exports.otf2ttf = otf2ttf;
exports.fontsDev = fontsDev;
exports.cleanDev = cleanDev;
exports.browsersyncDev = browsersyncDev;
exports.watchDev = watchDev;
exports.dev = parallel(cleanDev, htmlDev, styleDev, jsDev, jsVendorsDev, imagesDev, fontsDev, browsersyncDev, watchDev);
/** *****************
 * TODO: IF THERE ARE PROBLEMS - npm cache clean --force
 * ******************
 */