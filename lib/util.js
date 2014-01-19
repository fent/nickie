/**
 * Returns true if `obj` contains the `prop`.
 *
 * @param {Object} obj
 * @param {String} prop
 * @return {Boolean}
 */
exports.has = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};


/**
 * Adds properties from `b` to `a` that are not already in `a`.
 *
 * @param {Object} a
 * @param {Object} b
 */
exports.extend = function(a, b) {
  for (var i in b) {
    if (!a[i]) {
      a[i] = b[i];
    }
  }
};


/**
 * Provides a "middleware" like API.
 * If `next` is called with a msg, it stops.
 * It can be called multiple times.
 * If called with no arguments it calls the next middleware.
 *
 * @param {Object} self
 * @param {Array.<Function>} middleware
 * @param {Array.<Object>} args
 */
exports.next = function(self, middleware, args) {
  var i = 0;

  var done = function() {
    // Call next middleware if no error.
    if (arguments.length === 0 || arguments[0] === null) {
      middleware[i++].apply(self, args);


    // If there is an error/success,
    // call reply with the response msg.
    } else {
      var a = [args[1]].concat(Array.prototype.slice.apply(arguments));
      self.reply.apply(self, a);
    }
  };

  // Invoke done() once to start.
  args.unshift(done);
  done();
};
