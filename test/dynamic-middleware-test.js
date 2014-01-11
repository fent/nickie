var dmw    = require('../lib/dynamic-middleware');
var errors = require('../lib/replies/en').errors;
var assert = require('assert');


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
    }, null].concat(test.args);
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
    fntests(dmw.unknownCommand(commands), {
      'gives error when calling unknown command': {
        args: ['ohoh'],
        results: [errors.unknownCommand, 'ohoh']
      },
      'gives no error with the right command': {
        args: ['foo']
      }
    });
  });

  describe('with `inc` defined', function() {
    fntests(dmw.unknownCommand(commands, 'set'), {
      'gives custom error when calling unknown command': {
        args: ['ohoh'],
        results: [errors.unknownCommand, 'set ohoh']
      }
    });
  });
});


describe('notEnoughParameters', function() {
  fntests(dmw.notEnoughParameters(1), {
    'gives error with too few parameters': {
      args: [],
      results: [errors.notEnoughParameters]
    },
    'gives no error with enough parameters': {
      args: [1]
    }
  });
});
