var MemoryStore = require('../lib/store/MemoryStore');
var assert      = require('assert');
var store       = new MemoryStore();


var nick = 'roly';
var ip = '1';
var email = 'rolypoly@gmail.com';
var password = 'aaaaah';
var key;

describe('user connects', function() {
  it('retrieve user metadata', function(done) {
    store.userConnected(nick, ip);
    store.info(nick, nick, function(err, user) {
      if (err) throw err;
      assert.ok(user);
      assert.ok(user.online);
      assert.equal(user.from, ip);
      done();
    });
  });
});

describe('user disconnects', function() {
  it('metadata reflects user being offline', function(done) {
    store.userDisconnected(nick, 'bye');
    store.info(nick, nick, function(err, user) {
      if (err) throw err;
      assert.ok(user);
      assert.ok(!user.online);
      assert.ok(user.lastQuitMsg, 'bye');
      done();
    });
  });
});

describe('user registers after connecting', function() {
  it('info now shows more data', function(done) {
    store.userConnected(nick, ip);
    store.register(nick, password, email, function(err) {
      if (err) throw err;
      store.info(nick, nick, function(err, user) {
        if (err) throw err;
        assert.ok(user.password);
        assert.equal(user.email, email);
        assert.ok(user.registered);
        assert.ok(user.identified);
        assert.ok(!user.verified);
        key = user.key;

        store.isRegistered(nick, function(err, registered, verified) {
          if (err) throw err;
          assert.ok(registered);
          assert.ok(!verified);
          done();
        });
      });
    });
  });
});

describe('verify after registering', function() {
  it('with the wrong key', function(done) {
    store.verify(nick, nick, 'WRONGKEY', function(err, verified) {
      if (err) throw err;
      assert.ok(!verified);
      done();
    });
  });

  it('with the correct key', function(done) {
    store.verify(nick, nick, key, function(err, verified) {
      if (err) throw err;
      assert.ok(verified);

      store.isRegistered(nick, function(err, registered, verified) {
        if (err) throw err;
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
      if (err) throw err;
      assert.ok(!identified);
      store.info(nick, nick, function(err, user) {
        if (err) throw err;
        assert.ok(!user.identified);
        done();
      });
    });
  });

  it('with the correct password', function(done) {
    store.identify(nick, password, function(err, identified) {
      if (err) throw err;
      assert.ok(identified);
      store.info(nick, nick, function(err, user) {
        if (err) throw err;
        assert.ok(user.identified);
        done();
      });
    });
  });

  it('can logout afterwards', function(done) {
    store.logout(nick, function(err) {
      if (err) throw err;
      store.info(nick, nick, function(err, user) {
        if (err) throw err;
        assert.ok(!user.identified);
        done();
      });
    });
  });
});
