"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const globby = require("globby");
const path = require("upath2");
const fs = require("fs-extra");
const node_novel_info_1 = require("node-novel-info");
const array_uniq = require("array-uniq");
const sortObjectKeys = require("sort-object-keys2");
function array_unique(arr) {
    return array_uniq(arr);
}
const DIST_NOVEL_ROOT = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel';
const PATH_MAIN_IDS = [
    'cm',
    'iqing',
    'sfacg',
    'user',
    'uukanshu',
    'webqxs',
    'wenku8',
];
Promise.reduce(PATH_MAIN_IDS, function (total, current, index, arrayLength) {
    total.push(current);
    total.push(current + '_out');
    return total;
}, [])
    .map(function (pathMain) {
    const cwd = path.join(DIST_NOVEL_ROOT, pathMain);
    const IS_OUT = /_out$/.test(pathMain);
    return Promise
        .reduce(globby([
        '*/README.md',
    ], {
        cwd,
    }), async function (ret, item) {
        let item_id = path.basename(path.dirname(item));
        let meta_file = path.join(cwd, item);
        let meta = await fs.readFile(meta_file)
            .then(node_novel_info_1.mdconf_parse)
            .catch(function (err) {
            console.error(err.toString());
            return null;
        });
        ret[item_id] = {};
        {
            let titles = [];
            titles.push(item_id);
            if (meta) {
                titles.push(meta.novel.title);
                titles.push(meta.novel.title_zh);
                titles.push(meta.novel.title_jp);
                titles.push(meta.novel.title_en);
                titles.push(meta.novel.title_short);
                titles.push(meta.novel.title_source);
                if (meta.novel.series) {
                    titles.push(meta.novel.series.name);
                    titles.push(meta.novel.series.name_short);
                }
            }
            titles = array_unique(titles.filter(v => v));
            if (titles.length == 1 && titles[0] == item_id) {
                titles = null;
            }
            ret[item_id].titles = titles;
        }
        if (meta && meta.novel.tags) {
            ret[item_id].tags = array_unique(meta.novel.tags);
        }
        return ret;
    }, {})
        .then(async function (ret) {
        if (!Object.keys(ret).length)
            return null;
        ret = Object.keys(ret)
            .sort()
            .reduce(function (a, item_id) {
            let item = ret[item_id];
            item.link = `[${item_id}](${md_href(item_id)}/)`;
            let target_id = IS_OUT ? pathMain.replace(/_out$/, '') : pathMain + '_out';
            if (fs.existsSync(path.join(DIST_NOVEL_ROOT, target_id, item_id))) {
                item[IS_OUT ? 'link_source' : 'link_output'] = `[${item_id}](../${target_id}/${md_href(item_id)}/)`;
            }
            if (!item.titles) {
                delete item.titles;
            }
            else if (item.titles.length == 1) {
                item.titles = item.titles[0];
            }
            if (item.tags) {
                item.tags = item.tags.join(' , ');
            }
            sortObjectKeys(item, {
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
        await fs.writeFile(path.join(cwd, 'README.md'), md);
    });
});
function md_href(href) {
    return encodeURIComponent(href);
}
