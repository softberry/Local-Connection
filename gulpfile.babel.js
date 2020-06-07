/**
 * Created by es on 10.02.2016.
 */
'use strict';

const { src, dest, series} = require('gulp');
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
    return src('src/localconnection.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest('test/'))
        .pipe(stripDebug())
        .pipe(stripComment())
        .pipe(uglify())
        .pipe(rename('localconnection.min.js'))
        .pipe(dest('dist/'))
        .on("finish",done);
}

function js(cb){
    compileJS(cb);
}
function serve(cb) {
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
    });
    cb();
}
/** CI Deploy */
function deploy (cb){
    
    const conn = ftp.create({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASS,
        parallel: 10
    });

    return src('README.md')
        .pipe(markdown())
        .pipe(rename('doc.txt'))
        .pipe(conn.dest('./'));
        
}

exports.js=compileJS;
exports.deploy=deploy;
exports.serve=series(js,serve);

exports.default=compileJS;