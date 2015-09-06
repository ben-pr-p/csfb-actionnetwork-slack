var express = require('express');

var app = express();
var db = require('./db')(app);

var log = require('./debug')('csfb-actionnetwork:app')
var anAPI = require('./actionnetwork');
var slackAPI = require('./slack-api');

app.get('/', function (req, res) {
  var emails = anAPI.update(function (err, emails) {
    slackAPI.invite('test@mailinator.com', function (err, data) {
      res.send(emails);
    });
  })
});

/*
 * Get it started!
 */ 

var PORT = process.env.PORT;
if (!PORT) {
  log('Missing env var PORT, using 3000');
  PORT = 3000;
}

log('Listening on PORT %d', PORT);
app.listen(PORT);
