'use strict';

/**
 * Imports
 */
const filter = require('./lib/filter');

/**
 * Filter process.env
 *
 * @param   {RegExp|Function} validate    Validation function or regular expression
 * @param   {Object}          [options]   Filter options
 * @returns {Object}          filtered configuration
 */
module.exports = (validate, options) => {
  return filter(process.env, validate, options);
};

/**
 * Expose filter
 */
module.exports.filter = filter;
