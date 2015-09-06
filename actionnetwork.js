var request = require('request');
var log = require('./debug')('csfb-actionnetwork:actionnetwork');
var dbApi = require('./db-api');

var anKey = process.env.ACTION_NETWORK_API_KEY;
if (!anKey) {
  log('Missing env var ACTION_NETWORK_API_KEY - exiting...');
  process.exit();
}

var exports = {};

/**
 * Function to make the request – need to use [] method because of the - in api-key
 */

function initializeRequest(url) {
  var headers = {};
  headers['api-key'] = anKey;

  var options = {
    url: url,
    headers: headers
  }

  return options;
}

/**
 * Get the number of pages
 */

function getNumberOfPages(fn) {
  var options = initializeRequest('https://actionnetwork.org/api/v1/people');

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
 * Get page number page, return JSON parse response body
 */

function getPage(page, fn) {
  var options = initializeRequest('https://actionnetwork.org/api/v1/people?page=' + page.toString());

  request(options, function (err, response, body) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    var data = JSON.parse(body);
    log('Fetched page %d', page);

    fn(null, data);
  })
}

/*
 * Parse response data as JSON and return each person's primary email
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

/*
 * Add new emails, callback with new emails included in original parameter list
 */

function updateEmails(emails, latest, idx, fn) {
  if (idx < 0) {
    log('At the end of the pages.');
    return fn(null, false, emails);
  }

  dbApi.haveEmail(latest[idx], function (err, exists) {
    if (!exists) {
      emails.push(latest[idx]);
      updateEmails(emails, latest, idx - 1, fn);
    } else {
      log('Reached someone I know – stopping here.');
      return fn(null, true, emails);
    }
  });
}

/*
 * Gets emails from page @param page
 * Adds them to @param emails
 */

function updateNextPage(emails, page, fn) {
  getPage(page, function (err, data) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    var latest = parseEmails(data);

    updateEmails(emails, latest, latest.length - 1, function(err, done, emails) {
      if (page == 1 || done) {
        // base case
        fn(null, emails);
      } else {
        // recurse
        updateNextPage(emails, page - 1, fn);
      }
    });
  });
}

exports.update = function (fn) {
  getNumberOfPages(function (err, pages) {
    if (err) return fn(err);
    
    var emails = [];
    updateNextPage(emails, pages, function(err, emails) {
      if (err) return fn(err);

      return fn(null, emails);
    });
  });
}

module.exports = exports;
