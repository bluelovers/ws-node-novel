import { inspect as t } from "util";

const e = /*#__PURE__*/ Symbol.for("raw_data"), a = /*#__PURE__*/ Symbol.for("raw_value");

class RawObject {
  constructor(t, r) {
    r && (this[e] = r), this[a] = t;
  }
  inspect() {
    let a = this[e] && this[e].type;
    return "Raw" + this.getTypeof().replace(/^[a-z]/, (function(t) {
      return t.toUpperCase();
    })) + `(${t(this.getRawValue())}${a ? ", " + a : ""})`;
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

export { RawObject, e as SYMBOL_RAW_DATA, a as SYMBOL_RAW_VALUE, RawObject as default, isRawObject, removeRawData };
//# sourceMappingURL=index.esm.mjs.map
