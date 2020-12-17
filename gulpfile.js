// COMMON
const { src, dest, watch, parallel, series } = require('gulp');
const rename = require("gulp-rename");
const concat = require('gulp-concat');
const del = require('del');
//SERVER
const browserSync = require('browser-sync').create();
//CSS
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
// JS
const uglify = require('gulp-uglify-es').default;
// IMAGE
const imagemin = require('gulp-imagemin');

//SERVER 
function browsersync() {
	browserSync.init({
			server: {
					baseDir: "src/"
			}
	});
}

// STYLES CONVERTER
function styles() {
	return src('src/style.scss')
		.pipe(autoprefixer({
			overrideBrowserslist : 'last 10 version',
			grid: 'autoplace'
		}))
		.pipe(scss({outputStyle: 'expanded'}))
		.pipe(dest('src/css'))
		.pipe(scss({outputStyle: 'compressed'}))
		.pipe(rename('style.min.css'))
		.pipe(dest('src/css'))
		.pipe(browserSync.stream())
}
/*
	sass({outputStyle: 'compressed'}) - for minification
	sass({outputStyle: 'expanded'}) - for beatify
*/

//JAVASCRIPT CONVERTER
function js() {
	return src([
		'src/js/main.js',
		'!src/js/vendors/vendors.min.js'
	])
	.pipe(uglify())
	.pipe(rename('script.min.js'))
	.pipe(dest('src/js'))
	.pipe(browserSync.stream())
}
function jsVendors() {
	return src([
		'node_modules/jquery/dist/jquery.js',
	])
	.pipe(uglify())
	.pipe(concat('vendors.js'))
	.pipe(rename('vendors.min.js'))
	.pipe(dest('src/js/vendors/'))
}

// IMAGES CONVERTOR
function images() {
	return src('src/img/**/*')
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
	.pipe(dest('dist/images'))
}

//WATCH FILES
function watching() {
	watch(['src/style.scss'], styles);
	watch(['src/js/**/*.js', '!src/js/script.min.js', '!src/js/vendors/vendors.min.js'], js);
	watch(['src/*.html']).on('change', browserSync.reload);
}

// BUILD PRODUCT
function build() {
	return src([
		'src/*.html',
		'src/css/**/*.css',
		'src/js/**/*.js',
		'src/fonts/**/*'
	], {base: 'src'})
	.pipe(dest('dist'))
}

//CLEAN DIST
function cleanDist() {
	return del('dist/**/*')
}

exports.styles = styles;
exports.js = js;
exports.jsVendors = jsVendors;
exports.images = images;
exports.watching = watching;
exports.browsersync = browsersync;
exports.build = build;
exports.cleanDist = cleanDist;
exports.dev = parallel(styles, js, jsVendors, browsersync, watching);
exports.start = series(cleanDist, images, build);