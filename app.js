var express = require('express');

var app = express();
var db = require('./db')(app);

var log = require('./debug')('csfb-actionnetwork:app')
var anAPI = require('./actionnetwork');
var slackAPI = require('./slack-api');

var INTERVAL = process.env.INTERVAL;
if (!INTERVAL) {
  log('Missing env var INTERVAL - suggested interval is 10 minutes - interval should be number of minutes – exiting...');
  process.exit();
}

var interval = INTERVAL * 60 * 1000;

/*
 * Get it started!
 */ 

setInterval(function () {
  log('Request for emails recieved');
  var emails = anAPI.update(function (err, emails) {
    slackAPI.inviteList(['test1@mailinator.com', 'test2@mailinator.com'], 0, function (err, data) {
      log('Successfully invited %j', data);
    });
  })
}, interval);
