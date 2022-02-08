import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import del from 'del';
import csso from 'postcss-csso';
import svgstore from 'gulp-svgstore';
import squoosh from 'gulp-libsquoosh';
import webp from 'gulp-webp';
import svgo from 'gulp-svgmin';
import terser from 'gulp-terser';
import htmlmin from 'gulp-htmlmin'

// Styles

export const styles = () => {
  return gulp.src('src/sass/style.scss', {sourcemaps: true})
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', {sourcemaps: '.'}))
    .pipe(browser.stream());
}

//Reload
const reload = (done) => {
  browser.reload();
  done();
}

// HTML
const html = () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
}

// Scripts
const scripts = () => {
  return gulp.src('src/js/script.js')
    .pipe(terser())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
}

// Images
const optimizeImages = () => {
  return gulp.src('src/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('src/img/**/*.{png,jpg,svg}', {allowEmpty: true})
    .pipe(gulp.dest('build/img'))
}

// WebP
const createWebp = () => {
  return gulp.src('src/img/**/*.{png,jpg}')
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'))
}

// SVG
const svg = () =>
  gulp.src(['src/img/*.svg', '!src/img/icons/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));

const sprite = () => {
  return gulp.src('src/img/icons/*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

// Copy
const copy = (done) => {
  gulp.src([
    'src/fonts/*.{woff2,woff}',
    'src/*.ico',
    'src/manifest.webmanifest',
  ], {
    base: 'src',
    allowEmpty: true
  })
    .pipe(gulp.dest('build'))
  done();
}

// Clean
const clean = () => {
  return del('build');
};


// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('src/sass/**/*.scss', gulp.series(styles));
  gulp.watch('src/js/script.js', gulp.series(scripts));
  gulp.watch('src/*.html', gulp.series(html, reload));
}

// Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);

// Default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
