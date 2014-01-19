var dmw     = require('./dynamic-middleware.js');
var mw      = require('./middleware.js');
var errors  = require('./replies/en.js').errors;
var success = require('./replies/en.js').success;


exports.info = [
  mw.networkServices,
  mw.isRegistered,

  function(next, nick, target) {
    this.options.store.info(nick, target, function(err, info) {
      if (err) return next(err.message);

      next(success.info.who, nick, info.whois);
      if (info.online) {
        next(success.info.online, nick);
        next(success.info.from, info.from);
      } else {
        next(success.info.offline, nick);
      }
      next(success.info.registered, info.registered);
      next(success.info.lastSeen, info.lastSeen);
      next(success.info.lastQuitMsg, info.lastQuitMsg);
      next(success.info.email, info.email);
      next(success.info.options, info.options.join(' '));
    });
  }
];


exports.identify = [
  mw.amRegistered,

  function(next, nick, password) {
    this.options.store.identify(nick, password, function(err, identified) {
      if (err) {
        next(err.message);
      } else if (identified) {
        next(success.identify);
      } else {
        next(errors.wrongPassword, nick);
      }
    });
  }
];


exports.logout = [
  function(next, nick) {
    this.options.store.logout(nick, function(err) {
      if (err) return next(err.message);
      next(success.logout);
    });
  }
];


exports.register = [
  dmw.notEnoughParameters(2, 'register'),
  mw.checkEmail,
  mw.tooManyAccounts,
  mw.alreadyRegistered,
  mw.tooSoon,

  function(next, nick, password, email) {
    this.options.store.register(nick, password, email, function(err) {
      if (err) return next(err.message);
      next(success.register, nick);
    });
  }
];


exports.drop = [
  mw.isRegistered,
  mw.accessDenied,

  function(next, nick, target) {
    this.options.store.drop(nick, target, function(err) {
      if (err) return next(err.message);
      next(success.drop, target || nick);
    });
  }
];


exports.verify = [
  dmw.unknownCommand(['register']),
  dmw.notEnoughParameters(2, 'verify'),
  mw.notAwaitingAuthorization,

  function(next, nick, op, target, key) {
    if (op === 'register') {
      this.options.store.verify(nick, target, key, function(err, verified) {
        if (err) {
          next(err.message);
        } else if (verified) {
          next(success.verify);
        } else {
          next(errors.wrongKey, target);
        }
      });
    }
  }
];


exports.set = [
  dmw.unknownCommand(['password'], 'set'),

  function(next, nick, key, value) {
    if (key === 'password') {
      this.options.store.setPassword(nick, value, function(err) {
        if (err) return next(err.message);
        next(success.set.password, nick, value);
      });
    }
  }
];
