'use strict';

/**
 * Imports
 */
const _ = require('lodash');

/**
 * Identity function
 *
 * @param   {*}   value   Any value
 * @returns {*}   value
 */
function identity(value) {
  return value;
}

/**
 * Parse a value as JSON
 *
 * @param   {String}    value   Value to parse
 * @returns {*}         parsed value
 */
function parse(value) {
  if (value && _.isString(value) === true) {
    try {
      return JSON.parse(value);
    } catch (e) {
      const first = value.trim().substring(0, 1);
      if (first === '{' || first === '[') {
        throw e;
      }
    }
    return value;
  }
}

/**
 * Filter process.env
 *
 * @param   {RegExp|Function} validate    Validation function or regular expression
 * @param   {Object}          [options]   Filter options
 * @returns {Object}          filtered configuration
 */
module.exports = (validate, options) => {
  let isValid;
  if (_.isRegExp(validate)) {
    isValid = (value) => { return validate.test(value); };
  } else if (_.isFunction(validate)) {
    isValid = validate;
  }
  if (!_.isFunction(isValid)) {
    throw new TypeError('Invalid validation function');
  }
  let json = false;
  let freeze = false;
  let format = identity;
  if (options) {
    json = options.json === true;
    freeze = options.freeze === true;
    if (_.isFunction(options.format)) {
      format = options.format;
    }
  }
  const env = {};
  Object.keys(process.env).forEach((key) => {
    if (isValid(key)) {
      const name = format(key);
      if (name && !_.has(env, name)) {
        const value = json ? parse(process.env[key]) : process.env[key];
        if (!_.isUndefined(value)) {
          if (freeze && _.isPlainObject(value)) {
            Object.freeze(value);
          }
          env[name] = value;
        }
      }
    }
  });
  return freeze ? Object.freeze(env) : env;
};
