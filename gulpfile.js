/**
 * Created by es on 10.02.2016.
 */
;
'use strict';
const gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    stripComment = require('gulp-strip-comments'),
    stripDebug = require('gulp-strip-debug'),
    browserSync = require('browser-sync'),
    babel = require('gulp-babel'),
    markdown = require('gulp-markdown');



gulp.task('js', () => {
    gulp.src('src/localconnection.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('test/'))
        .pipe(stripDebug())
        .pipe(stripComment())
        .pipe(uglify())
        .pipe(rename('localconnection.min.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('server', () => {
    var guest = browserSync.create();

    guest.init({
        open: false,
        online: false,
        files: ['**'],
        server: ['src', 'test/guest', 'docs'],
        port: '3200'
    }, () => {
        var host = browserSync.create()
        host.init({
            open: true,
            online: false,
            files: ['**'],
            server: 'test/host',
            port: '3300'
        })
    });
});
gulp.task('doc', () => {
    gulp.src('README.md')
        .pipe(markdown())
        .pipe(rename('readme.html'))
        .pipe(gulp.dest('doc'))

}
);
gulp.task('default', ['js', 'doc', 'server']);