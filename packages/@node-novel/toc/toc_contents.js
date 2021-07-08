"use strict";
/**
 * Created by user on 2018/8/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getList = exports.makeLink = exports.makeHeader = exports.makeHeaderAsync = exports.processTocContents = exports.md_link_escape = exports.md_href = void 0;
const tslib_1 = require("tslib");
const normalize_1 = require("@node-novel/normalize");
const array_hyper_unique_1 = require("array-hyper-unique");
const bluebird_1 = (0, tslib_1.__importDefault)(require("bluebird"));
const fs_extra_1 = (0, tslib_1.__importDefault)(require("fs-extra"));
const novelGlobby = (0, tslib_1.__importStar)(require("node-novel-globby/g"));
const glob_sort_1 = require("node-novel-globby/lib/glob-sort");
const util_1 = require("./lib/util");
Object.defineProperty(exports, "md_href", { enumerable: true, get: function () { return util_1.md_href; } });
Object.defineProperty(exports, "md_link_escape", { enumerable: true, get: function () { return util_1.md_link_escape; } });
const upath2_1 = (0, tslib_1.__importDefault)(require("upath2"));
function processTocContents(basePath, outputFile, fnHeader = makeHeader) {
    return getList(basePath)
        .then(function (ls) {
        return (0, glob_sort_1.sortTree)(ls);
    })
        .then(async function (ls) {
        if (!ls.length) {
            return '';
        }
        let lastTop;
        let lastTop2;
        let lv0 = true;
        return ls.reduce(function (a, b) {
            let c = b.split('/');
            let nowTop = c[0];
            if (c.length != 1) {
                lv0 = false;
            }
            else if (lv0) {
                nowTop = 'root';
            }
            else {
                lastTop = undefined;
                lastTop2 = undefined;
            }
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
            else if (c.length == 1) {
                nowFile = b;
            }
            else {
                nowFile = c[1];
            }
            let md = makeLink(nowFile, b);
            a.push(`- ${md}`);
            lastTop = nowTop;
            return a;
            // @ts-ignore
        }, await fnHeader(basePath)).join("\n") + "\n\n";
    })
        .tap(function (ls) {
        if (ls && outputFile) {
            return fs_extra_1.default.outputFile(outputFile, ls);
        }
    });
}
exports.processTocContents = processTocContents;
function makeHeaderAsync(basePath, ...argv) {
    return bluebird_1.default.resolve(makeHeader(basePath));
}
exports.makeHeaderAsync = makeHeaderAsync;
function makeHeader(basePath, ...argv) {
    let titles = [
        upath2_1.default.basename(basePath),
    ];
    let meta = (0, util_1.loadReadmeMetaSync)(upath2_1.default.join(basePath, 'README.md'));
    if (meta && meta.novel) {
        let arr = (0, util_1.getNovelTitles)(meta);
        if (arr.length) {
            titles = (0, array_hyper_unique_1.array_unique)(titles.concat(arr));
        }
    }
    let arr = [
        `# CONTENTS\n`,
        titles.join('  \n') + `  \n`,
    ];
    if (meta && meta.novel && meta.novel.author) {
        arr.push(`作者： ${meta.novel.author}  \n`);
    }
    let _appended = [];
    let _path;
    _path = 'README.md';
    if (fs_extra_1.default.existsSync(upath2_1.default.join(basePath, _path))) {
        let md = makeLink(`README.md`, _path);
        _appended.push(`- :closed_book: ${md} - 簡介與其他資料`);
    }
    {
        let _arr = [];
        _path = '譯名對照.md';
        if (fs_extra_1.default.existsSync(upath2_1.default.join(basePath, _path))) {
            let md = makeLink(`譯名對照`, _path);
            _arr.push(`${md}`);
        }
        _path = '整合樣式.md';
        if (fs_extra_1.default.existsSync(upath2_1.default.join(basePath, _path))) {
            let md = makeLink(`整合樣式`, _path);
            _arr.push(`${md}`);
        }
        if (_arr.length) {
            _appended.push(`- :pencil: ${_arr.join(' ／ ')}`);
        }
    }
    _path = 'ja.md';
    if (fs_extra_1.default.existsSync(upath2_1.default.join(basePath, _path))) {
        let md = makeLink(`含有原文的章節`, _path);
        _appended.push(`- ${md} - 可能為未翻譯或者吞樓，等待圖轉文之類`);
    }
    _path = '待修正屏蔽字.md';
    if (fs_extra_1.default.existsSync(upath2_1.default.join(basePath, _path))) {
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
    let t = (0, normalize_1.normalize_strip)(title, isDir);
    if (!isDir) {
        t = upath2_1.default.basename(t, '.txt');
    }
    t = (0, util_1.md_link_escape)(t);
    return `[${t}](${(0, util_1.md_href)(link)})`;
}
exports.makeLink = makeLink;
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
//# sourceMappingURL=toc_contents.js.map