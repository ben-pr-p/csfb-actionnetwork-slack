/**
 * Module dependencies.
 */

var debug = require('debug');

/**
 * Initialize debug
 */

debug.disable();

// if (config.clientDebug === '*') {
//   debug.enable('democracyos:*');
// } else if (config.clientDebug) {
//   debug.enable(config.clientDebug);
// }

debug.enable('csfb-actionnetwork:*');

module.exports = debug;
