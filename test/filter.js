'use strict';

/**
 * Imports
 */
const assert = require('assert');
const _ = require('lodash');
const filter = require('../lib/filter');

/**
 * Constants
 */
const ENV = Object.freeze({
  TEST_STRING_VALUE: 'TestString',
  TEST_NUMBER_VALUE: '123.45',
  TEST_INTEGER_VALUE: 123,
  TEST_ARRAY_VALUE: '["alpha","bravo","charlie"]',
  TEST_OBJECT_VALUE: '{"alpha":"a","bravo":{"charlie":"c","delta":"d"},"echo":"e"}',
  TEST_EMPTY_VALUE: '',
  BAD_OBJECT_VALUE: '{"alpha": "a",',
  BAD_ARRAY_VALUE: '["alpha",',
});

/**
 * Filter to keys starting with TEST
 *
 * @param   {String}    key   Key to test
 * @retuens {Boolean}   true if the key starts with TEST
 */
function filterKeys(key) {
  return key.substring(0, 4) === 'TEST';
}

describe('filter(env, pattern, [options])', () => {
  it('should export a function', () => {
    assert.strictEqual(_.isFunction(filter), true);
  });

  it('should throw an error if the env is not an object', () => {
    [true, false, '', 'test', 123, null, undefined].forEach((value) => {
      let error;
      try {
        filter(value);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'Invalid environment');
    });
  });

  it('should throw an error if the pattern is not a function or regular expression', () => {
    [true, false, '', 'test', 123, new Date(), {}, [], null, undefined].forEach((value) => {
      let error;
      try {
        filter({}, value);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'Invalid validation function');
    });
  });

  it('should return an objects with keys for which the pattern function returns true', () => {
    const filtered = filter(ENV, filterKeys);
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: '123.45',
      TEST_INTEGER_VALUE: '123',
      TEST_ARRAY_VALUE: '["alpha","bravo","charlie"]',
      TEST_EMPTY_VALUE: '',
      TEST_OBJECT_VALUE: '{"alpha":"a","bravo":{"charlie":"c","delta":"d"},"echo":"e"}',
    };
    assert.deepEqual(filtered, expected);
  });

  it('should return an objects with keys for which the regular expressions returns true', () => {
    const filtered = filter(ENV, /^test_/i);
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: '123.45',
      TEST_INTEGER_VALUE: '123',
      TEST_ARRAY_VALUE: '["alpha","bravo","charlie"]',
      TEST_EMPTY_VALUE: '',
      TEST_OBJECT_VALUE: '{"alpha":"a","bravo":{"charlie":"c","delta":"d"},"echo":"e"}',
    };
    assert.deepEqual(filtered, expected);
  });

  it('should parse the values as JSON if the json option is true', () => {
    const filtered = filter(ENV, filterKeys, { json: true });
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: 123.45,
      TEST_INTEGER_VALUE: 123,
      TEST_ARRAY_VALUE: ['alpha', 'bravo', 'charlie'],
      TEST_OBJECT_VALUE: { alpha: 'a', bravo: { charlie: 'c', delta: 'd' }, echo: 'e' },
    };
    assert.deepEqual(filtered, expected);
  });

  it('should throw an error if the JSON is invalid', () => {
    [/^BAD_OBJECT_/, /^BAD_ARRAY_/].forEach((pattern) => {
      let error;
      try {
        filter(ENV, pattern, { json: true });
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof SyntaxError, true);
      assert.strictEqual(error.message, 'Unexpected end of input');
    });
  });

  it('should accept a function to format the key', () => {
    const format = (key) => _.camelCase(key.replace(/^TEST_/, ''));
    const filtered = filter(ENV, filterKeys, { json: true, format });
    const expected = {
      stringValue: 'TestString',
      numberValue: 123.45,
      integerValue: 123,
      arrayValue: ['alpha', 'bravo', 'charlie'],
      objectValue: { alpha: 'a', bravo: { charlie: 'c', delta: 'd' }, echo: 'e' },
    };
    assert.deepEqual(filtered, expected);
  });


  it('should not add a property that already exists', () => {
    const format = (key) => key.replace('INTEGER', 'NUMBER');
    const filtered = filter(ENV, filterKeys, { json: true, format });
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: 123.45,
      TEST_ARRAY_VALUE: ['alpha', 'bravo', 'charlie'],
      TEST_OBJECT_VALUE: { alpha: 'a', bravo: { charlie: 'c', delta: 'd' }, echo: 'e' },
    };
    assert.deepEqual(filtered, expected);
  });

  it('should freeze the returned object is the freeze option is true', () => {
    const filtered = filter(ENV, filterKeys, { json: true, freeze: true });
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: 123.45,
      TEST_INTEGER_VALUE: 123,
      TEST_ARRAY_VALUE: ['alpha', 'bravo', 'charlie'],
      TEST_OBJECT_VALUE: { alpha: 'a', bravo: { charlie: 'c', delta: 'd' }, echo: 'e' },
    };
    assert.deepEqual(filtered, expected);
    assert.strictEqual(Object.isFrozen(filtered), true);
    assert.strictEqual(Object.isFrozen(filtered.TEST_OBJECT_VALUE), true);
  });
});
