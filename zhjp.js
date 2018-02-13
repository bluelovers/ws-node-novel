"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
function filename(name) {
    return jp(name)
        .replace(/·/g, '・');
}
exports.filename = filename;
function word(name) {
    return jp(name);
}
exports.word = word;
function jp(txt) {
    return zh(StrUtil.zh2jp(txt, {
        skip: '龙竜龍制征里像拜',
    }))
        .replace(/诅/g, '詛')
        .replace(/复仇/g, '復仇')
        .replace(/戦斗/g, '戦闘');
}
exports.jp = jp;
function zh(txt) {
    return txt
        .replace(/与/g, '與')
        .replace(/[亜亚亞]/g, '亞')
        .replace(/価/, '價')
        .replace(/[觉覚覺]/g, '覺')
        .replace(/亏/g, '虧');
}
exports.zh = zh;
const self = require("./zhjp");
exports.default = self;
