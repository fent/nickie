var errors = require('./replies/en.js').errors;
var has    = require('./util').has;


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
