"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const novel_text_1 = require("novel-text");
const console_1 = require("./console");
const index_1 = require("./index");
const Bluebird = require("bluebird");
const iconv = require("iconv-jschardet");
const StrUtil = require("str-util");
const crlf_normalize_1 = require("crlf-normalize");
function logWarn(...argv) {
    return console_1.console.warn(...argv);
}
exports.logWarn = logWarn;
function chkEncoding(data, file) {
    let chk = iconv.detect(data);
    if (data.length === 0) {
        logWarn(file, '此檔案沒有內容');
    }
    else if (chk.encoding != 'UTF-8') {
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
    return Bluebird.method(fn);
}
exports._wrapMethod = _wrapMethod;
function _handleReadFile(data, file) {
    chkEncoding(data, file);
    return crlf_normalize_1.crlf(novel_text_1.default.trim(String(data)), crlf_normalize_1.LF);
}
exports._handleReadFile = _handleReadFile;
function _outputFile(data, options) {
    if (data.data) {
        options = Object.assign({}, data.options, options);
        data = data.data;
    }
    options = index_1.makeOptions(options.file, options);
    return { data, options };
}
exports._outputFile = _outputFile;
function fix_name(name) {
    name = novel_text_1.default.trim(name, {
        trim: true,
    }).trim();
    if (!/^\d+/.test(name)) {
        name = StrUtil.zh2num(name).toString();
    }
    name = name
        //.replace(/^(\d+)[\-話话\s]*/, '$1　')
        .replace(/[“”]/g, '');
    name = StrUtil.zh2jp(name);
    //console.log([name]);
    return name;
}
exports.fix_name = fix_name;
