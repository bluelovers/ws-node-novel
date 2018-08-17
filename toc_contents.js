"use strict";
/**
 * Created by user on 2018/8/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const path = require("upath2");
const fs = require("fs-extra");
const index_1 = require("./index");
const novelGlobby = require("node-novel-globby/g");
const glob_sort_1 = require("node-novel-globby/lib/glob-sort");
const normalize_1 = require("@node-novel/normalize");
/*
processTocContents('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/user/豚公爵に転生したから、今度は君に好きと言いたい', './test/temp/123.txt')
    .tap(function (ls)
    {
        console.log(ls);
    })
;
*/
function processTocContents(basePath, outputFile, fnHeader = makeHeader) {
    return getList(basePath)
        .then(function (ls) {
        return glob_sort_1.sortTree(ls);
    })
        .then(async function (ls) {
        if (!ls.length) {
            return '';
        }
        let lastTop;
        let lastTop2;
        return ls.reduce(function (a, b) {
            let c = b.split('/');
            let nowTop = c[0];
            if (nowTop != lastTop) {
                let md = makeLink(nowTop, c[0], true);
                a.push(`\n\n## ${md}\n`);
                lastTop2 = undefined;
            }
            let nowFile;
            if (c.length > 2) {
                let nowTop2 = c[1];
                if (nowTop2 != lastTop2) {
                    let md = makeLink(nowTop2, c.slice(0, 2).join('/'), true);
                    a.push(`\n### ${md}\n`);
                }
                lastTop2 = nowTop2;
                nowFile = c[2];
            }
            else {
                nowFile = c[1];
            }
            let md = makeLink(nowFile, b);
            a.push(`- ${md}`);
            lastTop = nowTop;
            return a;
        }, await fnHeader(basePath)).join("\n") + "\n\n";
    })
        .tap(function (ls) {
        if (ls && outputFile) {
            return fs.outputFile(outputFile, ls);
        }
    });
}
exports.processTocContents = processTocContents;
function makeHeaderAsync(basePath) {
    return Promise.resolve(makeHeader(basePath));
}
exports.makeHeaderAsync = makeHeaderAsync;
function makeHeader(basePath) {
    let arr = [
        `# CONTENTS\n`,
        path.basename(basePath),
    ];
    let _appended = [];
    let _path;
    _path = 'README.md';
    if (fs.existsSync(path.join(basePath, _path))) {
        let md = makeLink(`README.md`, _path);
        _appended.push(`- ${md} - 簡介與其他資料`);
    }
    _path = '譯名對照.md';
    if (fs.existsSync(path.join(basePath, _path))) {
        let md = makeLink(`譯名對照`, _path);
        _appended.push(`- ${md}`);
    }
    _path = 'ja.md';
    if (fs.existsSync(path.join(basePath, _path))) {
        let md = makeLink(`含有原文的章節`, _path);
        _appended.push(`- ${md} - 可能為未翻譯或者吞樓，等待圖轉文之類`);
    }
    _path = '待修正屏蔽字.md';
    if (fs.existsSync(path.join(basePath, _path))) {
        let md = makeLink(`待修正屏蔽字`, _path);
        _appended.push(`- ${md} - 需要有人協助將 \`**\` 內的字補上`);
    }
    if (_appended.length) {
        arr.push("\n");
        arr.push(..._appended);
    }
    return arr;
}
exports.makeHeader = makeHeader;
function makeLink(title, link, isDir) {
    let t = normalize_1.normalize_strip(title, isDir);
    if (!isDir) {
        t = path.basename(t, '.txt');
    }
    t = md_link_escape(t);
    return `[${t}](${index_1.md_href(link)})`;
}
exports.makeLink = makeLink;
function md_link_escape(text) {
    return text.replace(/[\[\]]/g, function (s) {
        return '\\' + s;
    });
}
exports.md_link_escape = md_link_escape;
function getList(basePath) {
    return novelGlobby.globbyASync([
        '**/*.txt',
    ], {
        cwd: basePath,
        throwEmpty: false,
    });
}
exports.getList = getList;
exports.default = processTocContents;
