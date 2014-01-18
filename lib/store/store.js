var crypto = require('crypto');


function hash(pass) {
  var sha = crypto.createHash('sha256');
  sha.update('saltysaltsaltyum' + pass);
  return sha.digest('hex');
}

function genKey() {
  return Math.floor(Math.random() * 1e10).toString(16);
}


// User Schema
//   nick                  String
//   password              String (hashed)
//   email                 String
//   online                Boolean
//   identified            Boolean
//   from                  String
//   registered            Date
//   lastSeen              Date
//   connectedTime         Date
//   lastQuitMsg           String
//   verified              Boolean
//   key                   String
//   options               Array.<Strings>


/**
 * @constructor
 */
var Store = module.exports = function() {
  this.users = {};
};


/**
 * Sets properties of a user.
 *
 * @param {String} nick
 * @param {Object} props
 * @param {Function(!Error)} callback
 */
Store.prototype._setUser = function() {
  throw new Error('not yet implemented');
};


/**
 * Set a single property of a user.
 *
 * @param {String} nick
 * @param {String} prop
 * @param {Object} value
 * @param {Function(!Error)} callback
 */
Store.prototype._setUserProp = function() {
  throw new Error('not yet implemented');
};


/**
 * Gets all data of user.
 *
 * @param {String} nick
 * @param {Function(!Error, Object)} callback
 */
Store.prototype._getUser = function() {
  throw new Error('not yet implemented');
};


/**
 * Get selected properties of user.
 *
 * @param {String} nick
 * @param {Array.<String>} props
 * @param {Function(!Error, Object)} callback
 */
Store.prototype._getUserProps = function() {
  throw new Error('not yet implemented');
};


/**
 * Get one property of a user.
 *
 * @param {String} nick
 * @param {String} prop
 * @param {Function(!Error, Object)} callback
 */
Store.prototype._getUserProp = function() {
  throw new Error('not yet implemented');
};


/**
 * Get total number of accounts registered under a given email.
 *
 * @param {String} email
 * @param {Function(!Error, Number)} callback
 */
Store.prototype.getNumOfAccounts = function() {
  throw new Error('not yet implemented');
};


/**
 * User connects to the server.
 *
 * @param {String} nick
 * @param {String} ip
 * @param {Function(!Error)} callback
 */
Store.prototype.userConnected = function(nick, ip, callback) {
  var now = Date.now();
  this._setUser(nick, {
    online: true,
    whois: 'localhost',
    from: ip,
    options: [],
    lastSeen: now,
    connectedTime: now,
  }, callback);
};


/**
 * User disconnects from the server.
 *
 * @param {String} nick
 * @param {String} msg
 * @param {Function(!Error)} callback
 */
Store.prototype.userDisconnected = function(nick, msg, callback) {
  this._setUser(nick, {
    online: false,
    identified: false,
    lastQuitMsg: msg,
  }, callback);
};


/**
 * Checks if a user is registered.
 *
 * @param {String} nick
 * @param {Function(!Error, Boolean, Boolean)} callback 
 */
Store.prototype.isRegistered = function(nick, callback) {
  this._getUserProps(nick, ['registered', 'verified'], function(err, user) {
    if (err) return callback(err);
    if (user && user.registered) {
      callback(null, true, user.verified);
    } else {
      callback(null, false, false);
    }
  });
};


/**
 * Checks if a user has identified.
 *
 * @param {String} nick
 * @param {Functino(!Error, Boolean)} callback
 */
Store.prototype.isIdentified = function(nick, callback) {
  this._getUserProp(nick, 'identified', callback);
};


/**
 * Returns user info.
 *
 * @param {String} nick
 * @param {String} target
 * @param {Function(!Error, User)} callback
 */
Store.prototype.info = function(nick, target, callback) {
  this._getUser(target, callback);
};


/**
 * Identifies (logs in) a user.
 *
 * @param {String} nick
 * @param {String} password
 * @param {Function(!Error, Boolean)} callback
 */
Store.prototype.identify = function(nick, password, callback) {
  var self = this;
  this._getUserProp(nick, 'password', function(err, userPassword) {
    if (err) return callback(err);
    if (hash(password) === userPassword) {
      self._setUserProp(nick, 'identified', true, function(err) {
        if (err) return callback(err);
        callback(null, true);
      });
    } else {
      callback(null, false);
    }
  });
};


/**
 * Opposite of identify.
 *
 * @param {String} nick
 * @param {Function(!Error)} callback
 */
Store.prototype.logout = function(nick, callback) {
  this._setUserProp(nick, 'identified', false, callback);
};


/**
 * Registers a user.
 *
 * @param {String} nick
 * @param {String} password
 * @param {String} email
 * @param {Function(!Error)}
 */
Store.prototype.register = function(nick, password, email, callback) {
  this._setUser(nick, {
    password: hash(password),
    email: email,
    registered: Date.now(),
    identified: true,
    verified: false,
    key: genKey(),
  }, callback);
};


/**
 * Opposite of register.
 * If `target` is given drop that user.
 * otherwise drop `nick`.
 *
 * @param {String} nick
 * @param {String} target
 * @param {Function(!Error)}
 */
Store.prototype.drop = function(nick, target, callback) {
  this._setUser(target || nick, {
    password: null,
    email: null,
    registered: null,
    verified: null,
    key: null,
  }, callback);
};


/**
 * Verifies a user's registration.
 *
 * @param {String} nick
 * @param {String} target
 * @param {String} key
 * @param {Function(!Error, Boolean)} callback
 */
Store.prototype.verify = function(nick, target, key, callback) {
  var self = this;
  this._getUserProp(nick, 'key', function(err, userKey) {
    if (err) return callback(err);
    if (userKey === key) {
      self._setUser(nick, {
        verified: true,
        key: null,
      }, function(err) {
        if (err) return callback(err);
        callback(null, true);
      });
    } else {
      callback(null, false);
    }
  });
};


/**
 * Change a user's password.
 *
 * @param {String} nick
 * @param {String} newPass
 * @param {Function(!Error)} callback
 */
Store.prototype.setPassword = function(nick, newPass, callback) {
  this._setUserProp(nick, 'password', hash(newPass), callback);
};


/**
 * gets the time the user connected to the server
 *
 * @param {String} nick
 * @param {Function(!Error)} callback
 */
Store.prototype.getConnectedTime = function(nick, callback) {
  this._getUserProp(nick, 'connectedTime', callback);
};
