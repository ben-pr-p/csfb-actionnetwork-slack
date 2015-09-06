var request = require('request');
var log = require('./debug')('csfb-actionnetwork:slack-api');

var slackToken = process.env.SLACK_TOKEN;
var slackUrl = process.env.SLACK_URL;

if (!slackToken) {
  log('Missing env var SLACK_TOKEN - exiting...');
  process.exit();
}

if (!slackUrl) {
  log('Missing env var SLACK_URL - exiting...');
  process.exit();
}

var exports = {};

exports.invite = function (email, fn) {
  var options = {
    url: 'https://' + slackUrl + '/api/users.admin.invite',
    form: {
      email: email,
      token: slackToken,
      set_active: true
    }
  }

  request.post(options, function (err, response, body) {
    if (err) {
      log('Found error %j', err);
      fn(err);
    }

    var data = JSON.parse(body);
    if (data.ok) {
      log('Success! Check ' + email + ' for an email from Slack.');
      fn(null, data);
    } else {
      log('Failed! ' + data.error);
      fn(null, data);
    }
  });
}

module.exports = exports;
