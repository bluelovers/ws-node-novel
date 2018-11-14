"use strict";
/**
 * Created by user on 2018/11/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const array_hyper_unique_1 = require("array-hyper-unique");
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
    }, {})
        .then(data => {
        let key = 'unknow';
        let old = data[key];
        delete data[key];
        data[key] = old;
        return data;
    });
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
            .forEach(function ([novelID, list]) {
            arr_author.push(`#### ${novelID}\n`);
            let skip = [
                novelID,
            ];
            let titles = [];
            let arr_item = [];
            list.forEach(function (item, index) {
                let link = path.dirname(item.file);
                let link2 = path.join(link, '導航目錄.md');
                if (fs.existsSync(path.join(rootPath, link2))) {
                    link = link2;
                }
                skip.push(novelID);
                let md = toc_contents_1.makeLink(`${novelID}`, link);
                arr_item.push(`- ${md} - *${item.pathMain}*`);
                titles = titles.concat(util_1.getNovelTitles(item.meta));
            });
            titles = array_hyper_unique_1.array_unique(titles)
                .filter(v => !skip.includes(v));
            if (titles.length) {
                arr_author.push(`> ${titles.join(' , ')}\n`);
            }
            arr_author = arr_author.concat(arr_item);
            arr_author.push(crlf_normalize_1.LF);
        });
    });
    arr = arr.concat(arr_author);
    arr.push(crlf_normalize_1.LF);
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
//createTocRoot('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel').tap(v => console.dir(v))
