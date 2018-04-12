/** @author Emre Sakarya
 * @desc Local Connection API is used to synchronise and allow communicate iframes with each other.<br />
 * <p>It has only one method 'connect' as described below. It doesn't need to be initialized. <hr/></p>
 * Download :<a href="">Development Version</a>
 * @namespace LC
 * @public
 *    */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalConnection = function () {
    function LocalConnection(_opt) {
        _classCallCheck(this, LocalConnection);

        var self = this;
        window.LC = self;
        self.key = _opt.key;
        self.name = _opt.name;
        self.frames = _opt.frames;
        self.timeout = Number.parseInt(_opt.timeout, 10) || 0;
        self.onConnect = _opt.onConnect || function () {};
        self.onTimeout = _opt.onTimeout || function () {};
        self._timestamp = 0;
        self.connected = false;
        self.CustomError = function (msg) {
            this.name = 'LocalConnectionCusomError. https://github.com/softberry/Local-Connection';
            this.message = msg;
        };

        if (self.missingOptions(_opt)) {
            return;
        }

        self._timestamp = self.timeout === 0 ? 0 : Date.now() + self.timeout * 1000;

        if (window.addEventListener) {
            window.addEventListener('load', function () {
                self.ready = true;
                console.log(self.name, ' ready ', self.ready);
            });
        } else {
            window.attachEvent('onload', function () {
                self.ready = true;
                console.log(self.name, ' ready ', self.ready);
            });
        }
        self.ready = window.document.readyState === 'complete';

        /*
        Try to connect
        */
        self.reconnect();
    }

    /**
     * Validates mandatory options.
     * @param {object} _opt Settings object.
     */

    _createClass(LocalConnection, [{
        key: 'missingOptions',
        value: function missingOptions(_opt) {
            var self = this;
            try {
                if ((typeof _opt === 'undefined' ? 'undefined' : _typeof(_opt)) !== 'object') {
                    throw new self.CustomError('LocalConnection required options key,name,frames must be defined!');
                }
                console.log(_opt.key);
                if (!_opt.key) {
                    throw new self.CustomError('key (UniqueKey) must be defined ');
                }
                if (!_opt.name) {
                    throw new self.CustomError('name is not defined. Each document needs a name as string (a-z,A-Z,0-9)');
                }
                if (!_opt.frames) {
                    throw new self.CustomError('frames are not defined. Give other document names in array');
                }
                if (typeof _opt.frames === 'string') {
                    _opt.frames = _opt.frames.split(',');
                }
                if (!Array.isArray(_opt.frames) || _opt.frames.length === 0) {
                    throw new self.CustomError('frame names should be comma separated string or an Array of stings.');
                }
            } catch (e) {
                console.error(e.message, e.name);
                return true;
            }
            return false;
        }
        /**
             * 1-   if timeouted call onTimeout function and quit
             * 2-   tries to find and all other iframes
             * 3-   updates connected status
             * 4-   on success : calls onConnect function
             * 5-   on error : tries to connect again in a second
             * @access private
        */

    }, {
        key: 'reconnect',
        value: function reconnect() {
            var self = this;
            if (self.timeout > 0 && Date.now() > self._timestamp) {
                /*  Do not try to connect anymore, Timed out */
                return self.onTimeout();
            }
            if (window.parent === window) {
                /* 'window' is not in iframe, which means there is no other frames available. Quit trying */
                return self.onTimeout();
            }
            var n = 0;
            for (n = 0; n < self.frames.length; n++) {
                self[self.frames[n]] = self[self.frames[n]] || self.getFrameByName(self.frames[n]);
            }

            /* Update connection status */
            self.connected = self.isConnected();

            if (self.connected) {
                /* Call onConnect Function if connection established */
                self.onConnect();
            } else {
                /* Try to reconnect in a second   if connection is not yet  established */
                window.setTimeout(function () {
                    self.reconnect();
                }, 1000);
            }
        }
        /**
         * If all other iframes found return true , false otherwise
         * @returns {boolean}
         * @access private
         */

    }, {
        key: 'isConnected',
        value: function isConnected() {
            var status = true;
            var self = this;
            for (var e = 0; e < self.frames.length; e++) {
                if (self[self.frames[e]] === null) {
                    status = false;
                }
                console.log(self.name, 'try to connect: ', self.frames[e], status);
            }
            return status;
        }

        /**
         * Search and find a iframe by Name.
         * @param frame
         * @returns {*} found iframe window as object or null if not found
         * @access private
         */

    }, {
        key: 'getFrameByName',
        value: function getFrameByName(frame) {
            var self = this;
            if (frame === self.name) {
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

                    if (deepFrame.frames.length > 0 && !self[frame]) {
                        /* Seek vertical down */
                        var deeper = deeperFrame(deepFrame, frame);
                        if (deeper !== null) {
                            return deeper;
                        }
                    }
                    var checkedFrame = self.checkFrame(deepFrame, frame);
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

                if (childFrame.frames.length > 0 && !self[frame]) {
                    var deeper = deeperFrame(childFrame, frame);
                    if (deeper !== null) {
                        return deeper;
                    }
                }
                var checkedFrame = null;
                try {
                    checkedFrame = typeof childFrame.LC === 'undefined' ? null : self.checkFrame(childFrame, frame);
                } catch (e) {}

                if (checkedFrame !== null) {
                    return checkedFrame;
                }
            }
            return null;
        }
        /**
             *
             * @param checkThisOut  frameObject to be checked
             * @param frame         name of the frame that should match
             * @returns {null | window} if matches returns     checkThisOut else null
             * @private
             */

    }, {
        key: 'checkFrame',
        value: function checkFrame(checkThisOut, frame) {
            var self = this;

            try {
                if (checkThisOut.LC.key === self.key && checkThisOut.LC.name === frame && checkThisOut.LC.ready) {
                    /**
                     * Frame is found, and its ready to be connected
                     */
                    self.pair(window);
                    return checkThisOut;
                }
            } catch (e) {
                return null;
            }
            return null;
        }
        /**
         * Check key and register name if key is correct
         * @param {*} w
         */

    }, {
        key: 'pair',
        value: function pair(w) {
            var self = this;
            console.log('->', w.LC.key, self.key);
            if (w.LC.key === self.key) {
                self[w.LC.name] = w;
            }
            if (!self.connected) {
                if (self.isConnected()) {
                    self.connected = true;
                    self.onConnect();
                }
            }
        }
    }]);

    return LocalConnection;
}();

window.LocalConnection = LocalConnection;