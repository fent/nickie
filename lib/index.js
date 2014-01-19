var inherits    = require('util').inherits;
var irc         = require('irc');
var vsprintf    = require('sprintf').vsprintf;
var MemoryStore = require('./store/memory-store.js');
var errors      = require('./replies/en.js').error;
var commands    = require('./commands');
var has         = require('./util').has;
var extend      = require('./util').extend;
var next        = require('./util').next;


/**
 * @constructor
 * @extends {irc.Client}
 * @param {IRC} server
 * @param {Object} options
 */
var NickServ = module.exports = function(server, options) {
  this.server = server;
  this.options = options || {};
  extend(this.options, {
    nick: 'NickServ',
    ops: {},
    networkServices: { nickserv: true, chanserv: true },
    maxAccounts: 0,
    minToWait: 0,
    store: new MemoryStore()
  });

  var self = this;
  this.on('pm', function(nick, msg) {
    var args = msg.toLowerCase().split(' ');
    var cmd = args.shift();

    process.nextTick(function() {
      if (has(commands, cmd)) {
        args.unshift(nick);
        next(self, commands[cmd], args);

      } else {
        self.reply(nick, errors.unknowncommand, cmd);
      }
    });
  });

  irc.Client.call(this, server, this.options.nick, { autoConnect: false });
};

inherits(NickServ, irc.Client);


/**
 * User connects to server.
 *
 * @param {String} nick
 * @param {String} ip
 * @param {Function(!Error)} callback
 */
NickServ.prototype.userConnected = function(nick, ip, callback) {
  callback = callback || function() {};
  this.options.store.userConnected(nick, ip, callback);
};


/**
 * User disconnects from server.
 *
 * @param {String} nick
 * @param {String} ip
 * @param {Function(!Error)} callback
 */
NickServ.prototype.userDisconnected = function(nick, ip, callback) {
  callback = callback || function() {};
  this.options.store.userDisconnected(nick, ip, callback);
};


NickServ.prototype.reply = function() {
  var args = Array.prototype.slice.call(arguments);
  var nick = args.shift();
  var msg = args.shift();
  this.say(nick, vsprintf(msg, args || []));
};
