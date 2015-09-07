var express = require('express');

var app = express();
var db = require('./db')(app);

var log = require('./debug')('csfb-actionnetwork:app')
var anAPI = require('./actionnetwork');
var slackAPI = require('./slack-api');

/*
 * Get it started!
 */ 

log('Searching for emails to invite.');
var emails = anAPI.update(function (err, emails) {
  slackAPI.inviteList(emails, 0, function (err, data) {
    log('Successfully invited %j', data);
  });
});
