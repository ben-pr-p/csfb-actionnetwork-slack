var mongoose = require('mongoose');
var log = require('./debug')('csfb-actionnetwork:db-api');

var Email = mongoose.model('Email');

/**
 * Add's email to database
 * @param {String}   email [email to add]
 * @param {Function} fn    [callback with params (err, email)]
 */
exports.addEmail = function (email, fn) {
  var e = new Email({email:email});
  e.save(onsave);

  function onsave(err) {
    if (err) {
      log('Found error %s', err);
      return fn(err);
    }

    log('Saved email %s', e.email);
    fn(null, e.email);
  }
}

/**
 * Checks if email exists in the database
 * @param  {String}   email [email to check if exists]
 * @param  {Function} fn    [callback function with params (err, exists(Boolean))]
 * @return {Function}       [callback]
 */
exports.haveEmail = function (email, fn) {
  Email.count({email: email}, function (err, count) {
    if (err) {
      log('Found error %s', err);
      return fn(err);
    }

    if (count == 0) {
      log('Email %s not found', email);
      exports.addEmail(email, function(err, email) {
        return fn(null, false);
      });
    } else {
      log('Email %s found with count %d', email, count);
      return fn(null, true);
    }

  });
}