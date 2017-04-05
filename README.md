# nickie

A nickserv bot for your irc server needs.

[![Build Status](https://secure.travis-ci.org/fent/nickie.svg)](http://travis-ci.org/fent/nickie)
[![Dependency Status](https://david-dm.org/fent/nickie.svg)](https://david-dm.org/fent/nickie)
[![codecov](https://codecov.io/gh/fent/nickie/branch/master/graph/badge.svg)](https://codecov.io/gh/fent/nickie)

# Usage

```js
var Nickie = require('nickie';
var nickie = new Nickie('irc.myircserver.net');
```


# API

### new Nickie(server, [options])

Options can be

* `nick` - Nick of the bot for Nickie. Defaults to `NickServ`.
* `ops` - A hash of nicks that have elevated access.
* `networkServices` - A hash of special nicks that are part of the network. By default contains `nickserv` and `chanserv`.
* `maxAccounts` - Number of maximum accounts that can be associated with an email.
* `minToWait` - Number of minutes to force a user to wait before they can register their nick.
* `store` - Storage to use to keep track of nicks. Defaults to memory store.

### Nickie#userConnected(nick, ip, [callback])

Should be called when a user connects to the server. Returns a promise if no callback is given.

### Nickie#userDisconnected(nick, ip, [callback])

Should be called when a user disconnects from the server. Returns a promise if no callback is given.


# Install

    npm install nickie


# Tests
Tests are written with [mocha](https://mochajs.org)

```bash
npm test
```

# License
MIT
