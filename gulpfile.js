/**
 * Created by es on 10.02.2016.
 */
;
'use strict';
var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    stripComment = require('gulp-strip-comments'),
    stripDebug = require('gulp-strip-debug'),
    del = require('del'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    sftp = require('gulp-sftp'),
    jsdoc = require('gulp-jsdoc3'),
    browserSync = require('browser-sync');

gulp.task('clean:out', function () {
    return del(['./out/*.html']);
});
gulp.task('js', function () {
    gulp.src('src/localconnection.js')
        .pipe(gulp.dest('test/'))
        .pipe(stripDebug())
        .pipe(stripComment())
        .pipe(uglify())
        .pipe(rename('localconnection.min.js'))
        .pipe(gulp.dest('dist/'))
        .pipe(livereload());
});
gulp.task('jsdoc', ['clean:out'], function () {
    gulp.src(['README.md', 'src/localconnection.js'], { read: false })
        .pipe(jsdoc());
});
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('src/localconnection.js', ['js', 'jsdoc']);

});

gulp.task('server', () => {

    var guest = browserSync.create();


    guest.init({
        open: false,
        online: false,
        server: ['src', 'test/guest','docs'],
        port: '3200'
    }, () => {
        var host = browserSync.create()
        host.init({
            open: true,
            online: false,
            server: 'test/host',
            port: '3300'
        })
    });


})
gulp.task('default', ['js', 'jsdoc', 'watch']);