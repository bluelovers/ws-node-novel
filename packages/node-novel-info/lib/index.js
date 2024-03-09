"use strict";
/**
 * Created by user on 2018/1/28/028.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._prefix_to_fn = _prefix_to_fn;
exports.filterByPrefix = filterByPrefix;
exports.filterByPrefixReturnKeys = filterByPrefixReturnKeys;
exports.filterByPrefixReturnValues = filterByPrefixReturnValues;
exports.arr_filter = arr_filter;
exports.cb_title_filter = cb_title_filter;
exports.anyToArray = anyToArray;
const array_hyper_unique_1 = require("array-hyper-unique");
function _prefix_to_fn(prefix) {
    if (typeof prefix === 'string') {
        prefix = new RegExp(`^${prefix}`);
    }
    if (typeof prefix === 'function') {
        return prefix;
    }
    else if (prefix instanceof RegExp) {
        //prefix.test('');
        return (key, value) => prefix.test(key);
    }
    throw new TypeError(`not a function , string, RegExp: ${prefix}`);
}
function filterByPrefix(prefix, obj, options = {}) {
    let fn = _prefix_to_fn(prefix);
    let ignore;
    if (options && options.ignore) {
        ignore = _prefix_to_fn(options.ignore);
    }
    return (Object.entries(obj))
        .filter(([key, value]) => {
        if (ignore && ignore(key, value)) {
            return false;
        }
        return fn(key, value);
    });
}
function filterByPrefixReturnKeys(prefix, obj, options) {
    return filterByPrefix(prefix, obj, options)
        .map(item => item[0]);
}
function filterByPrefixReturnValues(prefix, obj, options) {
    return filterByPrefix(prefix, obj, options)
        .map(item => item[1]);
}
function arr_filter(arr) {
    return (0, array_hyper_unique_1.array_unique)(arr).filter(v => {
        return v && v != null
            // @ts-ignore
            && v != 'null'
            // @ts-ignore
            && v != 'undefined';
    });
}
function cb_title_filter(v) {
    return typeof v === 'string' && v && ![
        '連載中',
        '長編 【連載】',
        'undefined',
        'null',
        '',
    ].includes(v.trim());
}
function anyToArray(input, unique) {
    if (typeof input != 'object') {
        input = [input];
    }
    if (unique) {
        input = (0, array_hyper_unique_1.array_unique)(input || []);
    }
    // @ts-ignore
    return input;
}
//# sourceMappingURL=index.js.map