"use strict";
/**
 * Created by user on 2020/1/4.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._convertHtmlTag001 = exports._replaceHtmlTag = exports._fixRubyInnerContext = void 0;
const fullhalf_1 = require("str-util/lib/fullhalf");
const tags_1 = require("./tags");
function _fixRubyInnerContext(innerContext) {
    let fn = _replaceHtmlTag(($0, $1, $2, $3) => {
        return `<${$1}${$2}>${$3}</${$1}>`;
    });
    return innerContext
        .replace(tags_1.reHtmlRubyRt, fn)
        .replace(tags_1.reHtmlRubyRp, fn);
}
exports._fixRubyInnerContext = _fixRubyInnerContext;
function _replaceHtmlTag(replacer) {
    return ($0, $1, $2, ...argv) => {
        $1 = (0, fullhalf_1.toHalfWidth)($1);
        $2 = (0, fullhalf_1.toHalfWidth)($2);
        return replacer($0, $1, $2, ...argv);
    };
}
exports._replaceHtmlTag = _replaceHtmlTag;
function _convertHtmlTag001(input) {
    return input
        .replace(new RegExp("&lt;|\\u003C|\uFF1C" /* OPEN */, 'ig'), '<')
        .replace(new RegExp("&gt;|\\u003E|\uFF1E" /* CLOSE */, 'ig'), '>');
}
exports._convertHtmlTag001 = _convertHtmlTag001;
//# sourceMappingURL=util.js.map