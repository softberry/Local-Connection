/**
 * Created by es on 10.02.2016.
 */
'use strict';
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const stripComment = require('gulp-strip-comments');
const stripDebug = require('gulp-strip-debug');
const express = require('express');
const open = require('open');
const babel = require('gulp-babel');
const ftp = require('vinyl-ftp');
const markdown = require('gulp-markdown');

function compileJS(done) {
    return gulp.src('src/localconnection.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('test/'))
        .pipe(stripDebug())
        .pipe(stripComment())
        .pipe(uglify())
        .pipe(rename('localconnection.min.js'))
        .pipe(gulp.dest('dist/'))
        .on('finish', () => {
            done();
        });
}
gulp.task('js', () => {
    compileJS(() => { });
});

gulp.task('server', () => {

    const options = {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['htm', 'html', 'js', 'css'],
        index: ['index.html'],
        maxAge: '1d',
        redirect: false,
        setHeaders: function (res, pathname, stat) {

            res.set('x-timestamp', Date.now())
        }
    }

    const guest = express();
    const host = express();
    guest.use(express.static('test/guest'));
    guest.use(express.static('dist', options));
    host.use(express.static('test/host', options));
    host.use(express.static('dist', options));
    guest.listen(3200);
    host.listen(3000);
    compileJS(() => {
        open('http://127.0.0.1:3000');
    })
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
