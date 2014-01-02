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
var MemoryStore = module.exports = function() {
  this.users = {};
};


/**
 * User connects to the server.
 *
 * @param {String} nick
 * @param {String} ip
 */
MemoryStore.prototype.userConnected = function(nick, ip) {
  var user = this.users[nick];

  if (!user) {
    this.users[nick] = user = {};
  }

  user.online = true;
  user.whois = 'localhost';
  user.from = ip;
  user.options = [];
  user.lastSeen = user.connectedTime = Date.now();
};


/**
 * User disconnects from the server.
 *
 * @param {String} nick
 * @param {String} msg
 */
MemoryStore.prototype.userDisconnected = function(nick, msg) {
  var user = this.users[nick];
  user.online = false;
  user.lastQuitMsg = msg;
};


/**
 * Checks if a user is registered.
 *
 * @param {String} nick
 * @param {Function(!Error, Boolean, Boolean)} callback 
 */
MemoryStore.prototype.isRegistered = function(nick, callback) {
  var user = this.users[nick];

  if (user && user.registered) {
    callback(null, true, user.verified);
  } else {
    callback(null, false, false);
  }
};


/**
 * Returns user info.
 *
 * @param {String} nick
 * @param {String} target
 * @param {Function(!Error, User)} callback
 */
MemoryStore.prototype.info = function(nick, target, callback) {
  callback(null, this.users[target]);
};


/**
 * Identifies (logs in) a user.
 *
 * @param {String} nick
 * @param {String} password
 * @param {Function(!Error, Boolean)} callback
 */
MemoryStore.prototype.identify = function(nick, password, callback) {
  var user = this.users[nick];
  var identified = hash(password) === this.users[nick].password;

  user.identified = identified;
  callback(null, identified);
};


/**
 * opposite of identify
 *
 * @param {String} nick
 * @param {Function(!Error)} callback
 */
MemoryStore.prototype.logout = function(nick, callback) {
  this.users[nick].identified = false;
  callback(null);
};


/**
 * Registers a user.
 *
 * @param {String} nick
 * @param {String} password
 * @param {String} email
 * @param {Function(!Error)}
 */
MemoryStore.prototype.register = function(nick, password, email, callback) {
  var user = this.users[nick];

  user.password = hash(password);
  user.email = email;
  user.registered = Date.now();
  user.identified = true;
  user.verified = false;
  user.key = genKey();
  callback(null);
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
MemoryStore.prototype.drop = function(nick, target, callback) {
  var user = this.users[target || nick];

  delete user.password;
  delete user.email;
  delete user.registered;
  delete user.identified;
  delete user.verified;
  delete user.key;
  callback(null);
};


/**
 * Verifies a user's registration.
 *
 * @param {String} nick
 * @param {String} target
 * @param {String} key
 * @param {Function(!Error, Boolean)} callback
 */
MemoryStore.prototype.verify = function(nick, target, key, callback) {
  var user = this.users[nick];

  if (user.key === key) {
    user.verified = true;
    delete user.key;
    callback(null, true);
  } else {
    callback(null, false);
  }
};


/**
 * Change a user's password.
 *
 * @param {String} nick
 * @param {String} newPass
 * @param {Function(!Error)} callback
 */
MemoryStore.prototype.setPassword = function(nick, newPass, callback) {
  this.users[nick].password = hash(newPass);
  callback(null);
};


/**
 * Get total number of accounts registered under a given email.
 *
 * @param {String} email
 * @param {Function(!Error, Number)} callback
 */
MemoryStore.prototype.getNumOfAccounts = function(email, callback) {
  var n = 0;

  for (var i in this.users) {
    if (this.users[i].email === email) {
      n++;
    }
  }

  callback(null, n);
};


/**
 * gets the time the user connected to the server
 *
 * @param {String} nick
 * @param {Function(!Error)} callback
 */
MemoryStore.prototype.getConnectedTime = function(nick, callback) {
  callback(null, this.users[nick].connectedTime);
};
