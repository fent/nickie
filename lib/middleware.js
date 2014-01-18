var errors = require('./replies/en.js').errors;
var has    = require('./util').has;


exports.networkServices = function(next, nick, target) {
  if (has(this.options.networkServices, target)) {
    next(errors.networkServices, target);
  } else {
    next();
  }
};


exports.isRegistered = function(next, nick, target) {
  this.store.isRegistered(target, function(err, registered) {
    if (err) {
      next(err.message);
    } else if (!registered) {
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
  exports.isRegistered.call(this, next, nick, nick);
};


var emailRegexp = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
exports.checkEmail = function(next, nick, password, email) {
  if (emailRegexp.test(email)) {
    next();
  } else {
    next(errors.invalidEmail, email);
  }
};


exports.tooManyAccounts = function(next, nick, password, email) {
  var max = this.options.maxAccounts;
  if (max === 0) {
    return next();
  }

  this.store.getNumOfAccounts(email, function(err, n) {
    if (err) {
      next(err.message);
    } else if (n >= max) {
      next(errors.tooManyAccounts, email);
    } else {
      next();
    }
  });
};


exports.alreadyRegistered = function(next, nick) {
  this.store.isRegistered(nick, function(err, registered) {
    if (err) {
      next(err.message);
    } else if (registered) {
      next(errors.alreadyRegistered, nick);
    } else {
      next();
    }
  });
};


exports.tooSoon = function(next, nick) {
  var min = this.options.minToWait;
  if (min === 0) {
    return next();
  }

  this.store.getConnectedTime(nick, function(err, time) {
    if (err) {
      next(err.message);
    } else if ((Date.now() - time) / 1000 < min) {
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
  this.store.isRegistered(target, function(err, registered, verified) {
    if (err) {
      next(err.message);
    } else if (!registered) {
      next(errors.notRegistered, target);

    } else if (verified) {
      next(errors.notAwaiting, target);

    } else {
      next();
    }
  });
};


exports.isIdentified = function(next, nick) {
  this.store.isIdentified(nick, function(err, identified) {
    if (err) {
      next(err.message);
    } else if (identified) {
      next();
    } else {
      next(errors.notIdentified);
    }
  });
};
