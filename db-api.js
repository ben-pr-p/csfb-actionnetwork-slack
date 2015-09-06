var mongoose = require('mongoose');
var log = require('./debug')('csfb-actionnetwork:db-api');

var Email = mongoose.model('Email');

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

exports.haveEmail = function (email, fn) {
  Email.count({email: email}, function (err, count) {
    if (err) {
      log('Found error %s', err);
      return fn(err);
    }

    if (count == 0) {
      log('Email %s not found', email);
      exports.addEmail(email, function(err, email) {
        fn(null, false);
      });
    } else {
      log('Email %s found with count %d', email, count);
      fn(null, true);
    }

  });
}