"use strict";
/**
 * Created by user on 2018/11/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const crlf_normalize_1 = require("crlf-normalize");
const FastGlob = require("fast-glob");
const path = require("upath2");
const BluebirdPromise = require("bluebird");
const fs = require("fs-extra");
const options_1 = require("node-novel-globby/lib/options");
const util_1 = require("./lib/util");
const toc_contents_1 = require("./toc_contents");
function searchByRoot(rootPath) {
    return BluebirdPromise.resolve(FastGlob.async([
        '!README.md',
        '!*/README.md',
        '!.*',
        '!docs',
        '*/*/**/README.md',
        '!*.new.*',
        '!*.out.*',
        '!*.raw',
        '!*.raw.*',
        '!.*',
        '!node_modules',
        '!out',
        '!raw',
    ], {
        cwd: rootPath,
        deep: 2,
    }))
        //.tap(v => console.info(v))
        .then(function (ls) {
        return filterList(ls, rootPath);
    })
        .tap(function (ls) {
        if (!ls.length) {
            console.warn(rootPath);
            return BluebirdPromise.reject(`list is empty`);
        }
    });
}
exports.searchByRoot = searchByRoot;
function isNovelID(dir, rootPath) {
    // @ts-ignore
    let _path = path.resolve(...[rootPath, path.dirname(dir)].filter(v => typeof v !== 'undefined'));
    return util_1.globFirst([
        '**/*.txt',
    ], {
        cwd: _path,
        absolute: true,
        ignore: options_1.defaultPatternsExclude,
    });
    //.tap(v => console.log(v))
}
exports.isNovelID = isNovelID;
function filterList(ls, rootPath) {
    return BluebirdPromise.reduce(ls, async function (arr, dir) {
        let dl = dir.split('/');
        if (dl.length > 3) {
            return arr;
        }
        if (!/_out$/.test(dl[0])) {
            let out = [dl[0] + '_out', ...dl.slice(1)];
            if (ls.includes(out.join('/'))) {
                return arr;
            }
        }
        let hasTxt = await isNovelID(dir, rootPath);
        if (hasTxt) {
            arr.push(dir);
        }
        return arr;
    }, [])
        .tap(function (ls) {
        if (!ls.length) {
            return BluebirdPromise.reject(`list is empty`);
        }
    });
}
exports.filterList = filterList;
function processDataByAuthor(ls, rootPath) {
    return BluebirdPromise.reduce(ls, async function (data, file) {
        let dl = file.split('/');
        let meta = await util_1.loadReadmeMeta(path.join(rootPath, file));
        let key = 'unknow';
        if (meta && meta.novel) {
            if (meta.novel.author) {
                key = meta.novel.author;
            }
            else if (meta.novel.authors && meta.novel.authors.length) {
                key = meta.novel.authors[0];
            }
        }
        data[key] = data[key] || {};
        let NovelID = dl[1];
        data[key][NovelID] = data[key][NovelID] || [];
        data[key][NovelID].push({
            novelID: dl[1],
            pathMain: dl[0],
            file,
            meta,
        });
        return data;
    }, {});
}
exports.processDataByAuthor = processDataByAuthor;
function stringifyDataAuthor(data, rootPath) {
    let arr = [
        `# TOC\n`,
    ];
    let arr_author = [];
    arr_author.push(`## Author\n`);
    Object.entries(data)
        .forEach(function ([author, row], author_idx) {
        arr_author.push(`### ${author}\n`);
        Object.entries(row)
            .forEach(function ([NovelID, list]) {
            arr_author.push(`#### ${NovelID}\n`);
            list.forEach(function (item, index) {
                let link = path.dirname(item.file);
                let link2 = path.join(link, '導航目錄.md');
                if (fs.existsSync(path.join(rootPath, link2))) {
                    link = link2;
                }
                let md = toc_contents_1.makeLink(`${NovelID}`, link);
                arr_author.push(`- ${md} - *${item.pathMain}*`);
            });
            arr_author.push(`\n`);
        });
    });
    arr = arr.concat(arr_author);
    return arr.join(crlf_normalize_1.LF);
}
exports.stringifyDataAuthor = stringifyDataAuthor;
function createTocRoot(_root, outputFile) {
    return searchByRoot(_root)
        .then(function (ls) {
        return processDataByAuthor(ls, _root);
    })
        .then(function (ls) {
        return stringifyDataAuthor(ls, _root);
    })
        .tap(function (v) {
        if (outputFile) {
            return fs.outputFile(outputFile, v);
        }
    });
}
exports.createTocRoot = createTocRoot;
exports.default = createTocRoot;
//createTocRoot('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel')
