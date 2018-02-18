/**
 * Created by es on 10.02.2016.
 */
;
'use strict';
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    stripComment = require('gulp-strip-comments'),
    stripDebug = require('gulp-strip-debug'),
    browserSync = require('browser-sync');


gulp.task('js', function () {
    gulp.src('src/localconnection.js')
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
        files:['**'],
        server: ['src', 'test/guest','docs'],
        port: '3200'
    }, () => {
        var host = browserSync.create()
        host.init({
            open: true,
            online: false,
            files:['**'],
            server: 'test/host',
            port: '3300'
        })
    });


})
gulp.task('default', ['js','server']);