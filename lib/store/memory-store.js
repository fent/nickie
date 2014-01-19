var inherits = require('util').inherits;
var has      = require('../util').has;
var Store    = require('./store');


var MemoryStore = module.exports = function() {
  this.users = {};
  this.emails = {};
};

inherits(MemoryStore, Store);


/**
 * Sets properties of a user.
 * Can be overwritten to support other types of stores.
 *
 * @param {String} nick
 * @param {Object} props
 * @param {Function(!Error)} callback
 */
MemoryStore.prototype._setUser = function(nick, props, callback) {
  var user = this.users[nick];
  if (!has(this.users, nick)) {
    this.users[nick] = user = {};
  }
  var email = props.email;
  if (email) {
    if (this.emails[email]) {
      this.emails[email]++;
    } else {
      this.emails[email] = 1;
    }
  }
  for (var key in props) {
    user[key] = props[key];
  }
  callback(null);
};


/**
 * Set a single property of a user.
 *
 * @param {String} nick
 * @param {String} prop
 * @param {Object} value
 * @param {Function(!Error)} callback
 */
MemoryStore.prototype._setUserProp = function(nick, prop, value, callback) {
  var user = this.users[nick];
  if (!user) {
    this.users[nick] = user = {};
  }
  user[prop] = value;
  callback(null);
};


/**
 * Gets metadata from user.
 * Can be overwritten to support other types of stores.
 *
 * @param {String} nick
 * @param {!String|Array.<String>}
 * @param {Function(!Error)} callback
 */
Store.prototype._getUser = function(nick, callback) {
  callback(null, this.users[nick]);
};


/**
 * Get selected properties of user.
 *
 * @param {String} nick
 * @param {Array.<String>} props
 * @param {Function(!Error, Object)} callback
 */
Store.prototype._getUserProps = function(nick, props, callback) {
  var user = this.users[nick];
  if (!user) {
    return callback(null);
  }
  var values = {};
  for (var i = 0, len = props.length; i < len; i++) {
    var key = props[i];
    values[key] = user[key];
  }
  callback(null, values);
};


/**
 * Get one property of a user.
 *
 * @param {String} nick
 * @param {String} prop
 * @param {Function(!Error, Object)} callback
 */
Store.prototype._getUserProp = function(nick, prop, callback) {
  var user = this.users[nick];
  if (user) {
    callback(null, user[prop]);
  } else {
    callback(null);
  }
};


/**
 * Get total number of accounts registered under a given email.
 *
 * @param {String} email
 * @param {Function(!Error, Number)} callback
 */
Store.prototype.getNumOfAccounts = function(email, callback) {
  callback(null, this.emails[email] || 0);
};
