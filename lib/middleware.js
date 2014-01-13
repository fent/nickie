var errors = require('./replies/en.js').errors;
var has    = require('./util').has;


exports.networkServices = function(next, nick, target) {
  if (has(this.options.networkServices, target.toLowerCase())) {
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
