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
    markdown = require('gulp-markdown'),
    ftp = require('vinyl-ftp'),
    minimist = require('minimist');


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
gulp.task('deploy', function () {
    const argv = require('minimist')(process.argv.slice(2));
    const conn = ftp.create({
        host: argv.host,
        user: argv.user,
        password: argv.pass,
        parallel: 10
    });

    gulp.src('README.md')
        .pipe(markdown())
        .pipe(rename('doc.txt'))
        .pipe(conn.dest('./'));

});
gulp.task('default', ['js',  'server']);