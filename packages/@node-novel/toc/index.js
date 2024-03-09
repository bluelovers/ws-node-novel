"use strict";
/**
 * Created by user on 2018/5/1/001.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promise = exports.console = exports.md_href = void 0;
exports.get_ids = get_ids;
exports.processToc = processToc;
exports.createReadmeData = createReadmeData;
exports.defaultFilter = defaultFilter;
const tslib_1 = require("tslib");
const array_hyper_unique_1 = require("array-hyper-unique");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
exports.Promise = bluebird_1.default;
const debug_color2_1 = require("debug-color2");
const fast_glob_1 = tslib_1.__importDefault(require("@bluelovers/fast-glob"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const node_novel_info_1 = require("node-novel-info");
const sort_object_keys2_1 = tslib_1.__importDefault(require("sort-object-keys2"));
const util_1 = require("./lib/util");
Object.defineProperty(exports, "md_href", { enumerable: true, get: function () { return util_1.md_href; } });
const upath2_1 = tslib_1.__importDefault(require("upath2"));
exports.console = new debug_color2_1.Console(null, {
    enabled: true,
    inspectOptions: {
        colors: true,
    },
    chalkOptions: {
        enabled: true,
    },
});
exports.console.enabledColor = true;
function get_ids(cwd, filter) {
    return bluebird_1.default.resolve((0, fast_glob_1.default)([
        '*',
        '!docs',
        '!.*',
        '!*.raw',
        '!raw',
    ], {
        deep: 1,
        onlyDirectories: true,
        markDirectories: false,
        cwd,
    }))
        .then(function (ls) {
        if (filter) {
            return ls.filter(filter);
        }
        return ls;
    });
}
function processToc(DIST_NOVEL_ROOT, filter) {
    return get_ids(DIST_NOVEL_ROOT, filter)
        .then(async function (ls) {
        if (!ls.length) {
            return bluebird_1.default.reject(`get_ids return empty`);
        }
        return ls;
    })
        .tap(function () {
        exports.console.debug(`[TOC] 開始建立 toc 列表`);
    })
        .reduce(async function (toc_ls, pathMain) {
        const cwd = upath2_1.default.join(DIST_NOVEL_ROOT, pathMain);
        const IS_OUT = /_out$/.test(pathMain);
        //console.log(`[TOC] 檢查 ${pathMain}`);
        let bool = false;
        await bluebird_1.default
            .reduce((0, fast_glob_1.default)([
            '*/README.md',
        ], {
            cwd,
        }), function (ret, item) {
            return createReadmeData(cwd, ret, item);
        }, {})
            .tap(async function (ret) {
            if (!Object.keys(ret).length) {
                exports.console.gray(`[TOC] 忽略 ${pathMain}`);
                return null;
            }
            bool = true;
            exports.console.debug(`[TOC] 處理 ${pathMain}`);
            toc_ls[pathMain] = ret;
            ret = Object.keys(ret)
                .sort()
                .reduce(function (a, item_id) {
                let item = ret[item_id];
                item.link = `[${item_id}](${(0, util_1.md_href)(item_id)}/)`;
                let target_id = IS_OUT ? pathMain.replace(/_out$/, '') : pathMain + '_out';
                let link_path = upath2_1.default.join(DIST_NOVEL_ROOT, target_id, item_id);
                //console.log(link_path, fs.existsSync(link_path));
                if (fs_extra_1.default.existsSync(link_path)) {
                    item[IS_OUT
                        ? 'link_source'
                        : 'link_output'] = `[${item_id}](../${target_id}/${(0, util_1.md_href)(item_id)}/)`;
                }
                if (Array.isArray(item.titles)) {
                    item.titles = (0, array_hyper_unique_1.array_unique)(item.titles)
                        .filter(v => v);
                }
                if (Array.isArray(item.tags)) {
                    item.tags = (0, array_hyper_unique_1.array_unique)(item.tags)
                        .filter(v => v);
                }
                if (!item.titles) {
                    delete item.titles;
                }
                else if (item.titles.length == 1) {
                    // @ts-ignore
                    item.titles = item.titles[0];
                }
                if (item.tags) {
                    // @ts-ignore
                    item.tags = item.tags.join(' , ');
                }
                (0, sort_object_keys2_1.default)(item, {
                    useSource: true,
                    keys: [
                        'link',
                        'link_output',
                        'link_source',
                        'titles',
                        'tags',
                    ],
                });
                a[item_id] = item;
                return a;
            }, {});
            let md = node_novel_info_1.mdconf.stringify({
                toc: ret,
            });
            //console.log(pathMain, ret);
            //console.log(md);
            await fs_extra_1.default.writeFile(upath2_1.default.join(cwd, 'README.md'), md);
        });
        return toc_ls;
    }, {})
        .tap(function () {
        exports.console.debug(`[TOC] 結束建立 toc 列表`);
    });
}
function createReadmeData(cwd, ret, item) {
    return bluebird_1.default.resolve()
        .then(async () => {
        let item_id = upath2_1.default.basename(upath2_1.default.dirname(item));
        let meta_file = upath2_1.default.join(cwd, item);
        let meta = await fs_extra_1.default.readFile(meta_file)
            .then(node_novel_info_1.mdconf_parse)
            .catch(function (err) {
            exports.console.error(err.toString());
            return null;
        });
        ret[item_id] = {
            titles: [],
            tags: [],
        };
        {
            let titles = [];
            titles.push(item_id);
            if (meta) {
                titles.push(...(0, util_1.getNovelTitles)(meta));
                if (meta.novel.author) {
                    ret[item_id].tags.push(meta.novel.author);
                }
            }
            titles = (0, array_hyper_unique_1.array_unique)(titles.filter(v => v));
            if (titles.length == 1 && titles[0] == item_id) {
                titles = null;
            }
            ret[item_id].titles = titles;
        }
        if (meta && meta.novel.tags) {
            ret[item_id].tags = ret[item_id].tags
                .concat(Object.values(meta.novel.tags));
        }
        return ret;
    });
}
function defaultFilter(value) {
    return true;
}
exports.default = exports;
//# sourceMappingURL=index.js.map