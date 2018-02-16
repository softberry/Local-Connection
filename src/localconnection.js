/**
 * Created by es on 12.02.2016.
 */
/** @author Emre Sakarya 
 *
 * @desc Local Connection API is used to synchronise and allow communicate iframes with each other.<br />
 * <p>It has only one method 'connect' as described below. It doesn't need to be initialized. <hr/></p>
 * Download :<a href="">Development Version</a>
 * @namespace LC
 * @public
 *    */
var LC = window.LC || {};
(function (_LC) {
    'use strict';
    /**
         * Holds the current timestamp on initialiasation of the LC object.
         * Timestamp is only used if timout variable set to true
         * @type {number}
         */
    var timestamp = 0;
    /**
     *
     * @param checkThisOut  frameObject to be checked
     * @param frame         name of the frame that should match
     * @returns {null | window} if matches returns     checkThisOut else null
     * @private
     */
    var _checkFrame = function (checkThisOut, frame) {
        try {
            if (checkThisOut.LC.key === _LC.key & checkThisOut.name === frame && checkThisOut.LC.ready) {
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
    };
    /**
     * Search and find a iframe by Name.
     * @param frame
     * @returns {*} found iframe window as object or null if not found
     * @access private
     */
    var _getFrameByName = function (frame) {
        if (frame === _LC.name) {
            return window;
        }
        var top = window;

        /**
         *
         * @param objFrame  frameObject to be scanned
         * @param frame     name of the frame that should match
         * @returns {*}     if matches returns     objFrame else continue to seek deeper and returns null
         */
        function deeperFrame(objFrame, frame) {
            var d = 0;
            while (d < objFrame.length) {
                var deepFrame = objFrame.frames[d];
                d++;
                if (deepFrame.frames.length > 0 && window.LC[frame] === null) {
                    /* Seek vertical down */
                    var deeper = deeperFrame(deepFrame, frame);
                    if (deeper !== null) {
                        return deeper;
                    }
                }
                var checkedFrame = _checkFrame(deepFrame, frame);
                if (checkedFrame !== null) {
                    return checkedFrame;
                }
            }
            return null;
        }

        /**
         * Climb the  DOM first vertically, and then seek iframes horizontally
         */
        while (top !== top.parent) {
            /** Seek vertical up */
            top = top.parent;
        }
        var i = 0;
        while (i < top.frames.length) {
            /** Seek horizontal */
            var childFrame = top.frames[i];
            i++;
            /** Seek vertical down */
            if (childFrame.frames.length > 0 && window.LC[frame] === null) {
                var deeper = deeperFrame(childFrame, frame);
                if (deeper !== null) {
                    return deeper;
                }
            }
            var checkedFrame = _checkFrame(childFrame, frame);
            if (checkedFrame !== null) {
                return checkedFrame;
            }
        }
        return null;
    };
    /**
     * If all other iframes found return true , false otherwise
     * @returns {boolean}
     * @access private
     */
    var _isConnected = function () {
        var status = true;

        for (var e = 0; e < _LC.frames.length; e++) {
            if (_LC[_LC.frames[e]] === null) {
                status = false;
            }
            console.log(_LC.name, 'try to connect ', _LC.frames[e], status);
        }
        return status;
    };
    /**
     * Minimum requirements tested to establish a connection.
     * @returns {boolean}
     * @access private
     */
    var _validate = function () {
        if (_LC.key === '') {
            return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'A unique Handshake message must be defined.\n');
        }
        if (_LC.name === '') {
            return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'window name   must be defined.\n');
        }
        if (typeof _LC.frames === 'string') {
            _LC.frames = _LC.frames.split(',');
        }
        if (_LC.frames.length === undefined || _LC.frames.length === 0) {
            return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Companion names must  be defined.\n');
        }
        if (_LC.onConnect && typeof _LC.onConnect !== 'function') {
            return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'on connect  must be a function.\n');
        }
        if (_LC.onTimeout && typeof _LC.onTimeout !== 'function') {
            return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'on connect function must be a function.\n');
        }
        return true;
    };
    /**
     * 1-   if timeouted call onTimeout function and quit
     * 2-   tries to find and all other iframes
     * 3-   updates connected status
     * 4-   on success : calls onConnect function
     * 5-   on error : tries to connect again in a second
     * @access private
     */
    var _reconnect = function () {
        if (_LC.timeout > 0 && new Date().getTime() > timestamp) {
            /*  Do not try to connect anymore, Timed out */
            return _LC.onTimeout();
        }
        if (window.parent === window) {
            /* 'window' is not in iframe, which means there is no other frames available. Quit trying */
            return _LC.onTimeout();
        }
        for (var n = 0; n < _LC.frames.length; n++) {
            var checkFrame = _LC[_LC.frames[n]];
            if (checkFrame === null) {
                _LC[_LC.frames[n]] = _getFrameByName(_LC.frames[n]);
            }
        }

        /* Update connection status */
        _LC.connected = _isConnected();
        /* Call onConnect Function if connection established */
        /* eslint no-unused-expressions: 0 */
        _LC.connected ? _LC.onConnect() : window.setTimeout(_reconnect, 1000);
    };
    /**
     * Reset Timeout counter
     * @access private
     */
    var _counterReset = function () {
        timestamp = new Date().getTime() + (_LC.timeout * 1000);
    };
    /**
     * @memberof LC
     * @type {number}
     * @private
     */
    _LC.timeout = 0;
    /**
     * Holds the readyState of current Window
     * @private
     * @type {boolean}
     */
    _LC.ready = false;
    /** Array of strings , or comma seperated string name of other iframes
     * @memberof LC
     * @private
     * @type {array|string}
     * */
    _LC.frames = _LC.frames || [];
    /** Name of main window
     * @memberof LC
     * @private
     * @type {string} */
    _LC.name = _LC.name || '';
    /** Unique connectionID [handshakeKEY]
     * @memeberof LC
     * @private
     * @type {string} */
    _LC.key = _LC.key || '';
    /** Keep track of connection status
     * @memberof LC
     * @private */
    _LC.connected = false;
    /** Required onconnect function
     * @memberof LC
     * @private
     * @type function  */
    _LC.onConnect = _LC.onConnect || function () {
        console.log('connected');
    };
    /** Required if timeout > 0
     * @memberof LC
     * @type function
     * @private
     * */
    _LC.onTimeout = _LC.onTimeout || function () {
        console.log('timed out');
    };
    /** Set ready status of on window load */
    if (window.addEventListener) {
        window.addEventListener('load', function () {
            _LC.ready = true;
        });
    } else {
        window.attachEvent('onload', function () {
            _LC.ready = true;
        });
    }
    _LC.ready = window.document.readyState === 'complete';
    _LC._pair = function (w) {
        /** Check key and register name if key is correct */
        if (w.LC.key === _LC.key) {
            _LC[w.LC.name] = w;
        }
        if (!_LC.connected) {
            if (_isConnected()) {
                _LC.connected = true;
                _LC.onConnect();
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
    _LC.connect = function (/* key, name, frames, [onConnect, timeout, onTimeout] */) {
        /* If timeout given, start counter   */
        if (_LC.timeout > 0) {
            _counterReset();
        }
        if (arguments.length === 0 && _validate()) {
            /**
             * @description connect method 1 : all required values are pre-defined */
            window.name = _LC.name;
            /* If timeout given start counter */
            if (_LC.timeout > 0) {
                _counterReset();
            }
            return _reconnect();
        }
        if (arguments.length === 1 && typeof arguments[0] === 'object') {
            /** Connect method 2 : all required values are passed as an object */
            var obj = arguments[0];
            _LC.key = obj.key || _LC.key;
            _LC.name = obj.name || _LC.name;
            _LC.frames = obj.frames || _LC.frames;
            _LC.timeout = Number(obj.timeout) > 0 ? obj.timeout : 0;
            _LC.onConnect = obj.onConnect || _LC.onConnect;
            _LC.onTimeout = obj.onTimeout || _LC.onTimeout;
            if (_LC.timeout > 0) {
                _counterReset();
            }
            if (_validate()) {
                window.name = _LC.name;
                return _reconnect();
            }
            return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Invalid values passed...');
        }
        if (arguments.length > 1) {
            /** Connect method 3 : all parameters passed as is to the function */
            /** Assign uniqueConnectionID
             * @private */
            _LC.key = String(arguments[0]);

            /** Check & Assign current window name */
            if (arguments.length < 2 && _LC.name !== '') {
                console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'window name   must be defined.\n');
            } else {
                _LC.name = arguments[1];
                window.name = _LC.name;
            }
            /** Check and assign Companion iframe names into Array */
            if (arguments.length < 3 && _LC.frames.length === 0) {
                return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Companion names must be defined.\n');
            }
            var frameNames = arguments[2];
            if (typeof frameNames === 'object' || frameNames.length > 0) {
                _LC.frames = frameNames;
            } else if (typeof frameNames === 'string') {
                frameNames = arguments[2].split(',');
                if (frameNames.length > 0) {
                    _LC.frames = frameNames;
                } else {
                    return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Companion names must be defined.\n');
                }
            }

            if (arguments.length > 3) {
                /** Check and Assign onConnect Function - if exists - */
                if (typeof arguments[3] === 'function') {
                    _LC.onConnect = arguments[3];
                } else {
                    console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'onConnect must be a function.\n');
                }
                /** Check and Assign timeout - if exists & higher then zero  - */
                if (arguments[4] && typeof arguments[4] === 'number') {
                    _LC.timeout = arguments[4];
                    if (_LC.timeout > 0) {
                        _counterReset();
                    }
                } else {
                    console.log('%c-->LC: ', 'background:#f00;color:#fff;', ' timeout must be a number.\n');
                }
                /** Check and Assign onTimeout Function - if exists - */
                if (arguments[5] && typeof arguments[5] === 'function') {
                    _LC.onTimeout = arguments[5];
                } else {
                    console.log('%c-->LC: ', 'background:#f00;color:#fff;', ' onTimeout must be a function.\n');
                }
            }
            /** Validate all parameters and try to connect */
            if (_validate()) {
                window.name = _LC.name;
                return _reconnect();
            }
            return console.log('%c-->LC: ', 'background:#f00;color:#fff;', 'Invalid values passed...');
        }
    };
})(LC);
