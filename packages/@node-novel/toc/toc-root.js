"use strict";
/**
 * Created by user on 2018/11/14/014.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTocRoot = exports.stringifyDataAuthor = exports.processDataByAuthor = exports.filterList = exports.isNovelID = exports.searchByRoot = void 0;
const array_hyper_unique_1 = require("array-hyper-unique");
const crlf_normalize_1 = require("crlf-normalize");
const fast_glob_1 = __importDefault(require("@bluelovers/fast-glob"));
const upath2_1 = __importDefault(require("upath2"));
const bluebird_1 = __importDefault(require("bluebird"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const options_1 = require("node-novel-globby/lib/options");
const util_1 = require("./lib/util");
const toc_contents_1 = require("./toc_contents");
const sort_object_keys2_1 = __importDefault(require("sort-object-keys2"));
function searchByRoot(rootPath) {
    return bluebird_1.default.resolve(fast_glob_1.default.async([
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
        return filterList(ls.sort(), rootPath);
    })
        .tap(function (ls) {
        if (!ls.length) {
            console.warn(rootPath);
            return bluebird_1.default.reject(`list is empty`);
        }
    });
}
exports.searchByRoot = searchByRoot;
function isNovelID(dir, rootPath) {
    // @ts-ignore
    let _path = upath2_1.default.resolve(...[rootPath, upath2_1.default.dirname(dir)].filter(v => typeof v !== 'undefined'));
    return util_1.globFirst([
        '**/*.txt',
        //...defaultPatternsExclude,
    ], {
        cwd: _path,
        absolute: true,
        ignore: options_1.defaultPatternsExclude,
    });
    //.tap(v => console.log(v))
}
exports.isNovelID = isNovelID;
function filterList(ls, rootPath) {
    return bluebird_1.default.reduce(ls, async function (arr, dir) {
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
            return bluebird_1.default.reject(`list is empty`);
        }
    });
}
exports.filterList = filterList;
function processDataByAuthor(ls, rootPath, options) {
    return bluebird_1.default.reduce(ls, async function (data, file) {
        let dl = file.split('/');
        let meta = await util_1.loadReadmeMeta(upath2_1.default.join(rootPath, file));
        let author = 'unknow';
        if (meta) {
            if (meta.novel) {
                if (meta.novel.author) {
                    author = meta.novel.author;
                }
                else if (meta.novel.authors && meta.novel.authors.length) {
                    author = meta.novel.authors[0];
                }
            }
        }
        else {
            return data;
        }
        data[author] = data[author] || {};
        let novelID = dl[1];
        data[author][novelID] = data[author][novelID] || [];
        data[author][novelID].push({
            novelID: dl[1],
            pathMain: dl[0],
            file,
            author,
            // @ts-ignore
            meta,
        });
        return data;
    }, {})
        .then(data => {
        sort_object_keys2_1.default(data, {
            sort: util_1.tocSortCallback,
            useSource: true,
        });
        Object.keys(data).forEach(function (author) {
            sort_object_keys2_1.default(data[author], {
                sort: util_1.tocSortCallback,
                useSource: true,
            });
        });
        let key = 'unknow';
        let old = data[key];
        delete data[key];
        if (old) {
            data[key] = old;
        }
        return data;
    });
}
exports.processDataByAuthor = processDataByAuthor;
function stringifyDataAuthor(data, rootPath, options) {
    let arr = [
        `# TOC\n`,
        `## Author\n`
    ];
    let arr_author = [];
    let authors = [];
    options = options || {};
    Object.entries(data)
        .forEach(function ([author, row], author_idx) {
        arr_author.push(`### ${author}\n`);
        authors.push(author);
        Object.entries(row)
            .forEach(function ([novelID, list]) {
            arr_author.push(`#### ${novelID}\n`);
            let skip = [
                novelID,
            ];
            let titles = [];
            let arr_item = [];
            list.forEach(function (item, index) {
                let link = upath2_1.default.dirname(item.file);
                let link2 = upath2_1.default.join(link, '導航目錄.md');
                if (fs_extra_1.default.existsSync(upath2_1.default.join(rootPath, link2))) {
                    link = link2;
                }
                skip.push(novelID);
                let md = toc_contents_1.makeLink(`${novelID}`, link);
                let text = `- ${md} - *${item.pathMain}*`;
                if (options.cbForEachSubNovel) {
                    let ret = options.cbForEachSubNovel(text, item);
                    if (typeof ret === 'string') {
                        text = ret;
                    }
                }
                arr_item.push(text);
                titles = titles.concat(util_1.getNovelTitles(item.meta));
            });
            titles = array_hyper_unique_1.array_unique(titles)
                .filter(v => v && v != 'undefined')
                .filter(v => !skip.includes(v));
            if (titles.length) {
                arr_author.push(`> ${titles.join(' , ')}\n`);
            }
            arr_author = arr_author.concat(arr_item);
            arr_author.push(crlf_normalize_1.LF);
        });
    });
    let authors_anchor = authors.map(name => {
        return `[${util_1.md_link_escape(name)}](#${util_1.md_anchor_gitee(name)})`;
    }).join('\n  ／  ');
    arr.push(`> ${authors_anchor}\n`);
    arr = arr.concat(arr_author);
    arr.push(crlf_normalize_1.LF);
    return arr.join(crlf_normalize_1.LF);
}
exports.stringifyDataAuthor = stringifyDataAuthor;
function createTocRoot(_root, outputFile, options) {
    options = options || {};
    return searchByRoot(_root)
        .then(function (ls) {
        return processDataByAuthor(ls, _root, options);
    })
        .then(function (data) {
        return stringifyDataAuthor(data, _root, options);
    })
        .tap(function (v) {
        if (outputFile) {
            return fs_extra_1.default.outputFile(outputFile, v);
        }
    });
}
exports.createTocRoot = createTocRoot;
exports.default = createTocRoot;
//createTocRoot('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel').tap(v => console.dir(v))
//# sourceMappingURL=toc-root.js.map