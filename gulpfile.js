/**
 * Created by es on 10.02.2016.
 */
'use strict';
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const stripComment = require('gulp-strip-comments');
const stripDebug = require('gulp-strip-debug');
const browserSync = require('browser-sync');
const babel = require('gulp-babel');
const ftp = require('vinyl-ftp');
const markdown = require('gulp-markdown');

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
    const guest = browserSync.create();

    guest.init({
        open: false,
        online: false,
        files: ['**'],
        server: ['src', 'test/guest', 'docs'],
        port: '3200'
    }, () => {
        const host = browserSync.create();
        host.init({
            open: true,
            online: false,
            files: ['**'],
            server: 'test/host',
            port: '3300'
        });
    });
});

/** CI Deploy */
gulp.task('deploy', () => {
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
gulp.task('default', ['js', 'server']);
