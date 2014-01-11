var NickServ = require('..');
var mw       = require('../lib/middleware');
var errors   = require('../lib/replies/en').errors;
var assert   = require('assert');


function fntest(fn, key, test) {
  var nickserv = new NickServ();
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
    fn.apply(nickserv, args);
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
