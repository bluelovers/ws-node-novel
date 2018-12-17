"use strict";
/**
 * Created by user on 2018/5/1/001.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
exports.Promise = Promise;
const FastGlob = require("fast-glob");
const path = require("upath2");
const fs = require("fs-extra");
const node_novel_info_1 = require("node-novel-info");
const array_hyper_unique_1 = require("array-hyper-unique");
const sortObjectKeys = require("sort-object-keys2");
const debug_color2_1 = require("debug-color2");
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
    return Promise.resolve(FastGlob([
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
exports.get_ids = get_ids;
function processToc(DIST_NOVEL_ROOT, filter) {
    return get_ids(DIST_NOVEL_ROOT, filter)
        .then(async function (ls) {
        if (!ls.length) {
            return Promise.reject(`get_ids return empty`);
        }
        return ls;
    })
        .tap(function () {
        exports.console.debug(`[TOC] 開始建立 toc 列表`);
    })
        .reduce(async function (toc_ls, pathMain) {
        const cwd = path.join(DIST_NOVEL_ROOT, pathMain);
        const IS_OUT = /_out$/.test(pathMain);
        //console.log(`[TOC] 檢查 ${pathMain}`);
        let bool = false;
        await Promise
            .reduce(FastGlob([
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
                item.link = `[${item_id}](${md_href(item_id)}/)`;
                let target_id = IS_OUT ? pathMain.replace(/_out$/, '') : pathMain + '_out';
                let link_path = path.join(DIST_NOVEL_ROOT, target_id, item_id);
                //console.log(link_path, fs.existsSync(link_path));
                if (fs.existsSync(link_path)) {
                    item[IS_OUT
                        ? 'link_source'
                        : 'link_output'] = `[${item_id}](../${target_id}/${md_href(item_id)}/)`;
                }
                if (Array.isArray(item.titles)) {
                    item.titles = array_hyper_unique_1.array_unique(item.titles)
                        .filter(v => v);
                }
                if (Array.isArray(item.tags)) {
                    item.tags = array_hyper_unique_1.array_unique(item.tags)
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
            //console.log(pathMain, ret);
            //console.log(md);
            await fs.writeFile(path.join(cwd, 'README.md'), md);
        });
        return toc_ls;
    }, {})
        .tap(function () {
        exports.console.debug(`[TOC] 結束建立 toc 列表`);
    });
}
exports.processToc = processToc;
// @ts-ignore
async function createReadmeData(cwd, ret, item) {
    let item_id = path.basename(path.dirname(item));
    let meta_file = path.join(cwd, item);
    let meta = await fs.readFile(meta_file)
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
            titles.push(meta.novel.title);
            titles.push(meta.novel.title_zh);
            titles.push(meta.novel.title_jp);
            titles.push(meta.novel.title_en);
            titles.push(meta.novel.title_short);
            // @ts-ignore
            titles.push(meta.novel.title_tw);
            // @ts-ignore
            titles.push(meta.novel.title_cn);
            // @ts-ignore
            titles.push(meta.novel.title_source);
            // @ts-ignore
            titles.push(meta.novel.title_other);
            // @ts-ignore
            titles.push(meta.novel.title_output);
            if (meta.novel.series) {
                titles.push(meta.novel.series.name);
                titles.push(meta.novel.series.name_short);
            }
            if (meta.novel.author) {
                ret[item_id].tags.push(meta.novel.author);
            }
        }
        titles = array_hyper_unique_1.array_unique(titles.filter(v => v));
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
}
exports.createReadmeData = createReadmeData;
function md_href(href) {
    return href.split('/').map(encodeURIComponent).join('/');
}
exports.md_href = md_href;
function defaultFilter(value) {
    return true;
}
exports.defaultFilter = defaultFilter;
const self = require("./index");
exports.default = self;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0NBQW9DO0FBb0IzQiwwQkFBTztBQW5CaEIsc0NBQXNDO0FBQ3RDLCtCQUFnQztBQUNoQywrQkFBK0I7QUFDL0IscURBQTBGO0FBQzFGLDJEQUFrRDtBQUNsRCxvREFBb0Q7QUFDcEQsK0NBQXVDO0FBQzFCLFFBQUEsT0FBTyxHQUFHLElBQUksc0JBQU8sQ0FBQyxJQUFJLEVBQUU7SUFDeEMsT0FBTyxFQUFFLElBQUk7SUFDYixjQUFjLEVBQUU7UUFDZixNQUFNLEVBQUUsSUFBSTtLQUNaO0lBQ0QsWUFBWSxFQUFFO1FBQ2IsT0FBTyxFQUFFLElBQUk7S0FDYjtDQUNELENBQUMsQ0FBQztBQUVILGVBQU8sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBSTVCLFNBQWdCLE9BQU8sQ0FBQyxHQUFXLEVBQUUsTUFBNkI7SUFFakUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBUztRQUN0QyxHQUFHO1FBQ0gsT0FBTztRQUNQLEtBQUs7UUFDTCxRQUFRO1FBQ1IsTUFBTTtLQUNOLEVBQUU7UUFDRixJQUFJLEVBQUUsQ0FBQztRQUNQLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLEdBQUc7S0FDSCxDQUFDLENBQUM7U0FDRixJQUFJLENBQUMsVUFBVSxFQUFFO1FBRWpCLElBQUksTUFBTSxFQUNWO1lBQ0MsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWCxDQUFDLENBQUMsQ0FDRDtBQUNILENBQUM7QUF4QkQsMEJBd0JDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLGVBQXVCLEVBQUUsTUFBNkI7SUFFaEYsT0FBTyxPQUFPLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQztTQUNyQyxJQUFJLENB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QyxJQUFJLE9BQU8sRUFDOUM7WUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ2Q7UUFFRCxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztLQUM3QjtJQUVELElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUMzQjtRQUNDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUk7YUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUN2QztLQUNEO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBMUVELDRDQTBFQztBQUVELFNBQWdCLE9BQU8sQ0FBQyxJQUFZO0lBRW5DLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUhELDBCQUdDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEtBQWE7SUFFMUMsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBSEQsc0NBR0M7QUFFRCxnQ0FBZ0M7QUFDaEMsa0JBQWUsSUFBSSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC81LzEvMDAxLlxuICovXG5cbmltcG9ydCAqIGFzIFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0ICogYXMgRmFzdEdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IG1kY29uZl9wYXJzZSwgSU1kY29uZk1ldGEsIHN0cmluZ2lmeSwgbWRjb25mIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgKiBhcyBzb3J0T2JqZWN0S2V5cyBmcm9tICdzb3J0LW9iamVjdC1rZXlzMic7XG5pbXBvcnQgeyBDb25zb2xlIH0gZnJvbSAnZGVidWctY29sb3IyJztcbmV4cG9ydCBjb25zdCBjb25zb2xlID0gbmV3IENvbnNvbGUobnVsbCwge1xuXHRlbmFibGVkOiB0cnVlLFxuXHRpbnNwZWN0T3B0aW9uczoge1xuXHRcdGNvbG9yczogdHJ1ZSxcblx0fSxcblx0Y2hhbGtPcHRpb25zOiB7XG5cdFx0ZW5hYmxlZDogdHJ1ZSxcblx0fSxcbn0pO1xuXG5jb25zb2xlLmVuYWJsZWRDb2xvciA9IHRydWU7XG5cbmV4cG9ydCB7IFByb21pc2UgfVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2lkcyhjd2Q6IHN0cmluZywgZmlsdGVyPzogdHlwZW9mIGRlZmF1bHRGaWx0ZXIpXG57XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoRmFzdEdsb2I8c3RyaW5nPihbXG5cdFx0XHQnKicsXG5cdFx0XHQnIWRvY3MnLFxuXHRcdFx0JyEuKicsXG5cdFx0XHQnISoucmF3Jyxcblx0XHRcdCchcmF3Jyxcblx0XHRdLCB7XG5cdFx0XHRkZWVwOiAxLFxuXHRcdFx0b25seURpcmVjdG9yaWVzOiB0cnVlLFxuXHRcdFx0bWFya0RpcmVjdG9yaWVzOiBmYWxzZSxcblx0XHRcdGN3ZCxcblx0XHR9KSlcblx0XHQudGhlbihmdW5jdGlvbiAobHMpXG5cdFx0e1xuXHRcdFx0aWYgKGZpbHRlcilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGxzLmZpbHRlcihmaWx0ZXIpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbHM7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzVG9jKERJU1RfTk9WRUxfUk9PVDogc3RyaW5nLCBmaWx0ZXI/OiB0eXBlb2YgZGVmYXVsdEZpbHRlcilcbntcblx0cmV0dXJuIGdldF9pZHMoRElTVF9OT1ZFTF9ST09ULCBmaWx0ZXIpXG5cdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGxzKVxuXHRcdHtcblx0XHRcdGlmICghbHMubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoYGdldF9pZHMgcmV0dXJuIGVtcHR5YClcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxzO1xuXHRcdH0pXG5cdFx0LnRhcChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZGVidWcoYFtUT0NdIOmWi+Wni+W7uueriyB0b2Mg5YiX6KGoYCk7XG5cdFx0fSlcblx0XHQucmVkdWNlKGFzeW5jIGZ1bmN0aW9uICh0b2NfbHMsIHBhdGhNYWluOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0Y29uc3QgY3dkID0gcGF0aC5qb2luKERJU1RfTk9WRUxfUk9PVCwgcGF0aE1haW4pO1xuXG5cdFx0XHRjb25zdCBJU19PVVQgPSAvX291dCQvLnRlc3QocGF0aE1haW4pO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKGBbVE9DXSDmqqLmn6UgJHtwYXRoTWFpbn1gKTtcblxuXHRcdFx0bGV0IGJvb2wgPSBmYWxzZTtcblxuXHRcdFx0YXdhaXQgUHJvbWlzZVxuXHRcdFx0XHQucmVkdWNlKEZhc3RHbG9iPHN0cmluZz4oW1xuXHRcdFx0XHRcdCcqL1JFQURNRS5tZCcsXG5cdFx0XHRcdF0sIHtcblx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdH0pLCBmdW5jdGlvbiAocmV0OiBJUmV0LCBpdGVtKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZVJlYWRtZURhdGEoY3dkLCByZXQsIGl0ZW0pO1xuXHRcdFx0XHR9LCB7fSBhcyBJUmV0KVxuXHRcdFx0XHQudGFwKGFzeW5jIGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIU9iamVjdC5rZXlzKHJldCkubGVuZ3RoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGUuZ3JheShgW1RPQ10g5b+955WlICR7cGF0aE1haW59YCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblxuXHRcdFx0XHRcdGNvbnNvbGUuZGVidWcoYFtUT0NdIOiZleeQhiAke3BhdGhNYWlufWApO1xuXG5cdFx0XHRcdFx0dG9jX2xzW3BhdGhNYWluXSA9IHJldDtcblxuXHRcdFx0XHRcdHJldCA9IE9iamVjdC5rZXlzKHJldClcblx0XHRcdFx0XHRcdC5zb3J0KClcblx0XHRcdFx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGl0ZW1faWQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBpdGVtID0gcmV0W2l0ZW1faWRdO1xuXG5cdFx0XHRcdFx0XHRcdGl0ZW0ubGluayA9IGBbJHtpdGVtX2lkfV0oJHttZF9ocmVmKGl0ZW1faWQpfS8pYDtcblxuXHRcdFx0XHRcdFx0XHRsZXQgdGFyZ2V0X2lkID0gSVNfT1VUID8gcGF0aE1haW4ucmVwbGFjZSgvX291dCQvLCAnJykgOiBwYXRoTWFpbiArICdfb3V0JztcblxuXHRcdFx0XHRcdFx0XHRsZXQgbGlua19wYXRoID0gcGF0aC5qb2luKERJU1RfTk9WRUxfUk9PVCwgdGFyZ2V0X2lkLCBpdGVtX2lkKTtcblxuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGxpbmtfcGF0aCwgZnMuZXhpc3RzU3luYyhsaW5rX3BhdGgpKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoZnMuZXhpc3RzU3luYyhsaW5rX3BhdGgpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aXRlbVtJU19PVVRcblx0XHRcdFx0XHRcdFx0XHRcdD8gJ2xpbmtfc291cmNlJ1xuXHRcdFx0XHRcdFx0XHRcdFx0OiAnbGlua19vdXRwdXQnXSA9IGBbJHtpdGVtX2lkfV0oLi4vJHt0YXJnZXRfaWR9LyR7bWRfaHJlZihpdGVtX2lkKX0vKWA7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShpdGVtLnRpdGxlcykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpdGVtLnRpdGxlcyA9IGFycmF5X3VuaXF1ZShpdGVtLnRpdGxlcylcblx0XHRcdFx0XHRcdFx0XHRcdC5maWx0ZXIodiA9PiB2KVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGl0ZW0udGFncykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpdGVtLnRhZ3MgPSBhcnJheV91bmlxdWUoaXRlbS50YWdzKVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbHRlcih2ID0+IHYpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFpdGVtLnRpdGxlcylcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSBpdGVtLnRpdGxlcztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlIGlmIChpdGVtLnRpdGxlcy5sZW5ndGggPT0gMSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHRpdGVtLnRpdGxlcyA9IGl0ZW0udGl0bGVzWzBdO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGl0ZW0udGFncylcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHRpdGVtLnRhZ3MgPSBpdGVtLnRhZ3Muam9pbignICwgJyk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRzb3J0T2JqZWN0S2V5cyhpdGVtLCB7XG5cdFx0XHRcdFx0XHRcdFx0dXNlU291cmNlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdGtleXM6IFtcblx0XHRcdFx0XHRcdFx0XHRcdCdsaW5rJyxcblx0XHRcdFx0XHRcdFx0XHRcdCdsaW5rX291dHB1dCcsXG5cdFx0XHRcdFx0XHRcdFx0XHQnbGlua19zb3VyY2UnLFxuXHRcdFx0XHRcdFx0XHRcdFx0J3RpdGxlcycsXG5cdFx0XHRcdFx0XHRcdFx0XHQndGFncycsXG5cdFx0XHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0YVtpdGVtX2lkXSA9IGl0ZW07XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdFx0XHR9LCB7fSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRsZXQgbWQgPSBtZGNvbmYuc3RyaW5naWZ5KHtcblx0XHRcdFx0XHRcdHRvYzogcmV0LFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhwYXRoTWFpbiwgcmV0KTtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG1kKTtcblxuXHRcdFx0XHRcdGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oY3dkLCAnUkVBRE1FLm1kJyksIG1kKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRyZXR1cm4gdG9jX2xzO1xuXHRcdH0sIHt9IGFzIHtcblx0XHRcdFtrOiBzdHJpbmddOiBJUmV0LFxuXHRcdH0pXG5cdFx0LnRhcChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZGVidWcoYFtUT0NdIOe1kOadn+W7uueriyB0b2Mg5YiX6KGoYCk7XG5cdFx0fSlcblx0XHQ7XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmV0Um93XG57XG5cdHRpdGxlczogc3RyaW5nW10sXG5cdHRhZ3M/OiBzdHJpbmdbXSxcblxuXHRsaW5rPzogc3RyaW5nLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElSZXRcbntcblx0W2s6IHN0cmluZ106IElSZXRSb3dcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlYWRtZURhdGEoY3dkOiBzdHJpbmcsIHJldDogSVJldCwgaXRlbTogc3RyaW5nKTogUHJvbWlzZTxJUmV0PlxuLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVJlYWRtZURhdGEoY3dkOiBzdHJpbmcsIHJldDogSVJldCwgaXRlbTogc3RyaW5nKTogUHJvbWlzZTxJUmV0Plxue1xuXHRsZXQgaXRlbV9pZCA9IHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKGl0ZW0pKTtcblxuXHRsZXQgbWV0YV9maWxlID0gcGF0aC5qb2luKGN3ZCwgaXRlbSk7XG5cblx0bGV0IG1ldGE6IElNZGNvbmZNZXRhID0gYXdhaXQgZnMucmVhZEZpbGUobWV0YV9maWxlKVxuXHRcdC50aGVuKG1kY29uZl9wYXJzZSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycilcblx0XHR7XG5cdFx0XHRjb25zb2xlLmVycm9yKGVyci50b1N0cmluZygpKTtcblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSlcblx0O1xuXG5cdHJldFtpdGVtX2lkXSA9IHtcblx0XHR0aXRsZXM6IFtdLFxuXHRcdHRhZ3M6IFtdLFxuXHR9O1xuXG5cdHtcblx0XHRsZXQgdGl0bGVzID0gW10gYXMgc3RyaW5nW107XG5cblx0XHR0aXRsZXMucHVzaChpdGVtX2lkKTtcblxuXHRcdGlmIChtZXRhKVxuXHRcdHtcblx0XHRcdHRpdGxlcy5wdXNoKG1ldGEubm92ZWwudGl0bGUpO1xuXHRcdFx0dGl0bGVzLnB1c2gobWV0YS5ub3ZlbC50aXRsZV96aCk7XG5cdFx0XHR0aXRsZXMucHVzaChtZXRhLm5vdmVsLnRpdGxlX2pwKTtcblx0XHRcdHRpdGxlcy5wdXNoKG1ldGEubm92ZWwudGl0bGVfZW4pO1xuXHRcdFx0dGl0bGVzLnB1c2gobWV0YS5ub3ZlbC50aXRsZV9zaG9ydCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aXRsZXMucHVzaChtZXRhLm5vdmVsLnRpdGxlX3R3KTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRpdGxlcy5wdXNoKG1ldGEubm92ZWwudGl0bGVfY24pO1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dGl0bGVzLnB1c2gobWV0YS5ub3ZlbC50aXRsZV9zb3VyY2UpO1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dGl0bGVzLnB1c2gobWV0YS5ub3ZlbC50aXRsZV9vdGhlcik7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aXRsZXMucHVzaChtZXRhLm5vdmVsLnRpdGxlX291dHB1dCk7XG5cblx0XHRcdGlmIChtZXRhLm5vdmVsLnNlcmllcylcblx0XHRcdHtcblx0XHRcdFx0dGl0bGVzLnB1c2gobWV0YS5ub3ZlbC5zZXJpZXMubmFtZSk7XG5cdFx0XHRcdHRpdGxlcy5wdXNoKG1ldGEubm92ZWwuc2VyaWVzLm5hbWVfc2hvcnQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobWV0YS5ub3ZlbC5hdXRob3IpXG5cdFx0XHR7XG5cdFx0XHRcdHJldFtpdGVtX2lkXS50YWdzLnB1c2gobWV0YS5ub3ZlbC5hdXRob3IpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGl0bGVzID0gYXJyYXlfdW5pcXVlKHRpdGxlcy5maWx0ZXIodiA9PiB2KSk7XG5cblx0XHRpZiAodGl0bGVzLmxlbmd0aCA9PSAxICYmIHRpdGxlc1swXSA9PSBpdGVtX2lkKVxuXHRcdHtcblx0XHRcdHRpdGxlcyA9IG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0W2l0ZW1faWRdLnRpdGxlcyA9IHRpdGxlcztcblx0fVxuXG5cdGlmIChtZXRhICYmIG1ldGEubm92ZWwudGFncylcblx0e1xuXHRcdHJldFtpdGVtX2lkXS50YWdzID0gcmV0W2l0ZW1faWRdLnRhZ3Ncblx0XHRcdC5jb25jYXQoT2JqZWN0LnZhbHVlcyhtZXRhLm5vdmVsLnRhZ3MpKVxuXHRcdDtcblx0fVxuXG5cdHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZF9ocmVmKGhyZWY6IHN0cmluZylcbntcblx0cmV0dXJuIGhyZWYuc3BsaXQoJy8nKS5tYXAoZW5jb2RlVVJJQ29tcG9uZW50KS5qb2luKCcvJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0RmlsdGVyKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuXG57XG5cdHJldHVybiB0cnVlO1xufVxuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gJy4vaW5kZXgnO1xuZXhwb3J0IGRlZmF1bHQgc2VsZlxuIl19