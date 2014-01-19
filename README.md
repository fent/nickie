# nickie [![Build Status](https://secure.travis-ci.org/fent/nickie.png)](http://travis-ci.org/fent/nickie)

A nickserv bot for your irc server needs.

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

Should be called when a user connects to the server.

### Nickie#userDisconnected(nick, ip, [callback])

Should be called when a user disconnects from the server.


# Install

    npm install nickie


# Tests
Tests are written with [mocha](http://visionmedia.github.com/mocha/)

```bash
npm test
```

# License
MIT
