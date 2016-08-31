const concat = require('gulp-concat')
const gulp = require('gulp')

const js = [
    'src/GmxGFWLayer.js',
    'src/GmxGFWPlugin.js',
    'src/L.GFWLayer.js',
    'src/L.GFWSlider.js'
]

const css = [
    'src/L.GFWSlider.css'
]

gulp.task('js', () => {
    return gulp.src(js)
        .pipe(concat('gmxPluginGfw.js'))
        .pipe(gulp.dest('dist'))
})

gulp.task('css', () => {
    return gulp.src(css)
        .pipe(concat('gmxPluginGfw.css'))
        .pipe(gulp.dest('dist'))
})

gulp.task('default', ['js', 'css'])

gulp.task('watch', ['default'], () => {
    gulp.watch([].concat(js, css), ['default'])
})
