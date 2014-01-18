var NickServ = require('..');
var mw       = require('../lib/middleware');
var errors   = require('../lib/replies/en').errors;
var assert   = require('assert');
var sinon    = require('sinon');


function fntest(fn, key, test) {
  var nickserv = new NickServ(null, null, test.options);
  it(key, function(done) {
    function run() {
      var args = [function() {
        var results = test.results;
        var len = arguments.length;

        if (results) {
          assert.equal(results.length, len);
          for (var i = 0; i < len; i++) {
            assert.equal(results[i], arguments[i]);
          }
        } else {
          assert.equal(len, 0);
        }

        if (test.teardown) {
          test.teardown.call(nickserv);
        }
        done();
      }].concat(test.args);
      fn.apply(nickserv, args);
    }

    if (test.setup) {
      test.setup.call(nickserv, function(err) {
        if (err) return done(err);
        run();
      });
    } else {
      run();
    }
  });
}

function fntests(fn, tests) {
  for (var key in tests) {
    fntest(fn, key, tests[key]);
  }
}

describe('networkServices', function() {
  fntests(mw.networkServices, {
    'gives error when nick is part of network services': {
      args: ['boyohboy', 'nickserv'],
      results: [errors.networkServices, 'nickserv']
    },
    'gives no error when nick is not part of network services': {
      args: ['mynick', 'yoloboy']
    }
  });
});

describe('isRegistered', function() {
  fntests(mw.isRegistered, {
    'gives error when user is not registered': {
      args: ['mynick', 'someuser'],
      results: [errors.notRegistered, 'someuser']
    },
    'gives no error when user is registered': {
      setup: function(done) {
        this.store.register('someuser', '', '', done);
      },
      args: ['mynick', 'someuser']
    }
  });
});

describe('amRegistered', function() {
  fntests(mw.amRegistered, {
    'gives error when user is not registered': {
      args: ['mynick'],
      results: [errors.notRegistered, 'mynick']
    },
    'gives no error when user is registered': {
      setup: function(done) {
        this.store.register('mynick', '', '', done);
      },
      args: ['mynick']
    }
  });
});

describe('checkEmail', function() {
  fntests(mw.checkEmail, {
    'gives error when given an invalid email': {
      args: ['nick', 'password', 'noway'],
      results: [errors.invalidEmail, 'noway']
    },
    'gives no error with a correctly formatted email': {
      args: ['nick', 'password', 'blueglass@gmail.com']
    }
  });
});

describe('tooManyAccounts', function() {
  var email = 'myemail@gmail.com';
  fntests(mw.tooManyAccounts, {
    'gives error when email has too many accounts registered': {
      setup: function(done) {
        var store = this.store;
        store.register('mynick', 'pw', email, function(err) {
          if (err) return done(err);
          store.register('myothernick', 'pw', email, done);
        });
      },
      options: { maxAccounts: 2 },
      args: ['nick', 'password', email],
      results: [errors.tooManyAccounts, email]
    },
    'gives no error with not enough accounts': {
      setup: function(done) {
        this.store.register('mynick', 'pw', email, done);
      },
      options: { maxAccounts: 2 },
      args: ['nick', 'password', email]
    },
    'gives no error when there are max number of accounts': {
      setup: function(done) {
        this.store.register('mynick', 'pw', email, done);
      },
      args: ['nick', 'password', email]
    }
  });
});

describe('alreadyRegistered', function() {
  fntests(mw.alreadyRegistered, {
    'gives error when nick has already been registered': {
      setup: function(done) {
        this.store.register('nick', 'pw', 'whatever@gmail.com', done);
      },
      args: ['nick'],
      results: [errors.alreadyRegistered, 'nick']
    },
    'gives no error when nick has not been registered': {
      args: ['nick']
    },
  });
});

describe('tooSoon', function() {
  fntests(mw.tooSoon, {
    'gives error when command called too soon after user connects': {
      setup: function(done) {
        this.store.userConnected('nicko', 'ip', done);
      },
      options: { minToWait: 1 },
      args: ['nicko'],
      results: [errors.tooSoon, 1, 'minute']
    },
    'gives no error when enough time has passed': {
      setup: function(done) {
        var clock = this.clock = sinon.useFakeTimers();
        this.store.userConnected('nicko', 'ip', function(err) {
          if (err) return done(err);
          clock.tick(1000);
          done();
        });
      },
      teardown: function() {
        this.clock.restore();
      },
      options: { minToWait: 1 },
      args: ['nicko']
    },
    'gives no error when no minimum time set': {
      setup: function(done) {
        this.store.userConnected('nicko', 'ip', done);
      },
      args: ['nicko']
    }
  });
});

describe('accessDenied', function() {
  fntests(mw.accessDenied, {
    'gives error when user is not op and target is not the same user': {
      args: ['nick', 'donald'],
      results: [errors.accessDenied]
    },
    'gives no error when target is the same as user': {
      args: ['donald', 'donald']
    },
    'gives no error when user is op': {
      options: { ops: { nico: true } },
      args: ['nico', 'donald']
    }
  });
});

describe('notAwaitingAuthorization', function() {
  fntests(mw.notAwaitingAuthorization, {
    'gives error when user is not registered': {
      args: ['nick', 'register', 'nick'],
      results: [errors.notRegistered, 'nick']
    },
    'gives error when user is already verified': {
      setup: function(done) {
        this.store._setUser('nick', {
          registered: true,
          verified: true,
        }, done);
      },
      args: ['nick', 'register', 'nick'],
      results: [errors.notAwaiting, 'nick']
    },
    'gives no error when user is not verified yet': {
      setup: function(done) {
        this.store.register('nick', 'pw', 'email', done);
      },
      args: ['nick', 'register', 'nick']
    }
  });
});

describe('isIdentified', function() {
  fntests(mw.isIdentified, {
    'gives error when user is not identified': {
      args: ['nick'],
      results: [errors.notIdentified]
    },
    'gives no error when user is identified': {
      setup: function(done) {
        this.store.register('nick', 'pw', 'email', done);
      },
      args: ['nick']
    }
  });
});
