"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
function filename(name, options = {}) {
    return jp(name, options)
        .replace(/·/g, '・');
}
exports.filename = filename;
function word(name, options = {}) {
    return jp(name, options);
}
exports.word = word;
function jp(txt, options = {}) {
    return zh(StrUtil.zh2jp(txt, {
        skip: '龙竜龍制征里像拜冰' + (options.skip || ''),
    }))
        .replace(/诅/g, '詛')
        .replace(/复仇/g, '復仇')
        .replace(/戦斗/g, '戦闘')
        .replace(/^プロローグ/, '序')
        .replace(/^エピローグ/, '終章');
}
exports.jp = jp;
function zh(txt, options = {}) {
    return txt
        .replace(/与/g, '與')
        .replace(/[亜亚亞]/g, '亞')
        .replace(/価/, '價')
        .replace(/[觉覚覺]/g, '覺')
        .replace(/亏/g, '虧')
        .replace(/[·‧・···•]/g, '・');
}
exports.zh = zh;
const self = require("./zhjp");
exports.default = self;
