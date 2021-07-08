"use strict";
/**
 * Created by user on 2019/2/23.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBom = exports.regexMerge = exports.removeLine = exports.removeSpace = exports.removePunctuation = exports.regexpPunctuation = void 0;
const array_hyper_unique_1 = require("array-hyper-unique");
exports.regexpPunctuation = regexMerge([
    /\p{Punctuation}+/gu,
    /[\u2000-\u206F\u2E00-\u2E7F\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\uffe0-\uffef\u2500-\u257f\u2200-\u22ff\u25A0-\u25FF\u2600-\u26F0\u2190-\u21FF\u02b9-\u02df\u02E4-\u02f0\u2580-\u259F]+/ug,
    /[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]/gu,
    /[\u00A1-\u00BF\u00D7\u00F7]/gu,
    /[\u2100-\u214F]/gu,
]);
function removePunctuation(input) {
    return input
        .replace(exports.regexpPunctuation, '');
}
exports.removePunctuation = removePunctuation;
function removeSpace(input) {
    return input
        .replace(/\s+/g, function (s) {
        return s.replace(/[^\r\n]+/g, '');
    })
        .replace(/[\xA0 　]+/gu, '');
}
exports.removeSpace = removeSpace;
function removeLine(input) {
    return input
        .replace(/[\r\n]+/gu, '');
}
exports.removeLine = removeLine;
/**
 * 合併多個 regexp 為一個
 */
function regexMerge(list) {
    let source = [];
    let flags = [];
    list.forEach(function (a) {
        source.push(a.source);
        a.flags && flags.push(...a.flags.split(''));
    });
    (0, array_hyper_unique_1.array_unique_overwrite)(source);
    (0, array_hyper_unique_1.array_unique_overwrite)(flags);
    return new RegExp(source.join('|'), flags.join(''));
}
exports.regexMerge = regexMerge;
function removeBom(input) {
    return input
        .replace(/\uFEFF/gu, '');
}
exports.removeBom = removeBom;
//# sourceMappingURL=util.js.map