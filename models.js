var mongoose = require('mongoose');

var callSchema = mongoose.Schema({
  date: {type: Date, default: Date.now}
});

module.exports = function initialize(conn) {
  conn.model('Call', callSchema);
}
