var middleware = require('../lib/middleware');
var errors     = require('../lib/replies/en').errors;
var assert     = require('assert');


describe('unknownCommand', function() {
  var commands = ['a', 'foo'];

  describe('without `inc`', function() {
    var fn = middleware.unknownCommand(commands);

    it('gives error when calling unknown command', function() {
      fn(function(err, cmd) {
        assert.equal(err, errors.unknownCommand);
        assert.equal(cmd, 'ohoh');
      }, null, 'ohoh');
    });

    it('gives no error with the right command', function() {
      fn(function(err) {
        assert.ok(!err);
      }, null, 'foo');
    });
  });

  describe('with `inc` defined', function() {
    var fn = middleware.unknownCommand(commands, 'set');

    it('gives custom error when calling unknown command', function() {
      fn(function(err, cmd) {
        assert.equal(err, errors.unknownCommand);
        assert.equal(cmd, 'set ohoh');
      }, null, 'ohoh');
    });
  });
});
