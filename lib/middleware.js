var errors = require('./replies/en.js').errors;


/**
 * Returns true if `obj` contains the `prop`.
 *
 * @param {Object} obj
 * @param {String} prop
 * @return {Boolean}
 */
function has(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}


/**
 * @param {Array.<String>} commands
 * @param {String} inc
 * @return {Function(Function)}
 */
exports.unknownCommand = function(commands, inc) {
  var commandsMap = {};
  for (var i = 0, len = commands.length; i < len; i++) {
    commandsMap[commands[i]] = true;
  }
  return function(next) {
    var cmd = arguments[2];
    if (!has(commandsMap, cmd)) {
      next(errors.unknownCommand, inc ? inc + ' ' + cmd : cmd);
    } else {
      next();
    }
  };
};


exports.notEnoughParameters = function(n) {
  return function(next) {
    if (arguments.length < n + 2) {
      next(errors.notEnoughParameters);
    } else {
      next();
    }
  };
};


exports.networkServices = function(next, nick, target) {
  if (has(this.options.networkServices, target)) {
    next(errors.networkServices, target);
  } else {
    next();
  }
};


exports.isRegistered = function(next, nick, target) {
  this.store.isRegistered(target, function(registered) {
    if (!registered) {
      next(errors.notRegistered, target);
    /*
    } else if (!verified) {
      next(errors.awaitingVerification);
    */
    } else {
      next();
    }
  });
};


exports.amRegistered = function(next, nick) {
  exports.isRegistered.call(this, next, null, nick);
};


var emailRegexp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/;
exports.checkEmail = function(next, nick, password, email) {
  if (emailRegexp.test(email)) {
    next();
  } else {
    next(errors.invalidEmail);
  }
};


exports.tooManyAccounts = function(next, nick, password, email) {
  var max = this.options.maxAccounts;
  if (max === 0) {
    return next();
  }

  this.store.getNumOfAccounts(email, function(n) {
    if (n > max) {
      next(errors.tooManyAccounts, email);
    } else {
      next();
    }
  });
};


exports.alreadyRegistered = function(next, nick) {
  this.store.isRegistered(nick, function(registered) {
    if (registered) {
      next(errors.alreadyRegistered, nick);
    } else {
      next();
    }
  });
};


exports.tooSoon = function(next, nick) {
  var min = this.options.minBeforeRegister;
  if (min === 0) {
    return next();
  }

  this.store.getConnectedTime(nick, function(time) {
    var diff = Date.now() - time;
    if (diff / 1000 < min) {
      next(errors.tooSoon, min, 'minute' + (min === 1 ? '' : 's'));
    } else {
      next();
    }
  });
};


exports.accessDenied = function(next, nick, target) {
  if (nick !== target && !has(this.options.ops, nick)) {
    next(errors.accessDenied);
  } else {
    next();
  }
};


exports.notAwaitingAuthorization = function(next, nick, op, target) {
  this.store.isRegistered(nick, function(registered, verified) {
    if (!registered) {
      next(errors.notRegistered, nick);

    } else if (verified) {
      next(errors.notAwaiting, target);

    } else {
      next();
    }
  });
};


exports.isIdentified = function(next, nick) {
  this.store.isIdentified(nick, function(identified) {
    if (identified) {
      next();
    } else {
      next(errors.notIdentified);
    }
  });
};
