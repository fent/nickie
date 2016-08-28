var MemoryStore = require('../lib/store/memory-store');
var assert      = require('assert');
var store       = new MemoryStore();


var nick = 'roly';
var ip = '1';
var email = 'rolypoly@gmail.com';
var password = 'aaaaah';
var password2 = 'imgay';
var key;

describe('user connects', function() {
  it('retrieve user metadata', function(done) {
    store.userConnected(nick, ip, function(err) {
      if (err) { return done(err); }
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(user);
        assert.ok(user.online);
        assert.equal(user.from, ip);
        done();
      });
    });
  });
});

describe('user disconnects', function() {
  it('metadata reflects user being offline', function(done) {
    store.userDisconnected(nick, 'bye', function(err) {
      if (err) { return done(err); }
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(user);
        assert.ok(!user.online);
        assert.ok(user.lastQuitMsg, 'bye');
        done();
      });
    });
  });
});

describe('user registers after connecting', function() {
  it('number of accounts is 0', function(done) {
    store.userConnected(nick, ip, function(err) {
      if (err) { return done(err); }
      store.getNumOfAccounts(email, function(err, num) {
        if (err) { return done(err); }
        assert.equal(num, 0);
        done();
      });
    });
  });

  it('info now shows more data', function(done) {
    store.register(nick, password, email, function(err) {
      if (err) { return done(err); }
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(user.password);
        assert.equal(user.email, email);
        assert.ok(user.registered);
        assert.ok(user.identified);
        assert.ok(!user.verified);
        key = user.key;

        store.isRegistered(nick, function(err, registered, verified) {
          if (err) { return done(err); }
          assert.ok(registered);
          assert.ok(!verified);
          done();
        });
      });
    });
  });

  it('number of accounts is 1', function(done) {
    store.getNumOfAccounts(email, function(err, num) {
      if (err) { return done(err); }
      assert.equal(num, 1);
      store.userDisconnected(nick, 'cya', done);
    });
  });
});

describe('verify after registering', function() {
  it('with the wrong key', function(done) {
    store.verify(nick, nick, 'WRONGKEY', function(err, verified) {
      if (err) { return done(err); }
      assert.ok(!verified);
      done();
    });
  });

  it('with the correct key', function(done) {
    store.verify(nick, nick, key, function(err, verified) {
      if (err) { return done(err); }
      assert.ok(verified);

      store.isRegistered(nick, function(err, registered, verified) {
        if (err) { return done(err); }
        assert.ok(registered);
        assert.ok(verified);
        done();
      });
    });
  });
});

describe('user identifies', function() {
  it('with the wrong password', function(done) {
    store.identify(nick, 'OHOH', function(err, identified) {
      if (err) { return done(err); }
      assert.ok(!identified);
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(!user.identified);
        done();
      });
    });
  });

  it('with the correct password', function(done) {
    store.identify(nick, password, function(err, identified) {
      if (err) { return done(err); }
      assert.ok(identified);
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(user.identified);
        done();
      });
    });
  });

  it('can logout afterwards', function(done) {
    store.logout(nick, function(err) {
      if (err) { return done(err); }
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(!user.identified);
        done();
      });
    });
  });
});

describe('change the passwod', function() {
  it('to a new one', function(done) {
    store.identify(nick, password, function(err) {
      if (err) { return done(err); }
      store.setPassword(nick, password2, function(err) {
        if (err) { return done(err); }
        store.logout(nick, done);
      });
    });
  });

  it('old password should not work', function(done) {
    store.identify(nick, password, function(err, identified) {
      if (err) { return done(err); }
      assert.ok(!identified);
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(!user.identified);
        done();
      });
    });
  });

  it('but the new one should', function(done) {
    store.identify(nick, password2, function(err, identified) {
      if (err) { return done(err); }
      assert.ok(identified);
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(user.identified);
        done();
      });
    });
  });
});

describe('drop user', function() {
  it('user metadata reflects correctly', function(done) {
    store.drop(nick, nick, function(err) {
      if (err) { return done(err); }
      store.info(nick, nick, function(err, user) {
        if (err) { return done(err); }
        assert.ok(!user.password);
        assert.ok(!user.email);
        assert.ok(!user.registered);
        assert.ok(!user.verified);
        assert.ok(!user.key);
        done();
      });
    });
  });
});
