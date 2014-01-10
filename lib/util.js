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
