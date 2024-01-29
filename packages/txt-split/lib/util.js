"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fix_name = exports._outputFile = exports._handleReadFile = exports._wrapMethod = exports.padIndexEnd = exports.padIndexStart = exports.padIndex = exports.chkEncoding = exports.logWarn = void 0;
const tslib_1 = require("tslib");
const layout_1 = tslib_1.__importDefault(require("@node-novel/layout"));
const console_1 = require("./console");
const index_1 = require("./index");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
const iconv_jschardet_1 = require("iconv-jschardet");
const zh2num_1 = require("@lazy-cjk/zh2num");
const crlf_normalize_1 = require("crlf-normalize");
const jp_1 = require("cjk-conv/lib/jp");
function logWarn(...argv) {
    return console_1.console.warn(...argv);
}
exports.logWarn = logWarn;
function chkEncoding(data, file, options) {
    let chk = (0, iconv_jschardet_1.detect)(data);
    if (data.length === 0) {
        logWarn(file, '此檔案沒有內容');
    }
    else if (chk.encoding !== 'UTF-8') {
        logWarn(file, '此檔案可能不是 UTF8 請檢查編碼或利用 MadEdit 等工具轉換', chk);
    }
    return chk;
}
exports.chkEncoding = chkEncoding;
function padIndex(n, maxLength = 5, fillString = '0') {
    let s = padIndexStart(n, maxLength - 1, fillString);
    return padIndexEnd(s, maxLength, fillString);
}
exports.padIndex = padIndex;
function padIndexStart(n, maxLength = 4, fillString = '0') {
    if (!['number', 'string'].includes(typeof n)) {
        throw TypeError(`n must is string | number`);
    }
    return String(n).padStart(maxLength, String(fillString));
}
exports.padIndexStart = padIndexStart;
function padIndexEnd(n, maxLength = 5, fillString = '0') {
    if (!['number', 'string'].includes(typeof n)) {
        throw TypeError(`n must is string | number`);
    }
    return String(n).padEnd(maxLength, String(fillString));
}
exports.padIndexEnd = padIndexEnd;
function _wrapMethod(fn) {
    return bluebird_1.default.method(fn);
}
exports._wrapMethod = _wrapMethod;
function _handleReadFile(data, file, options) {
    let chk = chkEncoding(data, file, options);
    let txt;
    if (options && options.autoFsIconv && chk.encoding !== 'UTF-8') {
        logWarn('嘗試自動將內容轉換為 UTF-8', chk);
        let buf = (0, iconv_jschardet_1.encode)(data);
        let bool = buf.equals((Buffer.isBuffer(data) ? data : Buffer.from(data)));
        if (bool) {
            let chk2 = (0, iconv_jschardet_1.detect)(buf);
            logWarn(`內容變更`, chk, '=>', chk2);
            data = buf;
        }
        else {
            logWarn(`內容無變化`);
        }
    }
    txt = String(data);
    return (0, crlf_normalize_1.crlf)(layout_1.default.trim(txt), crlf_normalize_1.LF);
}
exports._handleReadFile = _handleReadFile;
function _outputFile(data, options) {
    if (data.data) {
        options = Object.assign({}, data.options, options);
        data = data.data;
    }
    options = (0, index_1.makeOptions)(options.file, options);
    return { data, options };
}
exports._outputFile = _outputFile;
function fix_name(name) {
    name = layout_1.default.trim(name, {
        trim: true,
    }).trim();
    if (!/^\d+/.test(name)) {
        name = (0, zh2num_1.zh2num)(name).toString();
    }
    name = name
        //.replace(/^(\d+)[\-話话\s]*/, '$1　')
        .replace(/[“”]/g, '');
    name = (0, jp_1.zh2jp)(name);
    //console.log([name]);
    return name;
}
exports.fix_name = fix_name;
//# sourceMappingURL=util.js.map