"use strict";
/**
 * Created by user on 2019/2/23.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const UString = require("uni-string");
const crlf_normalize_1 = require("crlf-normalize");
const execall2_1 = require("execall2");
const util_1 = require("./lib/util");
function txtReport(input) {
    let buf_length = Buffer.from(input).length;
    input = crlf_normalize_1.crlf(util_1.removeBom(input), crlf_normalize_1.LF);
    let js_length = input.length;
    let uni_length = UString.size(input);
    let line_length = execall2_1.execall(/\n/g, input).length;
    let no_blank_line_length;
    {
        let s = util_1.removeSpace(input)
            .replace(/\n{2,}/g, '\n')
            .replace(/^\n+|\n+$/g, '');
        no_blank_line_length = execall2_1.execall(/\n/g, s).length;
        if (util_1.removeLine(s).length) {
            no_blank_line_length += 1;
        }
    }
    let hanzi_length = execall2_1.execall(/[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/ug, input).length;
    let ja_length = execall2_1.execall(/[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/ug, input).length;
    let punctuation_length;
    {
        let s = util_1.removePunctuation(input);
        punctuation_length = js_length - s.length;
    }
    let space_length;
    {
        let s = util_1.removeSpace(input);
        space_length = js_length - s.length;
    }
    return {
        /**
         * buffer
         */
        buf_length,
        /**
         * js string (轉換分行為 LF 之後的長度)
         */
        js_length,
        /**
         * uni-string 一般狀況下會等於 js string
         * 但如果有特殊字元或者 emoji 之類 就會產生差異
         */
        uni_length,
        /**
         * line 斷行
         */
        line_length,
        /**
         * line 斷行 (不包含空白行)
         */
        no_blank_line_length,
        /**
         * 漢字 (包含中文以外的漢字)
         */
        hanzi_length,
        /**
         * hiragana (平假名) + katakana (片假名)
         */
        ja_length,
        /**
         * punctuation 標點符號 與 其他符號
         */
        punctuation_length,
        /**
         * 非斷行以外的空白
         */
        space_length,
    };
}
exports.txtReport = txtReport;
/**
 * 將多個報告總和起來
 */
function txtReportSum(arr) {
    return arr.reduce(function (a, b) {
        Object.entries(b)
            .forEach(function ([k, v]) {
            a[k] = (a[k] || 0) + v;
        });
        return a;
    }, {});
}
exports.txtReportSum = txtReportSum;
//# sourceMappingURL=index.js.map