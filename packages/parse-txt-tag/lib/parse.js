"use strict";
/**
 * Created by user on 2020/1/4.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const tags_1 = require("./tags");
const fullhalf_1 = require("str-util/lib/fullhalf");
const util_1 = require("./util");
function parse(source, options) {
    let context = source;
    const { cache = {}, attach = {} } = options;
    attach.images = attach.images || {};
    if (options.on) {
        context = context
            .replace(tags_1.reTxtHtmlTag, (s, tagName = '', attr = '', innerContext = '') => {
            tagName = fullhalf_1.toHalfWidth(tagName).toLowerCase();
            let cb = options.on[tagName] || options.on.default;
            if (tagName === 'ruby') {
                innerContext = util_1._fixRubyInnerContext(innerContext);
            }
            if (cb) {
                let ret = cb({
                    tagName,
                    attr,
                    innerContext,
                    cache,
                    attach,
                });
                if (ret != null) {
                    return ret;
                }
            }
            return `<${tagName}>` + innerContext + `</${tagName}>`;
        });
        let tagName = 'img';
        let cb = (options.on[tagName] || options.on.default);
        if (cb) {
            context = context
                .replace(tags_1.reTxtImgTag, (s, id) => {
                let ret = cb({
                    tagName,
                    attr: '',
                    innerContext: id,
                    cache,
                    attach,
                });
                if (ret != null) {
                    return ret;
                }
                return s;
            });
        }
    }
    return {
        context,
        cache,
        attach,
    };
}
exports.parse = parse;
//# sourceMappingURL=parse.js.map