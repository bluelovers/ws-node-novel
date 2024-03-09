"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var t = require("util");

const e = /*#__PURE__*/ Symbol.for("raw_data"), a = /*#__PURE__*/ Symbol.for("raw_value");

class RawObject {
  constructor(t, r) {
    r && (this[e] = r), this[a] = t;
  }
  inspect() {
    let a = this[e] && this[e].type;
    return "Raw" + this.getTypeof().replace(/^[a-z]/, (function(t) {
      return t.toUpperCase();
    })) + `(${t.inspect(this.getRawValue())}${a ? ", " + a : ""})`;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.inspect();
  }
  toJSON() {
    return this.toString();
  }
  toString() {
    return this[a].toString();
  }
  getTypeof() {
    return Array.isArray(this[a]) ? "array" : typeof this[a];
  }
  getRawData() {
    return this[e];
  }
  getRawValue() {
    return this[a];
  }
  static isRawObject=isRawObject;
  static removeRawData=removeRawData;
}

function isRawObject(t) {
  return t instanceof RawObject;
}

function removeRawData(t) {
  if (isRawObject(t) && (t = t.getRawValue()), "object" == typeof t) for (let e in t) t[e] = removeRawData(t[e]);
  return t;
}

exports.RawObject = RawObject, exports.SYMBOL_RAW_DATA = e, exports.SYMBOL_RAW_VALUE = a, 
exports.default = RawObject, exports.isRawObject = isRawObject, exports.removeRawData = removeRawData;
//# sourceMappingURL=index.cjs.production.min.cjs.map
