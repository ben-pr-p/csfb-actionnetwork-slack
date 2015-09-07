var request = require('request');
var querystring = require('querystring');
var log = require('./debug')('csfb-actionnetwork:actionnetwork');
var dbApi = require('./db-api');

var anKey = process.env.ACTION_NETWORK_API_KEY;
if (!anKey) {
  log('Missing env var ACTION_NETWORK_API_KEY - exiting...');
  process.exit();
}

var PEOPLE_URL = 'https://actionnetwork.org/api/v1/people?';

var exports = {};

/**
 * Initializes request to action network's API
 * @param  {String} url           [url to get]
 * @param  {Dictionary} queryDict [any additional query parameters you would like]
 * @param  {Date} lastCall        [time of last call to be added as query parameter]
 * @return {Dictionary}           [options for request]
 */
function initializeRequest(url, queryDict, lastCall) {
  var headers = {};
  headers['api-key'] = anKey;

  queryDict['filter'] = "modified_at gt '" + lastCall + "'";

  var url = url + querystring.stringify(queryDict);

  var options = {
    url: url,
    headers: headers
  }

  return options;
}

/**
 * Get the number of pages in a specific call
 * @param  {Date}   lastCall   [time of last update]
 * @param  {Function} fn       [callback function with params (err, total pages)]
 */
function getNumberOfPages(lastCall, fn) {
  var options = initializeRequest(PEOPLE_URL, {}, lastCall);

  request(options, function (err, response, body) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    var data = JSON.parse(body);
    log('Fetched people data - %d pages', data.total_pages);
    fn(null, data.total_pages);
  });
}

/**
 * Get page and callback with page data as JSON
 * @param  {Date}   lastCall   [time of last update]
 * @param  {Number}   page     [current page to get]
 * @param  {Function} fn       [callback function with params (err, data)]
 */
function getPage(lastCall, page, fn) {
  var query = {page: page}
  var options = initializeRequest(PEOPLE_URL, query, lastCall);

  request(options, function (err, response, body) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    var data = JSON.parse(body);
    log('Fetched page %d', page);

    return fn(null, data);
  })
}

/**
 * [parseEmails description]
 * @param  {Dictionary} data   [JSON response body data]
 * @return {Array} emails      [just each user's primary email]
 */
function parseEmails(data) {
  var emails = [];
  var people = data['_embedded']['osdi:people'];

  for (var i = people.length - 1; i >= 0; i--) {
    var emailAddresses = people[i].email_addresses;

    var primary = null;
    for (var j = emailAddresses.length - 1; j >= 0; j--) {
      if (emailAddresses[j].primary) primary = emailAddresses[j].address;
    }

    emails.push(primary);
  };

  return emails;
}

/**
 * Get's the next page's new emails recursively
 * @param  {Date}   lastCall   [time of last update]
 * @param  {Array}   emails    [emails from previous call]
 * @param  {Number}   page     [page to get]
 * @param  {Function} fn       [callback function with params (err, emails)]
 */
function updateNextPage(lastCall, emails, page, fn) {
  // base case
  if (page == 0) {
    return fn(null, emails);
  }

  getPage(lastCall, page, function (err, data) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    var latest = parseEmails(data);

    for (var i = latest.length - 1; i >= 0; i--) {
      emails.push(latest[i]);
    };

    // recurse
    return updateNextPage(lastCall, emails, page - 1, fn);
  });
}

/**
 * Adds new emails to database and callbacks with new emails
 * @param  {Function} fn [callback with params (err, new emails)]
 */
exports.update = function (fn) {
  dbApi.getLastCall(function (err, lastCall) {
    if (err) return fn(err);

    getNumberOfPages(lastCall, function (err, pages) {
      if (err) return fn(err);
      
      var emails = [];
      updateNextPage(lastCall, emails, pages, function(err, emails) {
        if (err) return fn(err);

        log('Done getting emails, got %d of them', emails.length);
        return fn(null, emails);
      });
    });    
  });
}

module.exports = exports;
