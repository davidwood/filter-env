'use strict';

/**
 * Imports
 */
const _ = require('lodash');

/**
 * Parse a value as JSON
 *
 * @param   {String}    value   Value to parse
 * @returns {*}         parsed value
 */
function parse(value) {
  if (_.isString(value) && value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      const first = value.trim().substring(0, 1);
      if (first === '{' || first === '[') {
        throw e;
      }
    }
    return value;
  } else if (_.isNumber(value) || _.isDate(value) || _.isNumber(value)) {
    return value;
  }
}

/**
 * Filter an environment
 *
 * @param   {Object}          env         Environment to validate
 * @param   {RegExp|Function} validate    Validation function or regular expression
 * @param   {Object}          [options]   Filter options
 * @returns {Object}          filtered configuration
 */
module.exports = (env, validate, options) => {
  let isValid;
  if (!_.isObject(env)) {
    throw new TypeError('Invalid environment');
  }
  if (_.isRegExp(validate)) {
    isValid = (value) => validate.test(value);
  } else if (_.isFunction(validate)) {
    isValid = validate;
  }
  if (!_.isFunction(isValid)) {
    throw new TypeError('Invalid validation function');
  }
  let json = false;
  let freeze = false;
  let format = _.identity;
  if (options) {
    json = options.json === true;
    freeze = options.freeze === true;
    if (_.isFunction(options.format)) {
      format = options.format;
    }
  }
  const config = {};
  Object.keys(env).forEach((key) => {
    if (isValid(key)) {
      const name = format(key);
      if (name && !_.has(config, name)) {
        const value = json ? parse(env[key]) : env[key];
        if (!_.isUndefined(value)) {
          if (freeze && _.isPlainObject(value)) {
            Object.freeze(value);
          }
          config[name] = value;
        }
      }
    }
  });
  return freeze ? Object.freeze(config) : config;
};
