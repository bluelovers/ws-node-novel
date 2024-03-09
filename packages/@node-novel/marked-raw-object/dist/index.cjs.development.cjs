'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var util = require('util');

const SYMBOL_RAW_DATA = /*#__PURE__*/Symbol.for('raw_data');
const SYMBOL_RAW_VALUE = /*#__PURE__*/Symbol.for('raw_value');
class RawObject {
  constructor(source, raw) {
    if (raw) {
      this[SYMBOL_RAW_DATA] = raw;
    }
    this[SYMBOL_RAW_VALUE] = source;
  }
  inspect() {
    // @ts-ignore
    let pad = this[SYMBOL_RAW_DATA] && this[SYMBOL_RAW_DATA].type;
    return 'Raw' + this.getTypeof().replace(/^[a-z]/, function (s) {
      return s.toUpperCase();
    }) + `(${util.inspect(this.getRawValue())}${pad ? ', ' + pad : ''})`;
  }
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.inspect();
  }
  toJSON() {
    return this.toString();
  }
  toString() {
    return this[SYMBOL_RAW_VALUE].toString();
  }
  getTypeof() {
    return Array.isArray(this[SYMBOL_RAW_VALUE]) ? 'array' : typeof this[SYMBOL_RAW_VALUE];
  }
  getRawData() {
    return this[SYMBOL_RAW_DATA];
  }
  getRawValue() {
    return this[SYMBOL_RAW_VALUE];
  }
  static isRawObject = isRawObject;
  /**
   * will remove hidden data and get source data
   *
   * @param {RawObject} data
   */
  static removeRawData = removeRawData;
}
function isRawObject(v) {
  return v instanceof RawObject;
}
function removeRawData(data) {
  if (isRawObject(data)) {
    data = data.getRawValue();
  }
  if (typeof data == 'object') {
    for (let i in data) {
      data[i] = removeRawData(data[i]);
    }
  }
  return data;
}

exports.RawObject = RawObject;
exports.SYMBOL_RAW_DATA = SYMBOL_RAW_DATA;
exports.SYMBOL_RAW_VALUE = SYMBOL_RAW_VALUE;
exports.default = RawObject;
exports.isRawObject = isRawObject;
exports.removeRawData = removeRawData;
//# sourceMappingURL=index.cjs.development.cjs.map
