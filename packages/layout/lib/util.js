"use strict";
/**
 * Created by user on 2019/5/29.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const blank_line_1 = require("blank-line");
function _isIwordsArray(value) {
    return Array.isArray(value) && (value.length > 1);
}
exports._isIwordsArray = _isIwordsArray;
function _isIwordsArray2(value) {
    return Array.isArray(value) && value.length == 1 && typeof value[0] == 'function';
}
exports._isIwordsArray2 = _isIwordsArray2;
function _isIwordsUserSp(value) {
    return typeof value.s == 'string' && new RegExp(`${index_1.SP_KEY}(.+)$`).test(value.s);
}
exports._isIwordsUserSp = _isIwordsUserSp;
function _handleTextLayout(html, options) {
    if (!html.match(/[^\n]\n[^\n]/g)) {
        let [min, mid, max] = blank_line_1.default(html);
        if (min > 2) {
            options.allow_lf2 = false;
        }
        if (max >= 3) {
            if (min > 2) {
                let r = new RegExp(`\\n{${min - 1}}(\\n+)`, 'g');
                html = html
                    //.replace(/\n{2}(\n*)/g, '$1')
                    .replace(r, '$1');
            }
            html = html
                .replace(/\n{3,}/g, "\n\n\n");
        }
        //console.log(options);
        if (!options.allow_lf2) {
            html = html
                .replace(/\n\n/g, "\n");
        }
    }
    /*
    html = html
    // for ts
        .toString()
        .replace(/([^\n「」【】《》“”『』（）\[\]"](?:[！？?!。]*)?)\n((?:[—]+)?[「」“”【】《》（）『』])/ug, "$1\n\n$2")

        .replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n((?:\u3000*)[^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")

        .replace(/([^\n「」【】《》“”『』（）\[\]"≪≫](?:[！？?!。]*)?)\n((?:[—]+)?[≪≫「」“”【】《》（）『』])/ug, "$1\n\n$2")

        .replace(/(）(?:[！？?!。]*)?)\n([「」【】《》『』“”])/ug, "$1\n\n$2")
    ;
    */
    html = html
        .replace(/^\n+|[\s\u3000]+$/g, '')
        .replace(/(\n){4,}/g, "\n\n\n\n" /* LF4 */);
    if (options.allow_lf3) {
        html = html
            .replace(/(\n){3,}/g, "\n\n\n" /* LF3 */);
    }
    else {
        html = html
            .replace(/(\n){3}/g, "\n\n" /* LF2 */);
    }
    return html;
}
exports._handleTextLayout = _handleTextLayout;
//# sourceMappingURL=util.js.map