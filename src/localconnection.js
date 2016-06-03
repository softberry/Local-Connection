/**
 * Created by es on 12.02.2016.
 */
/** @author Emre Sakarya
 *
 * @desc Local Connection API is used to synchronise and allow communicate iframes with each other.<br />
 * <p>It has only one method 'connect' as desribed below. It doesn't need to be initialized. <hr/></p>
 * Download :<a href="">Development Version</a>
 * @namespace LC
 * @public
 *    */
;
var LC = LC || {};
(function (LC) {
    "use strict";
    /**
     * Holds the current timestamp on initialiasation of the LC object.
     * Timestamp is only used if timout variable set to true
     * @type {number}
     */
    var timestamp = 0,
        /**
         *
         * @param checkThisOut  frameObject to be checked
         * @param frame         name of the frame that should match
         * @returns {null | window} if matches returns     checkThisOut else null
         * @private
         */
        _checkFrame = function (checkThisOut, frame) {
            try {
                if (checkThisOut.key == LC.key & checkThisOut.name == frame && checkThisOut.LC.ready) {
                    /**
                     * Frame is found, and its ready to be connected
                     */

                    checkThisOut.LC._pair(window);
                    return checkThisOut;
                }
            } catch (e) {
                return null;
            }
            return null;
        },
        /**
         * Search and find a iframe by Name.
         * @param frame
         * @returns {*} found iframe window as object or null if not found
         * @access private
         */
        _getFrameByName = function (frame) {
            if (frame == LC.name) return window;
            var top = window;

            /**
             *
             * @param objFrame frameObject to be scanned
             * @param frame     name of the frame that should match
             * @returns {*}     if matches returns     objFrame else continue to seek deeper and returns null
             */
            function deeperFrame(objFrame, frame) {
                var d = 0;
                while (d < objFrame.length) {


                    var deepFrame = objFrame.frames[d];
                    d++;
                    if (deepFrame.frames.length > 0 && window.LC[frame] == null) {
                        /** seek vertical down*/
                        var deeper = deeperFrame(deepFrame, frame);
                        if (deeper != null) return deeper;

                    }
                    var checkedFrame = _checkFrame(deepFrame, frame);
                    if (checkedFrame !== null) return checkedFrame;

                }
                return null;

            }

            /**
             * Climb the  DOM first vertically, and then seek iframes horizontally
             */
            while (top !== top.parent) {
                /** seek vertical up*/
                top = top.parent;
            }
            var i = 0;
            while (i < top.frames.length) {
                /** seek horizontal */
                var childFrame = top.frames[i];
                i++;
                /** seek vertical down*/
                if (childFrame.frames.length > 0 && window.LC[frame] == null) {
                    var deeper = deeperFrame(childFrame, frame);
                    if (deeper != null) return deeper;
                }
                var checkedFrame = _checkFrame(childFrame, frame);
                if (checkedFrame !== null) return checkedFrame;

            }
            return null;
        },
        /**
         * return true if all other iframes found, false otherwise
         * @returns {boolean}
         * @access private
         */
        _isConnected = function () {

            var status = true;

            for (var e = 0; e < LC.frames.length; e++) {

                if (LC[LC.frames[e]] === null) status = false;
                console.log(LC.name, 'try to connect ', LC.frames[e], status);
            }
            return status;
        },
        /**
         *minimum requirements tested to establish a connection.
         * @returns {boolean}
         * @access private
         */
        _validate = function () {

            if (LC.key == '') return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'A unique Handshake message must be defined.\n');
            if (LC.name == '') return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'window name   must be defined.\n');
            if (typeof  LC.frames === 'string') LC.frames = LC.frames.split(',');
            if (!LC.frames.length || LC.frames.length == 0) return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Companion names must  be defined.\n');
            if (LC.onConnect && typeof LC.onConnect !== 'function') return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'on connect  must be a function.\n');
            if (LC.onTimeout && typeof LC.onTimeout !== 'function') return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'on connect function must be a function.\n');
            return true;
        },
        /**
         * 1-   if timeouted call onTimeout function and quit
         * 2-   tries to find and all other iframes
         * 3-   updates connected status
         * 4-   on success : calls onConnect function
         * 5-   on error : tries to connect again in a second
         * @access private
         */
        _reconnect = function () {
            if (LC.timeout > 0 && new Date().getTime() > timestamp) {
                /*  do not try to connect anymore, Timed out */
                return LC.onTimeout();
            }
            if (window.parent === window) {
                /* window is not in iframe, which means there is no other frames available. Quit trying*/
                return LC.onTimeout();
            }
            for (var n = 0; n < LC.frames.length; n++) {
                var checkFrame = LC[LC.frames[n]];
                if (checkFrame == null) {
                    LC[LC.frames[n]] = _getFrameByName(LC.frames[n]);
                } else {
                    //    console.log(checkFrame.toString());
                }
            }

            /* Update connection status*/
            LC.connected = _isConnected();
            /*call onConnect Function if connection established */
            LC.connected ? LC.onConnect() : window.setTimeout(_reconnect, 1000);

        },
        /**
         * Reset Timeout counter
         * @access private
         */
        _counterReset = function () {
            timestamp = new Date().getTime() + LC.timeout * 1000;
        };
    /**
     * @memberof LC
     * @type {number}
     * @private
     */
    LC.timeout = 0;
    /**
     * Holds the readyState of current Window
     * @private
     * @type {boolean}
     */
    LC.ready = false;
    /** Array of strings , or comma seperated string name of other iframes
     * @memberof LC
     * @private
     * @type {array|string}
     * */
    LC.frames = LC.frames || [];
    /** name of main window
     * @memberof LC
     * @private
     * @type {string}*/
    LC.name = LC.name || '';
    /** unique connectionID [handshakeKEY]
     * @memeberof LC
     * @private
     * @type {string}*/
    LC.key = LC.key || '';
    /** keep track of connection status
     * @memberof LC
     * @private */
    LC.connected = false;
    /** required onconnect function
     * @memberof LC
     * @private
     * @type function  */
    LC.onConnect = LC.onConnect || function () {
            console.log('connected');
        };
    /** required if timeout > 0
     * @memberof LC
     * @type function
     * @private
     * */
    LC.onTimeout = LC.onTimeout || function () {
            console.log('timed out');
        };
    /** set ready status of on window load */
    if (window.addEventListener) {
        window.addEventListener('load', function () {
            LC.ready = true;
        })
    } else {
        window.attachEvent('onload', function () {
            LC.ready = true;
        });
    }
    LC.ready = document.readyState == "complete";
    LC._pair = function (w) {
        /** check key and register name if key is correct */
        if (w.LC.key === LC.key) {
            LC[w.LC.name] = w;
        }
        if (!LC.connected) {
            if (_isConnected()) {
                LC.connected = true;
                LC.onConnect();
            }
        }
    };
    /**
     * Main constructor of the Local Connection LC object
     * @access public
     * @param {String} key - Unique connection string. Set this value for all iframes that should communicate each other. Avoid using same key for all projects.
     * @param {String} name - Name of the current window
     * @param {(String|Array)} frames - Define name of all other banners that will be connected to.
     * @param {Function} [onConnect] - Define a function that will be called as soon as successfully connected to other iframes.
     * @param {Number} [timeout] - Quit trying to connect after defined time in seconds. Default is 0 which means no timeout and keeps continuously try to connect.
     * @param {Function} [onTimeout] - Define a function that will be called if timeout occurs. It will only be called if timeout is greater then 0.
     */
    LC.connect = function () {
        /**
         * parameter[0] -required- -string-  uniqueConnectionID
         * parameter[1] -required- -string- set the name of the current window
         * parameter[2] -required- -array-l  set the name of the all  windows
         */
        /** if timeout given, start counter   */
        if (LC.timeout > 0) _counterReset();
        if (arguments.length == 0 && _validate()) {
            /**@description connect method 1 : all required values are pre-defined*/
            window.name = LC.name;
            /*if timeout given start counter */
            if (LC.timeout > 0) _counterReset();
            return _reconnect();
        }
        if (arguments.length == 1 && typeof arguments[0] === 'object') {
            /** connect method 2 : all required values are passed as an object*/
            var obj = arguments[0];
            LC.key = obj.key || LC.key;
            LC.name = obj.name || LC.name;
            LC.frames = obj.frames || LC.frames;
            LC.timeout = Number(obj.timeout) > 0 ? obj.timeout : 0;
            LC.onConnect = obj.onConnect || LC.onConnect;
            LC.onTimeout = obj.onTimeout || LC.onTimeout;
            if (LC.timeout > 0) _counterReset();
            if (_validate()) {
                window.name = LC.name;
                return _reconnect();
            } else {
                return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Invalid values passed...');
            }
        }
        if (arguments.length > 1) {
            /** connect method 3 : all parameters passed as is to the function */
            /** Assign uniqueConnectionID
             * @private*/
            LC.key = String(arguments[0]);

            /** Check & Assign current window name*/
            if (arguments.length < 2 && LC.name != '') {
                console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'window name   must be defined.\n');
            } else {
                LC.name = arguments[1];
                window.name = LC.name;
            }
            /** check and assign Companion iframe names into Array */
            if (arguments.length < 3 && LC.frames.length == 0) {
                return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Companion names must be defined.\n');
            } else {
                var frameNames = arguments[2];
                if (typeof frameNames === 'object' || frameNames.length > 0) {
                    LC.frames = frameNames;
                } else if (typeof frameNames == 'string') {

                    frameNames = arguments[2].split(',');
                    if (frameNames.length > 0) {
                        LC.frames = frameNames;
                    } else {
                        return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Companion names must be defined.\n');
                    }

                }

            }

            if (arguments.length > 3) {
                /** check and Assign onConnect Function - if exists -*/
                if (typeof arguments[3] === 'function') {
                    LC.onConnect = arguments[3];
                } else {
                    console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'onConnect must be a function.\n');
                }
                /** check and Assign timeout - if exists & higher then zero  -*/
                if (arguments[4] && typeof arguments[4] === 'number') {
                    LC.timeout = arguments[4];
                    if (LC.timeout > 0) _counterReset();
                } else {
                    console.log('%c-->LC: ', 'background:#f00;color:#fff;', ' timeout must be a number.\n');
                }
                /** check and Assign onTimeout Function - if exists -*/
                if (arguments[5] && typeof arguments[5] === 'function') {
                    LC.onTimeout = arguments[5];
                } else {
                    console.log('%c-->LC: ', 'background:#f00;color:#fff;', ' onTimeout must be a function.\n');
                }
            }
            /** Validate all parameters and try to connect */
            if (_validate()) {
                window.name = LC.name;
                return _reconnect();
            } else {
                return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Invalid values passed...');
            }
        }

    };
})(LC);