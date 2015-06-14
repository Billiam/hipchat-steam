var ack = require('ac-koa').require('hipchat');
var pkg = require('./package.json');
var app = ack(pkg);

var Notifier = require('ac-koa-hipchat-notifier').Notifier;
var Store = require('./lib/store');

var addon = app.addon()
  .hipchat()
  .allowRoom(true)
  .scopes('send_notification');

if (process.env.DEV_KEY) {
  addon.key(process.env.DEV_KEY);
}

var notifier = Notifier({format: 'html', dir: __dirname + '/messages'});
var store = Store(notifier);

addon.webhook('room_message', /http:\/\/store.steampowered.com\/app\/(\d+)/,  function *() {
  var match = this.match;
  console.log(match);
  if(match && match[1]) {
    yield store.fetchGameInfo(match[1]);
  }
});

app.listen();
