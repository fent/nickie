var middleware = require('../lib/middleware');
var errors     = require('../lib/replies/en').errors;
var assert     = require('assert');


function fntest(fn, key, test) {
  it(key, function() {
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
    }].concat(test.args);
    fn.apply(null, args);
  });
}

function fntests(fn, tests) {
  for (var key in tests) {
    fntest(fn, key, tests[key]);
  }
}


describe('unknownCommand', function() {
  var commands = ['a', 'foo'];

  describe('without `inc`', function() {
    fntests(middleware.unknownCommand(commands), {
      'gives error when calling unknown command': {
        args: [null, 'ohoh'],
        results: [errors.unknownCommand, 'ohoh']
      },
      'gives no error with the right command': {
        args: [null, 'foo']
      }
    });
  });

  describe('with `inc` defined', function() {
    fntests(middleware.unknownCommand(commands, 'set'), {
      'gives custom error when calling unknown command': {
        args: [null, 'ohoh'],
        results: [errors.unknownCommand, 'set ohoh']
      }
    });
  });
});
