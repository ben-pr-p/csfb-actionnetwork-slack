var mongoose = require('mongoose');

var emailSchema = mongoose.Schema({
  email: String
});

module.exports = function initialize(conn) {
  conn.model('Email', emailSchema);
}
