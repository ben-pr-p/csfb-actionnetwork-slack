var mongoose = require('mongoose');
var log = require('./debug')('csfb-actionnetwork:db-api');

var Call = mongoose.model('Call');

/**
 * Add's email to database
 * @param {String}   date  [date of most recent call]
 * @param {Function} fn    [callback with params (err, date)]
 */
function updateLastCall(lastCall, date, fn) {
  if (lastCall == null) {
    var lc = new Call({date:date});
    lc.save(onsave);
  } else {
    lc = lastCall;
    lc.date = date;
    lc.save(onsave);
  }

  function onsave(err) {
    if (err) {
      log('Found error %s', err);
      return fn(err);
    }

    log('Saved last call at time %s', lc.date.toISOString());
    fn(null, lc.date);
  }
}

/**
 * Get the time of the last call to action network's api
 * @param  {Function} fn [callback function with params (err, lastCallDate)]
 * @return {Function}    [callback]
 */
exports.getLastCall = function (fn) {
  Call.findOne({}, function (err, lastCall) {
    if (err) {
      log('Found error %s', err);
      return fn(err);
    }

    var oldDate = lastCall.date.toISOString();

    // update the time, lastCall will still be the old time
    updateLastCall(lastCall, new Date(), function (err, date) {
      if (lastCall == null) {
        // if it's the first the script is being run, start from the beginning
        log('First time being run – last call of %s', new Date(0).toISOString());
        return fn(err, new Date(0).toISOString());
      } else {
        // callback with the old time
        log('Was last run at time %s', oldDate);
        return fn(err, oldDate);
      }

    });
  });
}