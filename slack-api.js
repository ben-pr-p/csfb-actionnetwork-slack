var request = require('request');
var log = require('./debug')('csfb-actionnetwork:slack-api');

var slackToken = process.env.SLACK_TOKEN;
var slackUrl = process.env.SLACK_URL;

if (!slackToken) {
  log('Missing env var SLACK_TOKEN - exiting...');
  process.exit();
}

if (!slackUrl) {
  log('Missing env var SLACK_URL - should be something like teamname.slack.com - exiting...');
  process.exit();
}

/**
 * Invite single email
 * @param  {String}   email [email to invite]
 * @param  {Function} fn    [callback function with params (err, data)]
 * @return {Function}       [callback]
 */
function invite(email, fn) {
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
      return fn(null, data);
    } else {
      log('Failed! ' + data.error);
      return fn(null, data);
    }
  });
}

/**
 * Invites a list of emails recursively by updating the idx
 * @param  {Array}   emailList  [list of emails to invite]
 * @param  {Number}   idx       [current index]
 * @param  {Function} fn        [callback function with params (err, emailList)]
 * @return {Function}           [description]
 */
function inviteList(emailList, idx, fn) {
  // base case
  if (idx == emailList.length) {
    return fn(null, emailList)
  }

  invite(emailList[idx], function (err, data) {
    if (err) return fn(err);

    inviteList(emailList, idx + 1, fn);
  })
}

exports = {inviteList: inviteList};
module.exports = exports;
