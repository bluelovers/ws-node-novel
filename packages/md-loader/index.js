"use strict";
/**
 * Created by user on 2019/2/1/001.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixContent = exports.stringify = exports.parse = void 0;
const GrayMatter = require("gray-matter");
const node_novel_info_1 = require("node-novel-info");
function parse(inputContent, options) {
    let { matterOptions, parseOptions, parser = node_novel_info_1.mdconf_parse } = (options || {});
    let _stringify = options.stringify || node_novel_info_1.stringify;
    if (inputContent == null || typeof stringify !== 'function' || typeof parser !== 'function') {
        let e = new TypeError(``);
        // @ts-ignore
        e.inputContent = inputContent;
        // @ts-ignore
        e._options = options;
        throw e;
    }
    // @ts-ignore
    inputContent = fixContent(inputContent);
    let matter = GrayMatter(inputContent, matterOptions);
    // @ts-ignore
    let mdconf = parser(inputContent, parseOptions);
    if (!mdconf || mdconf && Object.keys(mdconf).length == 0) {
        mdconf = null;
    }
    return {
        /**
         * 經由 gray-matter 解析後的物件
         */
        matter,
        /**
         * 排除 Front Matter 後的原始內容
         */
        content: matter.content,
        /**
         * Front Matter 資料
         */
        data: matter.data,
        /**
         * 回傳的 mdconf 資料 預設為 node-novel-info
         * 如果回傳的 為 {} 空物件則會被轉換為 null
         */
        mdconf,
        /**
         * 用來將取得的物件轉換回 md
         * 當 content, mdconf 同時存在時 content > mdconf
         */
        stringify(inputData) {
            return stringify(inputData, {
                // @ts-ignore
                matterOptions,
                stringify: _stringify,
            });
        },
    };
}
exports.parse = parse;
/**
 * 用來將取得的物件轉換回 md
 * 當 content, mdconf 同時存在時 content > mdconf
 */
function stringify(inputData, options) {
    let { matterOptions, stringify = node_novel_info_1.stringify } = (options || {});
    // @ts-ignore
    let content = inputData.content != null
        // @ts-ignore
        ? inputData.content
        // @ts-ignore
        : inputData.mdconf ? stringify(inputData.mdconf) : null;
    return GrayMatter.stringify(fixContent(content), 
    // @ts-ignore
    inputData.data, 
    // @ts-ignore
    matterOptions);
}
exports.stringify = stringify;
/**
 * 將 inputContent 轉為 string
 */
function fixContent(inputContent) {
    if (inputContent != null) {
        // @ts-ignore
        inputContent = String(inputContent)
            .replace(/^[\r\n]+/, '');
        // @ts-ignore
        return inputContent;
    }
}
exports.fixContent = fixContent;
exports.default = exports;
//# sourceMappingURL=index.js.map